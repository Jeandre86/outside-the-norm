import { env } from 'cloudflare:workers';
import type { Settings } from './billing';
type MailEnv = {
    GMAIL_CLIENT_ID?: string;
    GMAIL_CLIENT_SECRET?: string;
    GMAIL_REFRESH_TOKEN?: string;
    GMAIL_SENDER_EMAIL?: string;
    RESEND_API_KEY?: string;
};
function config() { return env as unknown as MailEnv; }
export function mailStatus() { const e = config(); return { gmail: !!(e.GMAIL_CLIENT_ID && e.GMAIL_CLIENT_SECRET && e.GMAIL_REFRESH_TOKEN && e.GMAIL_SENDER_EMAIL), gmailSender: e.GMAIL_SENDER_EMAIL || '', resend: !!e.RESEND_API_KEY }; }
export function base64(bytes: Uint8Array) { let s = ''; for (let n = 0; n < bytes.length; n += 8192)
    s += String.fromCharCode(...bytes.subarray(n, n + 8192)); return btoa(s); }
const utf8 = (s: string) => base64(new TextEncoder().encode(s));
export async function sendInvoiceMail(settings: Settings, to: string, subject: string, message: string, pdf: Uint8Array, filename: string, attemptId: string) {
    const e = config();
    if (settings.emailProvider === 'gmail') {
        if (!mailStatus().gmail)
            throw Error('Connect Gmail in hosting email settings before sending.');
        if (settings.email.toLowerCase() !== e.GMAIL_SENDER_EMAIL?.toLowerCase())
            throw Error('Sender must match the connected Gmail account.');
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: e.GMAIL_CLIENT_ID!, client_secret: e.GMAIL_CLIENT_SECRET!, refresh_token: e.GMAIL_REFRESH_TOKEN!, grant_type: 'refresh_token' }), signal: AbortSignal.timeout(15000) });
        const token = await tokenResponse.json() as {
            access_token?: string;
        };
        if (!tokenResponse.ok || !token.access_token)
            throw Error('Gmail connection needs attention. Reconnect before sending.');
        const boundary = 'otn_' + attemptId;
        const mime = [`From: =?UTF-8?B?${utf8(settings.name)}?= <${settings.email}>`, `To: ${to}`, `Reply-To: ${settings.replyTo}`, `Subject: =?UTF-8?B?${utf8(subject)}?=`, `Message-ID: <${attemptId}@outside-the-norm.invoice>`, `MIME-Version: 1.0`, `Content-Type: multipart/mixed; boundary="${boundary}"`, '', `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', utf8(message), `--${boundary}`, 'Content-Type: application/pdf', `Content-Disposition: attachment; filename="${filename}"`, 'Content-Transfer-Encoding: base64', '', base64(pdf).match(/.{1,76}/g)!.join('\r\n'), `--${boundary}--`].join('\r\n');
        const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', headers: { Authorization: 'Bearer ' + token.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify({ raw: utf8(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }), signal: AbortSignal.timeout(20000) });
        const d = await r.json() as {
            id?: string;
        };
        if (!r.ok || !d.id)
            throw Error('Gmail did not confirm sending. Check Sent mail before retrying.');
        return d.id;
    }
    if (!e.RESEND_API_KEY)
        throw Error('Configure the mail service before sending.');
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + e.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': attemptId }, body: JSON.stringify({ from: `${settings.name.replace(/[<>\r\n]/g, '')} <${settings.email}>`, to: [to], reply_to: settings.replyTo, subject, text: message, attachments: [{ filename, content: base64(pdf) }] }), signal: AbortSignal.timeout(20000) });
    const d = await r.json() as {
        id?: string;
    };
    if (!r.ok || !d.id)
        throw Error('Mail service did not confirm sending. Verify your sender and check the mail service before retrying.');
    return d.id;
}
