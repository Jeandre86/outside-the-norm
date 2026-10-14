import { isEditor } from '@/lib/editor-auth';
import { readBilling } from '@/lib/billing-storage';
import { invoicePdf } from '@/lib/invoice-pdf';
export async function GET(r: Request) { if (!await isEditor())
    return new Response(null, { status: 403 }); try {
    const u = new URL(r.url);
    const { billing } = await readBilling();
    const i = billing.invoices.find(x => x.id === u.searchParams.get('id'));
    if (!i)
        return new Response('Invoice not found', { status: 404 });
    const pdf = await invoicePdf(i, billing);
    return new Response(pdf as BodyInit, { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'private, no-store', 'Content-Disposition': `${u.searchParams.has('download') ? 'attachment' : 'inline'}; filename="${i.number || 'draft-invoice'}.pdf"` } });
}
catch {
    return Response.json({ error: 'Unable to create PDF.' }, { status: 500 });
} }
