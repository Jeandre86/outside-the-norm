import { isEditor } from '@/lib/editor-auth';
import { z } from 'zod';
export async function GET() {
    if (!await isEditor()) return new Response(null, { status: 403 });
    try {
        const response = await fetch('https://api.frankfurter.dev/v2/rates?base=ZAR&quotes=USD,GBP,EUR', { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw Error();
        const entries = z.array(z.object({ base: z.literal('ZAR'), quote: z.enum(['USD','GBP','EUR']), rate: z.number().positive().finite(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).parse(await response.json());
        const rates = { ZAR: 1, USD: 0, GBP: 0, EUR: 0 };
        for (const entry of entries) rates[entry.quote] = entry.rate;
        if (Object.values(rates).some(rate => rate <= 0)) throw Error();
        return Response.json({ rates, date: entries.map(e => e.date).sort()[0] }, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch {
        return Response.json({ error: 'Exchange rates are unavailable. Please try again.' }, { status: 503 });
    }
}
