import { database } from './storage';
import { newBilling, type Billing } from './billing';
export async function readBilling() { const row = await database().prepare('SELECT data,revision FROM content WHERE id=?').bind('billing').first<{
    data: string;
    revision: number;
}>(); return { billing: row ? JSON.parse(row.data) as Billing : newBilling(), revision: row?.revision || 0 }; }
export async function saveBilling(b: Billing, revision: number) { const data = JSON.stringify(b); if (data.length > 4000000)
    throw Error('Billing storage limit reached. Export and contact support.'); const db = database(); const r = revision === 0 ? await db.prepare('INSERT OR IGNORE INTO content(id,data,revision) VALUES(?,?,1)').bind('billing', data).run() : await db.prepare('UPDATE content SET data=?,revision=revision+1 WHERE id=? AND revision=?').bind(data, 'billing', revision).run(); if (!r.meta.changes)
    throw Error('Records changed in another window. Reload before trying again.'); return revision + 1; }
