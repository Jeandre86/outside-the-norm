import { z } from 'zod';
const text = (n: number) => z.string().trim().max(n);
const money = z.number().int().min(0).max(100000000);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Invalid date');
export const clientSchema = z.object({ id: z.string().uuid(), name: text(150).min(1), contact: text(120), email: z.union([z.literal(''), z.string().email().max(254)]), phone: text(60), address: text(800), taxNumber: text(80), notes: text(2000) });
export const settingsSchema = z.object({ name: text(150).min(1), email: z.string().email().max(254), replyTo: z.string().email().max(254), address: text(800), phone: text(60), taxNumber: text(80), bankDetails: text(1200), currency: z.enum(['ZAR', 'USD', 'GBP', 'EUR']), prefix: z.string().regex(/^[A-Z0-9-]{1,15}$/), nextNumber: z.number().int().min(1).max(9999999), termsDays: z.number().int().min(0).max(365), terms: text(2000), taxRate: z.number().int().min(0).max(10000), emailProvider: z.enum(['gmail', 'resend']) });
export const itemSchema = z.object({ description: text(1000).min(1), quantity: z.number().positive().max(10000).multipleOf(.01), rate: money, discount: z.number().int().min(0).max(10000) });
export const draftSchema = z.object({ clientId: z.string().uuid(), date, dueDate: date, reference: text(150), currency: z.enum(['ZAR', 'USD', 'GBP', 'EUR']), items: z.array(itemSchema).min(1).max(60), taxRate: z.number().int().min(0).max(10000), notes: text(2000), terms: text(2000) }).refine(v => v.dueDate >= v.date, 'Due date must be on or after invoice date');
export const presetSchema = z.object({ id: z.string().uuid(), name: text(100).min(1), description: text(1000).min(1), rate: money });
export type Client = z.infer<typeof clientSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type Draft = z.infer<typeof draftSchema>;
export type Preset = z.infer<typeof presetSchema>;
export type Payment = {
    id: string;
    date: string;
    amount: number;
    reference: string;
    voidedAt?: string;
    voidReason?: string;
};
export type SendAttempt = {
    id: string;
    date: string;
    to: string;
    subject: string;
    message: string;
    status: 'sending' | 'accepted' | 'failed' | 'unknown';
    providerId?: string;
    error?: string;
};
export type Invoice = Draft & {
    id: string;
    number: string;
    createdAt: string;
    issuedAt?: string;
    sentAt?: string;
    cancelledAt?: string;
    cancelReason?: string;
    client?: Client;
    studio?: Settings;
    payments: Payment[];
    history: {
        date: string;
        message: string;
    }[];
    emails: SendAttempt[];
};
export type Billing = {
    settings: Settings;
    clients: Client[];
    presets: Preset[];
    invoices: Invoice[];
    requests: string[];
    requestResults?: Record<string, string>;
};
export function newBilling(): Billing { return { settings: { name: 'Outside the Norm', email: 'swemmerx@gmail.com', replyTo: 'swemmerx@gmail.com', address: '', phone: '', taxNumber: '', bankDetails: '', currency: 'ZAR', prefix: 'OTN-', nextNumber: 1, termsDays: 14, terms: 'Thank you for choosing Outside the Norm. Please use the invoice number as your payment reference.', taxRate: 0, emailProvider: 'gmail' }, clients: [], presets: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Logo design', description: 'Logo design', rate: 0 }, { id: '22222222-2222-4222-8222-222222222222', name: 'Brand identity', description: 'Brand identity', rate: 0 }, { id: '33333333-3333-4333-8333-333333333333', name: 'Website & app design', description: 'Website & app design', rate: 0 }], invoices: [], requests: [] }; }
export function totals(i: Pick<Invoice, 'items' | 'taxRate' | 'payments'>) { const gross = i.items.reduce((n, x) => n + Math.round(x.quantity * x.rate), 0); const subtotal = i.items.reduce((n, x) => n + Math.round(Math.round(x.quantity * x.rate) * (10000 - x.discount) / 10000), 0); const tax = Math.round(subtotal * i.taxRate / 10000); const total = subtotal + tax; const paid = i.payments.filter(p => !p.voidedAt).reduce((n, p) => n + p.amount, 0); return { gross, discount: gross - subtotal, subtotal, tax, total, paid, balance: total - paid }; }
export function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
export function status(i: Invoice) {
    if (i.cancelledAt)
        return 'Cancelled';
    if (!i.issuedAt)
        return 'Draft';
    const t = totals(i);
    if (t.balance <= 0)
        return 'Paid';
    if (i.dueDate < today())
        return 'Overdue';
    if (t.paid > 0)
        return 'Part-paid';
    return i.sentAt ? 'Sent' : 'Issued';
}
export function moneyText(n: number, currency = 'ZAR') { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(n / 100); }
export const commandSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('client'), client: clientSchema }),
    z.object({ type: z.literal('deleteClient'), id: z.string().uuid() }),
    z.object({ type: z.literal('settings'), settings: settingsSchema }),
    z.object({ type: z.literal('presets'), presets: z.array(presetSchema).max(100) }),
    z.object({ type: z.literal('draft'), id: z.string().uuid().optional(), draft: draftSchema }),
    z.object({ type: z.literal('duplicate'), id: z.string().uuid() }),
    z.object({ type: z.literal('deleteDraft'), id: z.string().uuid() }),
    z.object({ type: z.literal('issue'), id: z.string().uuid(), draft: draftSchema.optional(), details: z.object({ address: text(800).min(1, 'Enter your billing address.'), bankDetails: text(1200).min(1, 'Enter banking details or payment instructions.'), taxNumber: text(80) }).optional() }),
    z.object({ type: z.literal('reopen'), id: z.string().uuid(), reason: text(300).min(1) }),
    z.object({ type: z.literal('unpaid'), id: z.string().uuid(), reason: text(300).min(1) }),
    z.object({ type: z.literal('sent'), id: z.string().uuid() }),
    z.object({ type: z.literal('payment'), id: z.string().uuid(), date, amount: money.refine(v => v > 0), reference: text(200) }),
    z.object({ type: z.literal('voidPayment'), id: z.string().uuid(), paymentId: z.string().uuid(), reason: text(300).min(1) }),
    z.object({ type: z.literal('cancel'), id: z.string().uuid(), reason: text(300).min(1) }),
    z.object({ type: z.literal('resolveEmail'), id: z.string().uuid(), attemptId: z.string().uuid(), wasSent: z.boolean() })
]);
export function applyCommand(b: Billing, c: z.infer<typeof commandSchema>, now = new Date().toISOString()) {
    const log = (i: Invoice, message: string) => i.history.push({ date: now, message });
    if (c.type === 'client') {
        const old = b.clients.findIndex(x => x.id === c.client.id);
        if (old < 0)
            b.clients.push(c.client);
        else
            b.clients[old] = c.client;
        return c.client.id;
    }
    if (c.type === 'deleteClient') {
        if (b.invoices.some(i => i.clientId === c.id))
            throw Error('This client has invoices and must be retained.');
        b.clients = b.clients.filter(x => x.id !== c.id);
        return;
    }
    if (c.type === 'settings') {
        if (c.settings.nextNumber < b.settings.nextNumber)
            throw Error('Next invoice number cannot be reduced.');
        b.settings = c.settings;
        return;
    }
    if (c.type === 'presets') {
        b.presets = c.presets;
        return;
    }
    if (c.type === 'draft') {
        if (!b.clients.some(x => x.id === c.draft.clientId))
            throw Error('Choose an existing client.');
        const i = c.id ? b.invoices.find(x => x.id === c.id) : undefined;
        if (c.id && !i)
            throw Error('Invoice not found.');
        if (i) {
            if (i.issuedAt)
                throw Error('Issued invoices cannot be edited. Duplicate it to create a new draft.');
            Object.assign(i, c.draft);
            log(i, 'Draft updated');
            return i.id;
        }
        const id = crypto.randomUUID();
        b.invoices.unshift({ ...c.draft, id, number: '', createdAt: now, payments: [], history: [{ date: now, message: 'Draft created' }], emails: [] });
        return id;
    }
    const i = b.invoices.find(x => x.id === c.id);
    if (!i)
        throw Error('Invoice not found.');
    if (c.type === 'duplicate') {
        const id = crypto.randomUUID();
        b.invoices.unshift({ ...i, id, number: '', date: today(), dueDate: new Date(Date.parse(today()) + b.settings.termsDays * 86400000).toISOString().slice(0, 10), createdAt: now, issuedAt: undefined, sentAt: undefined, cancelledAt: undefined, cancelReason: undefined, client: undefined, studio: undefined, payments: [], emails: [], history: [{ date: now, message: 'Duplicated from ' + (i.number || 'draft') }] });
        return id;
    }
    if (c.type === 'deleteDraft') {
        if (i.issuedAt)
            throw Error('Issued invoices cannot be deleted.');
        b.invoices = b.invoices.filter(x => x.id !== i.id);
        return;
    }
    if (c.type === 'issue') {
        if (i.issuedAt)
            throw Error('Invoice is already issued.');
        const draft = c.draft || i;
        const client = b.clients.find(x => x.id === draft.clientId);
        if (!client)
            throw Error('Client not found.');
        const settings = { ...b.settings, ...c.details };
        if (!settings.address.trim())
            throw Error('Enter your billing address below before issuing.');
        if (!settings.bankDetails.trim())
            throw Error('Enter banking details or payment instructions below before issuing.');
        if (draft.taxRate > 0 && !settings.taxNumber.trim())
            throw Error('Add your tax registration number before charging tax.');
        const number = b.settings.prefix + String(b.settings.nextNumber).padStart(5, '0');
        if (b.invoices.some(x => x.number === number))
            throw Error('Invoice number already exists. Change the next number in Settings.');
        if (c.draft) { Object.assign(i, c.draft); log(i, 'Draft saved before issuing'); }
        i.number = number;
        b.settings = { ...settings, nextNumber: settings.nextNumber + 1 };
        i.client = structuredClone(client);
        i.studio = structuredClone(b.settings);
        i.issuedAt = now;
        log(i, 'Invoice issued');
        return i.id;
    }
    if (c.type === 'reopen') {
        if (!i.issuedAt || !i.cancelledAt) throw Error('Only cancelled invoices can be reopened.');
        i.cancelledAt = undefined;
        i.cancelReason = undefined;
        log(i, 'Reopened: ' + c.reason);
        return i.id;
    }
    if (!i.issuedAt || i.cancelledAt)
        throw Error('This action requires an active, issued invoice.');
    if (c.type === 'unpaid') {
        for (const payment of i.payments.filter(p => !p.voidedAt)) {
            payment.voidedAt = now;
            payment.voidReason = c.reason;
        }
        log(i, 'Marked unpaid; recorded payments reversed: ' + c.reason);
    }
    if (c.type === 'sent') {
        i.sentAt = now;
        log(i, 'Marked sent manually');
    }
    if (c.type === 'payment') {
        if (c.date > today())
            throw Error('Payment date cannot be in the future.');
        if (c.amount > totals(i).balance)
            throw Error('Payment exceeds the outstanding balance.');
        i.payments.push({ id: crypto.randomUUID(), date: c.date, amount: c.amount, reference: c.reference });
        log(i, 'Payment recorded: ' + moneyText(c.amount, i.currency));
    }
    if (c.type === 'voidPayment') {
        const p = i.payments.find(x => x.id === c.paymentId);
        if (!p || p.voidedAt)
            throw Error('Active payment not found.');
        p.voidedAt = now;
        p.voidReason = c.reason;
        log(i, 'Payment reversed: ' + c.reason);
    }
    if (c.type === 'cancel') {
        if (i.emails.some(a => a.status === 'sending' || a.status === 'unknown'))
            throw Error('Resolve the pending email attempt before cancelling.');
        if (totals(i).paid > 0)
            throw Error('Reverse recorded payments before cancelling.');
        i.cancelledAt = now;
        i.cancelReason = c.reason;
        log(i, 'Cancelled: ' + c.reason);
    }
    if (c.type === 'resolveEmail') {
        const a = i.emails.find(x => x.id === c.attemptId);
        if (!a || !['unknown', 'sending'].includes(a.status))
            throw Error('No unresolved email attempt.');
        if (a.status === 'sending' && Date.now() - Date.parse(a.date) < 120000)
            throw Error('Email is still processing. Wait two minutes.');
        a.status = c.wasSent ? 'accepted' : 'failed';
        a.error = 'Manually reconciled against mailbox by owner';
        if (c.wasSent)
            i.sentAt = now;
        log(i, 'Email manually reconciled as ' + (c.wasSent ? 'sent' : 'not sent'));
    }
    return i.id;
}
