'use client';
import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Mail, LayoutDashboard, Users, Receipt, Briefcase, Folder, FileText, Share2, Settings } from 'lucide-react';
import Editor from './editor';
import Inbox from './inbox';
import SocialEditor from './social-editor';
import BlogEditor from './blog-editor';
import BillingPanel, { type BillingTab } from './billing-panel';
const tabs = ['dashboard', 'clients', 'invoices', 'services', 'work', 'blog', 'socials', 'enquiries', 'settings'] as const;
const labels = { dashboard: 'Dashboard', clients: 'Clients', invoices: 'Invoices', services: 'Service presets', work: 'Work', blog: 'Blog', socials: 'Social media', enquiries: 'Inbox', settings: 'Settings' };
const icons = { dashboard: LayoutDashboard, clients: Users, invoices: Receipt, services: Briefcase, work: Folder, blog: FileText, socials: Share2, enquiries: Mail, settings: Settings };
export default function AdminPanel({ email, signOut }: {
    email: string;
    signOut: string;
}) { const [tab, setTab] = useState<typeof tabs[number]>('dashboard'); const [billingDirty, setBillingDirty] = useState(false); const [billingKey, setBillingKey] = useState(0); const billingTab = ['dashboard', 'clients', 'invoices', 'services', 'settings'].includes(tab); function navigate(item: typeof tabs[number]) {
    if (item === tab) return;
    if (billingDirty) {
        if (!confirm('Discard unsaved billing changes?')) return;
        setBillingDirty(false); setBillingKey(k => k + 1);
    }
    setTab(item);
} return <div className="admin-layout"><aside className="admin-sidebar"><a className="wordmark" href="/"><img className="brand-logo" src="/images/otn-stack.svg" alt="Outside the Norm"/></a><p className="admin-kicker">STUDIO ADMIN</p><nav aria-label="Admin sections">{tabs.map((item) => <button key={item} aria-current={tab === item ? 'page' : undefined} onClick={() => navigate(item)}>{(() => { const Icon = icons[item]; return <Icon size={18} aria-hidden="true"/>; })()}{labels[item]}</button>)}</nav></aside><main className="studio admin-content"><div className="admin-topbar"><div><strong>Outside the Norm</strong><span> / {labels[tab]}</span></div><div className="admin-topbar-actions"><button className="admin-inbox-shortcut" onClick={() => navigate('enquiries')} aria-label="Open contact form inbox" title="Inbox"><Mail size={21} aria-hidden="true"/><span>Inbox</span></button><Popover><PopoverTrigger className="admin-avatar" aria-label="Open account menu" title="Account">{email.slice(0,1).toUpperCase()}</PopoverTrigger><PopoverContent align="end" sideOffset={12} className="admin-account-dropdown" aria-label="Your account"><small>Signed in as</small><p>{email}</p><a href="/" target="_blank" rel="noreferrer">View website ↗</a><form action={signOut} method="post"><button className="admin-signout" type="submit">Sign out</button></form></PopoverContent></Popover></div></div><header className="admin-page-heading"><p className="eyebrow">YOUR WORKSPACE</p><h1>{labels[tab]}<span>.</span></h1></header><div hidden={!billingTab}><BillingPanel key={billingKey} onDirtyChange={setBillingDirty} tab={billingTab ? tab as BillingTab : 'dashboard'}/></div><div hidden={tab !== 'work'}><Editor /></div>{tab === 'enquiries' && <Inbox />}<div hidden={tab !== 'blog'}><BlogEditor /></div><div hidden={tab !== 'socials'}><SocialEditor /></div></main></div>; }
