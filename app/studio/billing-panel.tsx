'use client';
import { useEffect, useState, useRef } from 'react';
import { newBilling, totals, status, today, moneyText, type Billing, type Client, type Draft, type Invoice, type Settings } from '@/lib/billing';
import { Button } from '@/components/ui/button';
export type BillingTab = 'dashboard' | 'clients' | 'invoices' | 'services' | 'settings';
type Mail = {
    gmail: boolean;
    resend: boolean;
    gmailSender: string;
};
type BillingResponse = {
    billing: Billing;
    revision: number;
    mail: Mail;
    selectedId?: string;
    error?: string;
    message?: string;
};
const blankClient = (): Client => ({ id: crypto.randomUUID(), name: '', contact: '', email: '', phone: '', address: '', taxNumber: '', notes: '' });
const datePlus = (days: number) => new Date(Date.parse(today()) + days * 86400000).toISOString().slice(0, 10);
function Field({ label, value, onChange, type = 'text', required = false }: {
    label: string;
    value: string | number;
    onChange: (s: string) => void;
    type?: string;
    required?: boolean;
}) { return <label>{label}<input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} step={type === 'number' ? '0.01' : undefined}/></label>; }
function Area({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (s: string) => void;
}) { return <label>{label}<textarea rows={3} value={value} onChange={e => onChange(e.target.value)}/></label>; }
export default function BillingPanel({ tab, onDirtyChange }: {
    tab: BillingTab;
    onDirtyChange: (dirty: boolean) => void;
}) {
    const [b, setB] = useState<Billing>(newBilling), [rev, setRev] = useState(0), [mail, setMail] = useState<Mail>({ gmail: false, resend: false, gmailSender: '' }), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [notice, setNotice] = useState('Loading studio records…');
    const [issueOpen, setIssueOpen] = useState(false), [actionError, setActionError] = useState('');
    const [client, setClient] = useState<Client | null>(null), [selected, setSelected] = useState<string | null>(null), [creating, setCreating] = useState(false), [preview, setPreview] = useState(false), [emailOpen, setEmailOpen] = useState(false), [search, setSearch] = useState(''), [filter, setFilter] = useState('All'), [dirty, setDirty] = useState(false);
    async function load() {
        try {
            const r = await fetch('/api/billing', { cache: 'no-store' });
            const d = await r.json() as BillingResponse;
            if (!r.ok)
                throw Error(d.error || 'Unable to load billing.');
            setB(d.billing);
            setRev(d.revision);
            setMail(d.mail);
            setReady(true);
            setActionError('');
            setNotice('');
            setDirty(false);
        }
        catch (e) {
            setNotice(e instanceof Error ? e.message : 'Unable to load billing.');
        }
    }
    useEffect(() => { void load(); }, []);
    useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
    useEffect(() => {
        const warn = (e: BeforeUnloadEvent) => {
            if (dirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);
    function leave() { return !dirty || confirm('Discard unsaved changes?'); }
    const pendingRequest = useRef<{
        key: string;
        id: string;
    } | null>(null);
    async function act(command: unknown) {
        const key = JSON.stringify(command);
        if (pendingRequest.current?.key !== key)
            pendingRequest.current = { key, id: crypto.randomUUID() };
        setBusy(true);
        setActionError('');
        setNotice('Saving…');
        try {
            const r = await fetch('/api/billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command, revision: rev, requestId: pendingRequest.current.id }) });
            const d = await r.json().catch(() => ({ error: r.status === 403 ? 'Your session has expired. Reload and sign in again.' : 'Unable to read the server response. Please try again.' })) as BillingResponse;
            if (!r.ok) {
                pendingRequest.current = null;
                throw Error(d.error || 'Unable to save.');
            }
            pendingRequest.current = null;
            setB(d.billing);
            setRev(d.revision);
            setMail(d.mail);
            setDirty(false);
            const issued = (command as {
                type?: string;
            }).type === 'issue' ? d.billing.invoices.find(i => i.id === d.selectedId) : undefined;
            setNotice(issued ? 'Invoice ' + issued.number + ' issued. Download its PDF or prepare an email below.' : 'Saved.');
            return d as {
                selectedId?: string;
            };
        }
        catch (e) {
            const message = e instanceof Error ? e.message : 'Unable to save.';
            setActionError(message);
            setNotice(message);
            return null;
        }
        finally {
            setBusy(false);
        }
    }
    const invoice = b.invoices.find(i => i.id === selected);
    const editClient = (c: Client) => {
        if (leave()) {
            setClient(c);
            setDirty(false);
        }
    };
    const chooseInvoice = (id: string) => {
        if (leave()) {
            setIssueOpen(false);
            setActionError('');
            setSelected(id);
            setCreating(false);
            setDirty(false);
            setPreview(false);
            setEmailOpen(false);
        }
    };
    const active = b.invoices.filter(i => i.issuedAt && !i.cancelledAt);
    return <section className="billing"><div className={"billing-notice" + (actionError ? " billing-notice-error" : "")} role={actionError ? "alert" : "status"}>{notice || 'Records up to date.'}{dirty && ' Unsaved changes.'}<button type="button" disabled={busy} onClick={() => {
            if (leave())
                void load();
        }}>Reload</button></div>{ready && <fieldset disabled={busy} className="billing-fieldset">
 {tab === 'dashboard' && <><p className="billing-intro">Your studio, at a glance.</p><div className="billing-metrics">{(['ZAR', 'USD', 'GBP', 'EUR'] as const).filter(c => c === b.settings.currency || active.some(i => i.currency === c)).map(c => { const rows = active.filter(i => i.currency === c); return <div className="billing-metric" key={c}><small>Outstanding · {c}</small><strong>{moneyText(rows.reduce((n, i) => n + totals(i).balance, 0), c)}</strong><span>{rows.filter(i => status(i) === 'Overdue').length} overdue invoices</span><small>Recorded payments: {moneyText(rows.reduce((n, i) => n + totals(i).paid, 0), c)}</small></div>; })}<div className="billing-metric"><small>Clients</small><strong>{b.clients.length}</strong><span>{b.invoices.filter(i => !i.issuedAt).length} draft invoices</span></div></div><h2>Needs attention</h2>{b.invoices.filter(i => status(i) === 'Overdue').length === 0 ? <div className="billing-empty">No overdue invoices.</div> : <div className="billing-table-wrap"><table><thead><tr><th>Invoice</th><th>Client</th><th>Due</th><th>Outstanding</th></tr></thead><tbody>{b.invoices.filter(i => status(i) === 'Overdue').map(i => <tr key={i.id}><td>{i.number}</td><td>{i.client?.name}</td><td>{i.dueDate}</td><td>{moneyText(totals(i).balance, i.currency)}</td></tr>)}</tbody></table></div>}<div className="billing-tip">{mail[b.settings.emailProvider] ? 'Email credentials are configured. Confirm your sender details in Settings.' : 'Email is not connected yet. PDF downloads and manual payment tracking are available.'}</div><Button variant="outline" onClick={() => { const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })); a.href = url; a.download = 'outside-the-norm-billing-' + today() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Export billing backup</Button></>}
 {tab === 'clients' && (client ? <form className="billing-card" onSubmit={async (e) => {
                    e.preventDefault();
                    if (await act({ type: 'client', client }))
                        setClient(null);
                }}><div className="billing-toolbar"><Button type="button" variant="outline" onClick={() => {
                    if (leave()) {
                        setClient(null);
                        setDirty(false);
                    }
                }}>← All clients</Button><Button type="submit">Save client</Button></div><h2>{b.clients.some(c => c.id === client.id) ? 'Edit client' : 'New client'}</h2><div className="billing-fields">{(['name', 'contact', 'email', 'phone', 'taxNumber'] as const).map(k => <Field key={k} label={{ name: 'Company / client name', contact: 'Contact person', email: 'Email', phone: 'Phone', taxNumber: 'Tax / VAT number' }[k]} value={client[k]} type={k === 'email' ? 'email' : 'text'} required={k === 'name'} onChange={v => { setClient({ ...client, [k]: v }); setDirty(true); }}/>)}<Area label="Billing address" value={client.address} onChange={v => { setClient({ ...client, address: v }); setDirty(true); }}/><Area label="Private client notes" value={client.notes} onChange={v => { setClient({ ...client, notes: v }); setDirty(true); }}/></div><p className="billing-tip">Changes apply to future invoices. Issued invoices keep their original billing details.</p>{b.clients.some(c => c.id === client.id) && <Button type="button" variant="outline" onClick={async () => {
                        if (confirm('Delete this client? Clients with invoices cannot be deleted.') && await act({ type: 'deleteClient', id: client.id }))
                            setClient(null);
                    }}>Delete client</Button>}</form> : <><div className="billing-toolbar"><input aria-label="Search clients" placeholder="Search clients" value={search} onChange={e => setSearch(e.target.value)}/><Button onClick={() => editClient(blankClient())}>+ New client</Button></div><div className="billing-table-wrap"><table><thead><tr><th>Client</th><th>Contact</th><th>Email</th><th>Invoices</th><th /></tr></thead><tbody>{b.clients.filter(c => (c.name + ' ' + c.email).toLowerCase().includes(search.toLowerCase())).map(c => <tr key={c.id}><td>{c.name}</td><td>{c.contact || '—'}</td><td>{c.email || '—'}</td><td>{b.invoices.filter(i => i.clientId === c.id).length}</td><td><button onClick={() => editClient(c)}>Open →</button></td></tr>)}</tbody></table></div>{!b.clients.length && <div className="billing-empty">Add your first client to start invoicing.</div>}</>)}
 {tab === 'invoices' && ((creating || invoice) ? <><div className="billing-toolbar"><Button variant="outline" onClick={() => {
                    if (leave()) {
                        setSelected(null);
                        setCreating(false);
                        setDirty(false);
                        setPreview(false);
                        setEmailOpen(false);
                    }
                }}>← All invoices</Button><span>{invoice?.number || 'New draft'} {invoice && <span className="billing-badge">{status(invoice)}</span>}</span></div>{(!invoice?.issuedAt) ? <DraftEditor key={(invoice?.id || 'new') + '-' + rev} invoice={invoice} billing={b} dirty={() => setDirty(true)} onSave={async (draft) => {
                        const d = await act({ type: 'draft', id: invoice?.id, draft });
                        if (d?.selectedId) {
                            setSelected(d.selectedId);
                            setCreating(false);
                        }
                    }}/> : <div className="billing-card"><h2>{invoice.client?.name}</h2><p>{invoice.reference || 'Invoice'} · {invoice.date} · Due {invoice.dueDate}</p><div className="billing-metrics">{(['total', 'paid', 'balance'] as const).map(k => <div className="billing-metric" key={k}><small>{k === 'total' ? 'Invoice total' : k === 'paid' ? 'Payments received' : 'Balance due'}</small><strong>{moneyText(totals(invoice)[k], invoice.currency)}</strong></div>)}</div></div>}
 {invoice && <><div className="billing-toolbar"><Button variant="outline" disabled={dirty} onClick={() => setPreview(!preview)}>{preview ? 'Close preview' : 'Preview PDF'}</Button><a className="billing-button" aria-disabled={dirty} onClick={e => {
                        if (dirty)
                            e.preventDefault();
                    }} href={'/api/billing/pdf?id=' + invoice.id + '&download=1'}>Download PDF</a>{!invoice.issuedAt && <Button type="button" disabled={dirty || busy} aria-expanded={issueOpen} aria-controls="issue-invoice-panel" onClick={() => { setIssueOpen(!issueOpen); setActionError(''); }}>Issue invoice</Button>}<Button variant="outline" disabled={dirty} onClick={async () => {
                        const d = await act({ type: 'duplicate', id: invoice.id });
                        if (d?.selectedId)
                            chooseInvoice(d.selectedId);
                    }}>Duplicate</Button>{!invoice.issuedAt && <Button variant="outline" onClick={async () => {
                            if (confirm('Delete this draft?') && await act({ type: 'deleteDraft', id: invoice.id }))
                                setSelected(null);
                        }}>Delete draft</Button>}</div>{dirty && <p>Save your changes before previewing, downloading or issuing.</p>}{!invoice.issuedAt && issueOpen && <IssueInvoiceForm key={invoice.id + '-issue'} invoice={invoice} settings={b.settings} busy={busy} dirty={dirty} error={actionError} onCancel={() => setIssueOpen(false)} onIssue={async (details) => { const result = await act({ type: 'issue', id: invoice.id, details }); if (result) {
                    setIssueOpen(false);
                    setPreview(true);
                } }}/>}{preview && <iframe key={rev} className="billing-pdf" title="Invoice PDF preview" src={'/api/billing/pdf?id=' + invoice.id}/>}
 {invoice.issuedAt && !invoice.cancelledAt && <><div className="billing-toolbar"><Button onClick={() => setEmailOpen(!emailOpen)}>Preview & send email</Button><Button variant="outline" onClick={() => {
                            if (confirm('Confirm you have sent this invoice outside the admin?'))
                                void act({ type: 'sent', id: invoice.id });
                        }}>Mark sent manually</Button><Button variant="outline" onClick={() => {
                            const reason = prompt('Reason for cancelling this invoice?');
                            if (reason)
                                void act({ type: 'cancel', id: invoice.id, reason });
                        }}>Cancel invoice</Button></div>{emailOpen && <EmailForm key={invoice.id} invoice={invoice} billing={b} ready={mail[b.settings.emailProvider] && (b.settings.emailProvider !== 'gmail' || mail.gmailSender.toLowerCase() === b.settings.email.toLowerCase())} onSend={async (values) => {
                                setBusy(true);
                                try {
                                    const r = await fetch('/api/billing/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, id: invoice.id, revision: rev, attemptId: crypto.randomUUID() }) });
                                    const d = await r.json() as BillingResponse;
                                    await load();
                                    if (!r.ok)
                                        throw Error(d.error);
                                    setNotice(d.message || 'Email accepted.');
                                    setEmailOpen(false);
                                }
                                catch (e) {
                                    setNotice(e instanceof Error ? e.message : 'Unable to send.');
                                }
                                finally {
                                    setBusy(false);
                                }
                            }}/>}{totals(invoice).balance > 0 && <PaymentForm key={invoice.id + '-' + rev} invoice={invoice} onSave={values => act({ type: 'payment', id: invoice.id, ...values })}/>}</>}
 <div className="billing-card"><h3>Payments</h3>{!invoice.payments.length ? <p>No payments recorded.</p> : invoice.payments.map(p => <div className="billing-history-row" key={p.id}><span>{p.date} · {moneyText(p.amount, invoice.currency)} · {p.reference || 'No reference'}{p.voidedAt && ' · Reversed: ' + p.voidReason}</span>{!p.voidedAt && !invoice.cancelledAt && <button onClick={() => {
                                const reason = prompt('Reason for reversing this payment?');
                                if (reason)
                                    void act({ type: 'voidPayment', id: invoice.id, paymentId: p.id, reason });
                            }}>Reverse</button>}</div>)}</div>
 <div className="billing-card"><h3>Email history</h3>{!invoice.emails.length ? <p>No emails sent from the admin.</p> : invoice.emails.map(a => <div className="billing-history-row" key={a.id}><div><strong>{a.status === 'accepted' ? 'Accepted by mail service' : a.status}</strong><p>{new Date(a.date).toLocaleString()} · {a.to}</p><p>{a.subject}</p>{a.error && <small>{a.error}</small>}{a.providerId && <small>Reference: {a.providerId}</small>}</div>{['unknown', 'sending'].includes(a.status) && <div><p>Check your sent mailbox before another attempt.</p><button onClick={() => {
                                if (confirm('You checked your mailbox and confirmed this email was sent?'))
                                    void act({ type: 'resolveEmail', id: invoice.id, attemptId: a.id, wasSent: true });
                            }}>Confirm sent</button><button onClick={() => {
                                if (confirm('You checked your mailbox and confirmed this email was NOT sent?'))
                                    void act({ type: 'resolveEmail', id: invoice.id, attemptId: a.id, wasSent: false });
                            }}>Confirm not sent</button></div>}</div>)}</div><details className="billing-card"><summary>Activity history</summary>{invoice.history.map((h, n) => <p key={n}>{new Date(h.date).toLocaleString()} — {h.message}</p>)}</details></>}
 </> : <><div className="billing-toolbar"><input aria-label="Search invoices" placeholder="Search invoice or client" value={search} onChange={e => setSearch(e.target.value)}/><select aria-label="Invoice status" value={filter} onChange={e => setFilter(e.target.value)}>{['All', 'Draft', 'Issued', 'Sent', 'Part-paid', 'Paid', 'Overdue', 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select><Button disabled={!b.clients.length} onClick={() => {
                    if (leave()) {
                        setCreating(true);
                        setSelected(null);
                        setDirty(false);
                    }
                }}>+ New invoice</Button></div>{!b.clients.length && <p className="billing-tip">Create a client in Clients first.</p>}<div className="billing-table-wrap"><table><thead><tr><th>Invoice</th><th>Client</th><th>Due</th><th>Status</th><th>Total</th><th>Balance</th><th /></tr></thead><tbody>{b.invoices.filter(i => (filter === 'All' || status(i) === filter) && (i.number + ' ' + (i.client?.name || b.clients.find(c => c.id === i.clientId)?.name)).toLowerCase().includes(search.toLowerCase())).map(i => <tr key={i.id}><td>{i.number || 'Draft'}</td><td>{i.client?.name || b.clients.find(c => c.id === i.clientId)?.name}</td><td>{i.dueDate}</td><td><span className="billing-badge">{status(i)}</span></td><td>{moneyText(totals(i).total, i.currency)}</td><td>{i.cancelledAt ? '—' : moneyText(totals(i).balance, i.currency)}</td><td><button onClick={() => chooseInvoice(i.id)}>Open →</button></td></tr>)}</tbody></table></div>{!b.invoices.length && <div className="billing-empty">Your invoices will appear here.</div>}</>)}
 {tab === 'services' && <PresetEditor key={rev} billing={b} dirty={() => setDirty(true)} save={presets => act({ type: 'presets', presets })}/>}
 {tab === 'settings' && <SettingsEditor key={rev} settings={b.settings} mail={mail} dirty={() => setDirty(true)} save={settings => act({ type: 'settings', settings })}/>}
 </fieldset>}</section>;
}
function DraftEditor({ invoice, billing, dirty, onSave }: {
    invoice?: Invoice;
    billing: Billing;
    dirty: () => void;
    onSave: (d: Draft) => Promise<void>;
}) {
    const [d, setD] = useState<Draft>(invoice || { clientId: billing.clients[0]?.id || '', date: today(), dueDate: datePlus(billing.settings.termsDays), reference: '', currency: billing.settings.currency, items: [{ description: '', quantity: 1, rate: 0, discount: 0 }], taxRate: billing.settings.taxRate, notes: '', terms: billing.settings.terms });
    const update = (patch: Partial<Draft>) => { setD({ ...d, ...patch }); dirty(); };
    const t = totals({ ...d, payments: [] });
    return <form className="billing-card" onSubmit={e => { e.preventDefault(); void onSave(d); }}><h2>{invoice ? 'Edit draft' : 'New invoice'}</h2><div className="billing-fields"><label>Client<select required value={d.clientId} onChange={e => update({ clientId: e.target.value })}>{billing.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><Field label="Invoice date" value={d.date} type="date" required onChange={date => update({ date })}/><Field label="Due date" value={d.dueDate} type="date" required onChange={dueDate => update({ dueDate })}/><Field label="Project / reference" value={d.reference} onChange={reference => update({ reference })}/><label>Currency<select value={d.currency} onChange={e => update({ currency: e.target.value as Draft['currency'] })}>{['ZAR', 'USD', 'GBP', 'EUR'].map(c => <option key={c}>{c}</option>)}</select></label><Field label="Tax (%) — optional" type="number" value={d.taxRate / 100} onChange={v => update({ taxRate: Math.round(Number(v) * 100) })}/></div><h3>Services & line items</h3>{d.items.map((item, n) => <div className="billing-line" key={n}><Area label="Description" value={item.description} onChange={v => update({ items: d.items.map((x, j) => j === n ? { ...x, description: v } : x) })}/>{(['quantity', 'rate', 'discount'] as const).map(k => <Field key={k} label={{ quantity: 'Quantity', rate: 'Rate', discount: 'Discount %' }[k]} type="number" value={k === 'quantity' ? item[k] : item[k] / 100} onChange={v => update({ items: d.items.map((x, j) => j === n ? { ...x, [k]: k === 'quantity' ? Number(v) : Math.round(Number(v) * 100) } : x) })}/>)}<button type="button" disabled={d.items.length === 1} onClick={() => update({ items: d.items.filter((_, j) => j !== n) })}>Remove</button></div>)}<div className="billing-toolbar"><Button type="button" variant="outline" onClick={() => update({ items: [...d.items, { description: '', quantity: 1, rate: 0, discount: 0 }] })}>+ Line item</Button><select aria-label="Add service preset" value="" onChange={e => {
            const p = billing.presets.find(p => p.id === e.target.value);
            if (p)
                update({ items: [...d.items.filter(x => x.description || x.rate), { description: p.description, quantity: 1, rate: p.rate, discount: 0 }] });
        }}><option value="">Add service preset…</option>{billing.presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div className="billing-total"><p>Subtotal {moneyText(t.subtotal, d.currency)}</p><p>Tax {moneyText(t.tax, d.currency)}</p><strong>Total {moneyText(t.total, d.currency)}</strong></div><div className="billing-fields"><Area label="Payment terms" value={d.terms} onChange={terms => update({ terms })}/><Area label="Invoice notes (visible to client)" value={d.notes} onChange={notes => update({ notes })}/></div><Button type="submit">Save draft</Button><p className="billing-tip">A number is assigned when you issue the invoice. For a deposit, create a separate invoice describing the deposit amount.</p></form>;
}
function PaymentForm({ invoice, onSave }: {
    invoice: Invoice;
    onSave: (p: {
        date: string;
        amount: number;
        reference: string;
    }) => Promise<unknown>;
}) {
    const [date, setDate] = useState(today()), [amount, setAmount] = useState(''), [reference, setReference] = useState('');
    return <form className="billing-card" onSubmit={async (e) => {
            e.preventDefault();
            if (await onSave({ date, amount: Math.round(Number(amount) * 100), reference })) {
                setAmount('');
                setReference('');
            }
        }}><h3>Record a payment</h3><div className="billing-fields"><Field label="Date received" type="date" value={date} required onChange={setDate}/><Field label={'Amount (' + invoice.currency + ')'} type="number" value={amount} required onChange={setAmount}/><Field label="Payment reference / method" value={reference} onChange={setReference}/></div><Button type="submit">Record payment</Button><p className="billing-tip">Record only payments you have received. Partial payments leave the remaining balance outstanding.</p></form>;
}
function EmailForm({ invoice, billing, ready, onSend }: {
    invoice: Invoice;
    billing: Billing;
    ready: boolean;
    onSend: (p: {
        to: string;
        subject: string;
        message: string;
    }) => Promise<void>;
}) {
    const [to, setTo] = useState(invoice.client?.email || ''), [subject, setSubject] = useState('Invoice ' + invoice.number + ' — ' + billing.settings.name), [message, setMessage] = useState(`Hi ${invoice.client?.contact || invoice.client?.name || 'there'},\n\nPlease find invoice ${invoice.number} attached. The balance due is ${moneyText(totals(invoice).balance, invoice.currency)}, payable by ${invoice.dueDate}.\n\nThank you,\n${billing.settings.name}`);
    return <form className="billing-card" onSubmit={e => {
            e.preventDefault();
            if (confirm('Send ' + invoice.number + ' with PDF attachment to ' + to + '?'))
                void onSend({ to, subject, message });
        }}><h3>Review email</h3><p>From: {billing.settings.name} &lt;{billing.settings.email}&gt;</p><p>Reply to: {billing.settings.replyTo}</p><div className="billing-fields"><Field label="Recipient" type="email" value={to} required onChange={setTo}/><Field label="Subject" value={subject} required onChange={setSubject}/></div><Area label="Message" value={message} onChange={setMessage}/><p>Attachment: {invoice.number}.pdf</p>{!ready && <p className="billing-tip">Email connection is not ready. Check Settings. You can download the PDF and send it yourself now.</p>}<Button type="submit" disabled={!ready || invoice.emails.some(a => ['sending', 'unknown'].includes(a.status))}>Send invoice with PDF</Button><a className="billing-button" target="_blank" rel="noreferrer" href={'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message)}>Compose in Gmail</a><small>When composing in Gmail, attach the downloaded PDF yourself, then mark the invoice sent.</small></form>;
}
function PresetEditor({ billing, dirty, save }: {
    billing: Billing;
    dirty: () => void;
    save: (p: Billing['presets']) => Promise<unknown>;
}) { const [presets, setPresets] = useState(billing.presets); return <form className="billing-card" onSubmit={e => { e.preventDefault(); void save(presets); }}><h2>Service presets</h2><p>Starting descriptions and rates for new invoices. Set your own pricing.</p>{presets.map((p, n) => <div className="billing-line" key={p.id}>{(['name', 'description', 'rate'] as const).map(k => <Field key={k} label={k === 'rate' ? 'Default rate' : k === 'name' ? 'Service' : 'Description'} type={k === 'rate' ? 'number' : 'text'} value={k === 'rate' ? p[k] / 100 : p[k]} required onChange={v => { setPresets(presets.map((x, j) => j === n ? { ...x, [k]: k === 'rate' ? Math.round(Number(v) * 100) : v } : x)); dirty(); }}/>)}<button type="button" onClick={() => { setPresets(presets.filter(x => x.id !== p.id)); dirty(); }}>Remove</button></div>)}<div className="billing-toolbar"><Button type="button" variant="outline" onClick={() => { setPresets([...presets, { id: crypto.randomUUID(), name: '', description: '', rate: 0 }]); dirty(); }}>+ Service</Button><Button type="submit">Save services</Button></div></form>; }
function SettingsEditor({ settings, mail, dirty, save }: {
    settings: Settings;
    mail: Mail;
    dirty: () => void;
    save: (s: Settings) => Promise<unknown>;
}) { const [s, setS] = useState(settings); const update = (p: Partial<Settings>) => { setS({ ...s, ...p }); dirty(); }; return <form className="billing-card" onSubmit={e => { e.preventDefault(); void save(s); }}><h2>Studio & billing</h2><div className="billing-fields"><Field label="Business / sender name" value={s.name} required onChange={name => update({ name })}/><Field label="Phone" value={s.phone} onChange={phone => update({ phone })}/><Field label="Tax / VAT registration number (optional)" value={s.taxNumber} onChange={taxNumber => update({ taxNumber })}/><Area label="Business billing address" value={s.address} onChange={address => update({ address })}/><Area label="Banking / payment instructions" value={s.bankDetails} onChange={bankDetails => update({ bankDetails })}/><Area label="Default payment terms" value={s.terms} onChange={terms => update({ terms })}/><Field label="Payment due in days" type="number" value={s.termsDays} onChange={v => update({ termsDays: Number(v) })}/><Field label="Default tax (%)" type="number" value={s.taxRate / 100} onChange={v => update({ taxRate: Math.round(Number(v) * 100) })}/><Field label="Invoice prefix" value={s.prefix} onChange={prefix => update({ prefix: prefix.toUpperCase() })}/><Field label="Next invoice number" type="number" value={s.nextNumber} onChange={v => update({ nextNumber: Number(v) })}/><label>Default currency<select value={s.currency} onChange={e => update({ currency: e.target.value as Settings['currency'] })}>{['ZAR', 'USD', 'GBP', 'EUR'].map(c => <option key={c}>{c}</option>)}</select></label></div><h2>Email</h2><div className="billing-fields"><Field label="Sender email" type="email" value={s.email} required onChange={email => update({ email })}/><Field label="Reply-to email" type="email" value={s.replyTo} required onChange={replyTo => update({ replyTo })}/><label>Sending service<select value={s.emailProvider} onChange={e => update({ emailProvider: e.target.value as Settings['emailProvider'] })}><option value="gmail">Gmail — current address</option><option value="resend">Resend — verified domain address</option></select></label></div><div className="billing-tip"><strong>{mail[s.emailProvider] ? 'Credentials configured' : 'Email connection required'}</strong><p>{s.emailProvider === 'gmail' ? `Use the authorised Gmail account${mail.gmailSender ? ' (' + mail.gmailSender + ')' : ''}. Changing the sender requires connecting that account.` : 'Verify your own domain with Resend before using its address to send. Gmail addresses cannot be verified as a Resend domain.'}</p><p>You can change these addresses when outsidethenorm.co.za is registered. PDF downloads work without an email connection.</p><details><summary>Email setup details</summary><p>Gmail requires a Google OAuth app with Gmail sending permission and offline access. Configure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN and GMAIL_SENDER_EMAIL as secure hosting variables. Resend requires RESEND_API_KEY and a verified sender domain. Credentials are never stored in these forms.</p><p>Ask for help connecting the chosen service when ready. No email will be sent until you review an invoice and press Send.</p></details></div><Button type="submit">Save settings</Button></form>; }
function IssueInvoiceForm({ invoice, settings, busy, dirty, error, onIssue, onCancel }: {
    invoice: Invoice;
    settings: Settings;
    busy: boolean;
    dirty: boolean;
    error: string;
    onIssue: (details: {
        address: string;
        bankDetails: string;
        taxNumber: string;
    }) => Promise<void>;
    onCancel: () => void;
}) {
    const [details, setDetails] = useState({ address: settings.address, bankDetails: settings.bankDetails, taxNumber: settings.taxNumber });
    return <form id="issue-invoice-panel" className="billing-card issue-invoice-panel" onSubmit={e => { e.preventDefault(); if (!busy && !dirty)
        void onIssue(details); }}>
 <h3>Issue this invoice</h3><p>Review your billing details. Confirming assigns an invoice number and locks the client details and line items. It does not send an email.</p>
 <div className="billing-fields"><label>Studio billing address<textarea required maxLength={800} value={details.address} onChange={e => setDetails({ ...details, address: e.target.value })}/></label><label>Banking details or payment instructions<textarea required maxLength={1200} value={details.bankDetails} onChange={e => setDetails({ ...details, bankDetails: e.target.value })}/></label>{invoice.taxRate > 0 && <label>Tax registration number<input required maxLength={80} value={details.taxNumber} onChange={e => setDetails({ ...details, taxNumber: e.target.value })}/></label>}</div>
 <p>Total: <strong>{moneyText(totals(invoice).total, invoice.currency)}</strong> · Due {invoice.dueDate}</p><small>These billing details will also be saved in Settings for your next invoice.</small>
 {error && <p className="invoice-action-error" role="alert">{error}</p>}{dirty && <p role="status">Save your draft changes above before confirming.</p>}
 <div className="billing-toolbar"><Button type="submit" disabled={busy || dirty}>{busy ? 'Issuing…' : 'Confirm & issue invoice'}</Button><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Keep as draft</Button></div>
 </form>;
}
