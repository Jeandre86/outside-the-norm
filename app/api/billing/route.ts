import { z } from 'zod';
import { isEditor, sameOrigin } from '@/lib/editor-auth';
import { readBilling, saveBilling } from '@/lib/billing-storage';
import { applyCommand, commandSchema } from '@/lib/billing';
import { mailStatus } from '@/lib/billing-email';
const headers = { 'Cache-Control': 'private, no-store' };
export async function GET() { if (!await isEditor())
    return new Response(null, { status: 403 }); try {
    return Response.json({ ...await readBilling(), mail: mailStatus() }, { headers });
}
catch {
    return Response.json({ error: 'Unable to load billing records.' }, { status: 503, headers });
} }
export async function POST(r: Request) { if (!sameOrigin(r) || !await isEditor())
    return new Response(null, { status: 403 }); try {
    const body = await r.text();
    if (body.length > 200000)
        return new Response(null, { status: 413 });
    const { command, revision, requestId } = z.object({ command: commandSchema, revision: z.number().int().min(0), requestId: z.string().uuid() }).parse(JSON.parse(body));
    const stored = await readBilling();
    if (stored.billing.requests.includes(requestId))
        return Response.json({ ...stored, selectedId: stored.billing.requestResults?.[requestId], mail: mailStatus() }, { headers });
    if (revision !== stored.revision)
        return Response.json({ error: 'Records changed in another window. Reload before saving.' }, { status: 409, headers });
    const selectedId = applyCommand(stored.billing, command);
    stored.billing.requests = [...stored.billing.requests, requestId].slice(-500);
    stored.billing.requestResults = Object.fromEntries(Object.entries({ ...stored.billing.requestResults, ...(selectedId ? { [requestId]: selectedId } : {}) }).filter(([id]) => stored.billing.requests.includes(id)));
    const next = await saveBilling(stored.billing, revision);
    return Response.json({ billing: stored.billing, revision: next, selectedId, mail: mailStatus() }, { headers });
}
catch (e) {
    return Response.json({ error: e instanceof z.ZodError ? e.issues.map(x => x.message).join('; ') : e instanceof Error ? e.message : 'Unable to save.' }, { status: 400, headers });
} }
