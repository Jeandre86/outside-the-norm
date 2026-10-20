'use client';
import { useState } from 'react';
import Editor from './editor';
import SocialEditor from './social-editor';
import BlogEditor from './blog-editor';
import BillingPanel, { type BillingTab } from './billing-panel';
const tabs = ['dashboard', 'clients', 'invoices', 'services', 'work', 'blog', 'socials', 'enquiries', 'settings'] as const;
const labels = { dashboard: 'Dashboard', clients: 'Clients', invoices: 'Invoices', services: 'Service presets', work: 'Work', blog: 'Blog', socials: 'Social media', enquiries: 'Enquiries', settings: 'Settings' };
export default function AdminPanel({ email, signOut }: {
    email: string;
    signOut: string;
}) { const [tab, setTab] = useState<typeof tabs[number]>('dashboard'); const [billingDirty, setBillingDirty] = useState(false); const [billingKey, setBillingKey] = useState(0); const billingTab = ['dashboard', 'clients', 'invoices', 'services', 'settings'].includes(tab); return <div className="admin-layout"><aside className="admin-sidebar"><a className="wordmark" href="/"><img className="brand-logo" src="/images/otn-stack.svg" alt="Outside the Norm"/></a><p className="admin-kicker">STUDIO ADMIN</p><nav aria-label="Admin sections">{tabs.map((item, i) => <button key={item} aria-current={tab === item ? 'page' : undefined} onClick={() => { if (item === tab)
    return; if (billingDirty) {
    if (!confirm("Discard unsaved billing changes?"))
        return;
    setBillingDirty(false);
    setBillingKey(k => k + 1);
} setTab(item); }}><span>0{i + 1}</span>{labels[item]}</button>)}</nav><div className="admin-account"><small>Signed in as</small><p>{email}</p><a href="/" target="_blank" rel="noreferrer">View website ↗</a><a href={signOut} target="_top">Sign out</a></div></aside><main className="studio admin-content"><header className="admin-page-heading"><p className="eyebrow">YOUR WORKSPACE</p><h1>{labels[tab]}<span>.</span></h1></header><div hidden={!billingTab}><BillingPanel key={billingKey} onDirtyChange={setBillingDirty} tab={billingTab ? tab as BillingTab : 'dashboard'}/></div><div hidden={tab !== 'work' && tab !== 'enquiries'}><Editor view={tab === 'enquiries' ? 'enquiries' : 'work'}/></div><div hidden={tab !== 'blog'}><BlogEditor /></div><div hidden={tab !== 'socials'}><SocialEditor /></div></main></div>; }
