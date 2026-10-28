'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Enquiry = { id: string; name: string; email: string; message: string; created_at: string };

export default function Inbox() {
    const [messages, setMessages] = useState<Enquiry[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');

    async function refresh(signal?: AbortSignal) {
        setBusy(true); setError('');
        try {
            const response = await fetch('/api/enquiries', { cache: 'no-store', signal });
            if (!response.ok) throw new Error();
            const data: Enquiry[] = await response.json();
            setMessages(data);
        } catch {
            if (!signal?.aborted) setError('Could not load your inbox. Please refresh to try again.');
        } finally {
            if (!signal?.aborted) setBusy(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        void refresh(controller.signal);
        return () => controller.abort();
    }, []);

    const message = messages.find(item => item.id === selected);
    const filtered = messages.filter(item => `${item.name} ${item.email} ${item.message}`.toLowerCase().includes(query.toLowerCase()));
    return <section aria-label="Contact form inbox">
        <p>Website contact form messages arrive here directly. They are not forwarded to Gmail.</p>
        <div className="studio-actions">
            <Button variant="outline" disabled={busy} onClick={() => void refresh()}>{busy ? 'Loading…' : 'Refresh inbox'}</Button>
            <span>Latest {messages.length} messages · newest first</span>
        </div>
        {error && <p role="alert" className="notice">{error}</p>}
        {message ? <article className="studio-card">
            <Button variant="outline" onClick={() => setSelected(null)}>← All messages</Button>
            <h2 style={{ marginTop: 24 }}>{message.name}</h2>
            <p>{message.email}</p>
            <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time>
            <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '24px 0' }}>{message.message}</p>
            <a className="cta" href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent('Your enquiry — Outside the Norm')}`}>Reply using email</a>
            <p className="fine">Opens your email app to reply to this person.</p>
        </article> : <>
            <label className="admin-search">Search messages<Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name, email or message" /></label>
            {!busy && !error && filtered.length === 0 && <p className="notice">{query ? 'No matching messages.' : 'No messages yet. New website enquiries will appear here.'}</p>}
            {filtered.map(item => <article className="studio-card" key={item.id}>
                <h3>{item.name}</h3>
                <p style={{ overflowWrap: 'anywhere' }}>{item.email}</p>
                <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
                <p style={{ margin: '16px 0', overflowWrap: 'anywhere' }}>{item.message.slice(0, 160)}{item.message.length > 160 ? '…' : ''}</p>
                <Button variant="outline" onClick={() => setSelected(item.id)}>Open message</Button>
            </article>)}
        </>}
    </section>;
}
