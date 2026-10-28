'use client';
import { useEffect, useState } from 'react';
import { type Billing, moneyText, totals, status } from '@/lib/billing';

import { convertDashboardAmount, type DashboardRates } from '@/lib/dashboard-currency';

export default function IncomeDashboard({ billing: b }: { billing: Billing }) {
    const [currency, setCurrency] = useState(b.settings.currency);
    const [period, setPeriod] = useState(6);
    const [exchange, setExchange] = useState<{ rates: DashboardRates; date: string } | null>(null);
    const [rateError, setRateError] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        setRateError(false);
        fetch('/api/exchange-rates', { signal: controller.signal }).then(async response => {
            if (!response.ok) throw Error();
            setExchange(await response.json());
        }).catch(() => { if (!controller.signal.aborted) setRateError(true); });
        return () => controller.abort();
    }, [retry]);
    const rows = b.invoices.filter(i => i.issuedAt && !i.cancelledAt);
    const needsRates = rows.some(i => i.currency !== currency);
    const unavailable = needsRates && !exchange;
    const convert = (amount: number, from: typeof currency) => from === currency ? amount : exchange ? convertDashboardAmount(amount, from, currency, exchange.rates) : 0;
    const now = new Date();
    const months = Array.from({ length: period }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - period + 1 + index, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return { key, label: date.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }),
            billed: rows.filter(i => i.date.startsWith(key)).reduce((sum, i) => sum + convert(totals(i).total, i.currency), 0),
            paid: rows.reduce((sum, i) => sum + i.payments.filter(p => !p.voidedAt && p.date.startsWith(key)).reduce((s, p) => s + convert(p.amount, i.currency), 0), 0) };
    });
    const received = months.reduce((sum, m) => sum + m.paid, 0);
    const billed = months.reduce((sum, m) => sum + m.billed, 0);
    const outstanding = rows.reduce((sum, i) => sum + convert(totals(i).balance, i.currency), 0);
    const overdue = rows.filter(i => status(i) === 'Overdue');
    const max = Math.max(1, ...months.flatMap(m => [m.paid, m.billed]));
    const points = months.map((m, index) => `${40 + index * 680 / (period - 1)},${190 - m.paid / max * 155}`).join(' ');
    const groups = ['Paid', 'Part-paid', 'Sent', 'Issued', 'Overdue'].map(label => ({ label, count: rows.filter(i => status(i) === label).length })).filter(g => g.count);
    return <div className="income-dashboard">
        <div className="dash-welcome"><div><p className="dash-kicker">STUDIO OVERVIEW</p><h2>Your business, in focus<span>.</span></h2><p>Income, invoices and the details that need your attention.</p></div><div className="dash-filters"><label>Display currency<select value={currency} onChange={e => setCurrency(e.target.value as typeof currency)}>{['ZAR','USD','GBP','EUR'].map(c => <option key={c}>{c}</option>)}</select></label><label>Period<select value={period} onChange={e => setPeriod(Number(e.target.value))}><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select></label></div></div>
        {needsRates && exchange && <p className="dash-muted">Estimated values in {currency} using latest available <a href="https://frankfurter.dev" target="_blank" rel="noreferrer">Frankfurter rates</a> dated {exchange.date}. Historical months use the same rates. Original invoices are unchanged.</p>}
        {unavailable ? <div className="billing-notice" role="status">{rateError ? 'Could not load exchange rates. Converted totals are unavailable.' : 'Loading exchange rates…'}{rateError && <button onClick={() => setRetry(value => value + 1)}>Try again</button>}</div> : <>
        <div className="dash-stats">{[
            ['Payments received', moneyText(received, currency), `Across the last ${period} months`],
            ['Invoiced', moneyText(billed, currency), 'Issued invoices · includes tax'],
            ['Outstanding', moneyText(outstanding, currency), `${overdue.length} overdue · all dates`],
            ['Clients', String(b.clients.length), `${b.invoices.filter(i => !i.issuedAt && !i.cancelledAt).length} draft invoices · all currencies`]
        ].map(([label,value,hint]) => <article className="dash-stat" key={label}><small>{label}</small><strong>{value}</strong><span>{hint}</span></article>)}</div>
        <div className="dash-chart-grid"><section className="dash-card"><div className="dash-card-heading"><h3>Income over time</h3><span className="dash-legend">● Payments received</span></div><strong className="dash-chart-total">{moneyText(received,currency)}</strong><svg viewBox="0 0 760 235" role="img" aria-label={`Monthly recorded payments in ${currency}. Exact values in the income summary below.`}>{[35,87,139,190].map(y => <line key={y} x1="40" x2="720" y1={y} y2={y} stroke="currentColor" opacity=".12"/>)}<polygon points={`40,190 ${points} 720,190`} fill="#ed163a" opacity=".12"/><polyline points={points} fill="none" stroke="#ff4765" strokeWidth="3"/>{months.map((m,index) => <g key={m.key}><circle cx={40 + index * 680 / (period - 1)} cy={190 - m.paid/max*155} r="4" fill="#ff4765"><title>{m.label}: {moneyText(m.paid,currency)}</title></circle><text x={40 + index * 680 / (period - 1)} y="220" textAnchor="middle" fill="currentColor" fontSize="11">{m.label}</text></g>)}</svg>{!received && <p className="dash-muted">No payments recorded in this period yet.</p>}</section>
        <section className="dash-card"><h3>Invoice overview</h3><p className="dash-muted">Active issued invoices · all currencies · all dates</p><strong className="dash-chart-total">{rows.length} <small>invoices</small></strong>{groups.map(g => <div className="dash-progress" key={g.label}><div><span>{g.label}</span><strong>{g.count}</strong></div><div className="dash-track"><span style={{width:`${g.count / Math.max(1,rows.length)*100}%`}}/></div></div>)}{!rows.length && <p>No issued invoices yet.</p>}</section></div>
        <section className="dash-card"><div className="dash-card-heading"><h3>Invoiced vs received</h3><span className="dash-muted">Monthly comparison · {currency}</span></div><div className="dash-bars">{months.map(m => <div key={m.key}><div className="dash-bar-pair"><span style={{height:`${m.billed/max*140}px`}} title={`Invoiced: ${moneyText(m.billed,currency)}`}/><span style={{height:`${m.paid/max*140}px`}} title={`Received: ${moneyText(m.paid,currency)}`}/></div><small>{m.label}</small></div>)}</div><p className="dash-muted">Grey: invoiced · Red: received. Payments may relate to earlier invoices.</p></section>
        <div className="dash-chart-grid"><section className="dash-card"><h3>Income summary</h3><p className="dash-muted">Invoice and cash summary; expenses and profit are not tracked.</p><div className="billing-table-wrap"><table><thead><tr><th>Month</th><th>Invoiced</th><th>Received</th></tr></thead><tbody>{months.map(m => <tr key={m.key}><td>{m.label}</td><td>{moneyText(m.billed,currency)}</td><td>{moneyText(m.paid,currency)}</td></tr>)}</tbody><tfoot><tr><td>Total</td><td>{moneyText(billed,currency)}</td><td>{moneyText(received,currency)}</td></tr></tfoot></table></div></section><section className="dash-card"><h3>Needs attention</h3>{overdue.length ? overdue.map(i => <div className="dash-attention" key={i.id}><div><strong>{i.client?.name || 'Client'}</strong><small>{i.number} · Due {i.dueDate}</small></div><strong>{moneyText(convert(totals(i).balance,i.currency),currency)}</strong></div>) : <p className="dash-muted">No overdue invoices.</p>}<h3>Recent invoices</h3>{rows.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,4).map(i => <div className="dash-attention" key={i.id}><div><strong>{i.number}</strong><small>{i.client?.name} · {status(i)}</small></div><span>{moneyText(convert(totals(i).total,i.currency),currency)}</span></div>)}{!rows.length && <p className="dash-muted">Your issued invoices will appear here.</p>}</section></div>
    </>}
    </div>;
}
