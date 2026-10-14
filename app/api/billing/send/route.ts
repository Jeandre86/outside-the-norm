import { z } from 'zod';
import { isEditor, sameOrigin } from '@/lib/editor-auth';
import { readBilling, saveBilling } from '@/lib/billing-storage';
import { invoicePdf } from '@/lib/invoice-pdf';
import { mailStatus, sendInvoiceMail } from '@/lib/billing-email';
const headers = { 'Cache-Control': 'private, no-store' };
export async function POST(r: Request) {
    if (!sameOrigin(r) || !await isEditor())
        return new Response(null, { status: 403 });
    let attemptId = '';
    let invoiceId = '';
    try {
        const body = await r.text();
        if (body.length > 20000)
            return new Response(null, { status: 413 });
        const input = z.object({ id: z.string().uuid(), revision: z.number().int(), attemptId: z.string().uuid(), to: z.string().email().max(254), subject: z.string().trim().min(1).max(200).regex(/^[^\r\n]+$/), message: z.string().trim().min(1).max(10000) }).parse(JSON.parse(body));
        const { billing, revision } = await readBilling();
        if (revision !== input.revision)
            throw Error('Records changed. Reload before sending.');
        const i = billing.invoices.find(x => x.id === input.id);
        if (!i?.issuedAt || i.cancelledAt)
            throw Error('Issue an active invoice before sending.');
        if (i.emails.some(e => e.id === input.attemptId || e.status === 'sending' || e.status === 'unknown'))
            throw Error('Previous send attempt exists. Review the email history before sending again.');
        const ready = mailStatus();
        if (!ready[billing.settings.emailProvider])
            throw Error('Email is not connected. Download the PDF to send manually for now.');
        if (billing.settings.emailProvider === 'gmail' && billing.settings.email.toLowerCase() !== ready.gmailSender.toLowerCase())
            throw Error('Sender must match the connected Gmail account.');
        const pdf = await invoicePdf(i, billing);
        i.emails.push({ id: input.attemptId, date: new Date().toISOString(), to: input.to, subject: input.subject, message: input.message, status: 'sending' });
        await saveBilling(billing, revision);
        attemptId = input.attemptId;
        invoiceId = i.id;
        const providerId = await sendInvoiceMail(billing.settings, input.to, input.subject, input.message, pdf, i.number + '.pdf', attemptId);
        for (let retry = 0; retry < 4; retry++) {
            const fresh = await readBilling();
            const invoice = fresh.billing.invoices.find(x => x.id === invoiceId)!;
            const a = invoice.emails.find(x => x.id === attemptId)!;
            a.status = 'accepted';
            a.providerId = providerId;
            invoice.sentAt = new Date().toISOString();
            invoice.history.push({ date: invoice.sentAt, message: 'Email accepted by ' + billing.settings.emailProvider + ' for ' + input.to });
            try {
                await saveBilling(fresh.billing, fresh.revision);
                return Response.json({ ok: true, message: 'Email accepted by the mail service. This is not a delivery receipt.' }, { headers });
            }
            catch {
                if (retry === 3)
                    throw Error('Email was accepted, but its status could not be saved. Check Sent mail before any retry.');
            }
        }
    }
    catch (e) {
        const message = e instanceof z.ZodError ? 'Check recipient, subject and message.' : e instanceof Error ? e.message : 'Unable to send email.';
        if (attemptId) {
            try {
                const fresh = await readBilling();
                const a = fresh.billing.invoices.find(x => x.id === invoiceId)?.emails.find(x => x.id === attemptId);
                if (a && a.status !== 'accepted') {
                    a.status = 'unknown';
                    a.error = message;
                    await saveBilling(fresh.billing, fresh.revision);
                }
            }
            catch { }
        }
        return Response.json({ error: message }, { status: 400, headers });
    }
    return Response.json({ error: 'Unable to confirm sending.' }, { status: 503, headers });
}
