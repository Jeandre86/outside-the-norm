import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { invoiceLogo } from './invoice-logo';
import { totals, moneyText, type Invoice, type Billing } from './billing';
export async function invoicePdf(i: Invoice, b: Billing) {
    const doc = await PDFDocument.create();
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const dark = rgb(.043, .078, .055), muted = rgb(.42, .46, .43), red = rgb(.86, .047, .15);
    let page = doc.addPage([595.28, 841.89]);
    let y = 790;
    const clean = (s: string) => Array.from(s.replace(/\t/g, ' ').replace(/[–—]/g, '-').replace(/’/g, "'")).map(c => { try {
        regular.encodeText(c);
        return c;
    }
    catch {
        return '?';
    } }).join('');
    const draw = (s: string, x: number, yy: number, size = 10, strong = false, color = dark) => page.drawText(clean(s), { x, y: yy, size, font: strong ? bold : regular, color });
    const lines = (s: string, width: number, size = 10) => { const out: string[] = []; for (const paragraph of s.split('\n')) {
        let line = '';
        for (const word of paragraph.split(/\s+/)) {
            let chunks = [word];
            if (regular.widthOfTextAtSize(clean(word), size) > width) {
                chunks = [];
                let part = '';
                for (const c of word) {
                    if (regular.widthOfTextAtSize(clean(part + c), size) > width) {
                        chunks.push(part);
                        part = '';
                    }
                    part += c;
                }
                if (part)
                    chunks.push(part);
            }
            for (const chunk of chunks) {
                if (line && regular.widthOfTextAtSize(clean(line + ' ' + chunk), size) > width) {
                    out.push(line);
                    line = chunk;
                }
                else
                    line += (line ? ' ' : '') + chunk;
            }
        }
        out.push(line);
    } return out; };
    const footer = () => { const pages = doc.getPages(); pages.forEach((p, n) => { p.drawText(`${i.number || 'DRAFT'}  |  ${n + 1} / ${pages.length}`, { x: 42, y: 25, font: regular, size: 8, color: muted }); }); };
    const room = (h: number) => { if (y - h < 65) {
        page = doc.addPage([595.28, 841.89]);
        y = 785;
        draw((i.number || 'DRAFT') + ' / continued', 42, y, 10, true);
        y -= 30;
    } };
    const block = (s: string, x = 42, width = 510, size = 10, strong = false) => { for (const line of lines(s, width, size)) {
        room(size + 5);
        draw(line, x, y, size, strong);
        y -= size + 5;
    } };
    const right = (s: string, x: number, yy: number, size = 10, strong = false) => draw(s, x - (strong ? bold : regular).widthOfTextAtSize(clean(s), size), yy, size, strong);
    const studio = i.studio || b.settings, client = i.client || b.clients.find(c => c.id === i.clientId);
    if (!client)
        throw Error('Client not found.');
    for (const path of invoiceLogo) {
        const h = path.fill.replace('#', '');
        page.drawSvgPath(path.d, { x: 42, y: 800, scale: .28, color: rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255) });
    }
    right(i.taxRate > 0 ? 'TAX INVOICE' : 'INVOICE', 553, 785, 20, true);
    right(i.number || 'DRAFT — NOT ISSUED', 553, 764, 11, true);
    right(`Date: ${i.date}`, 553, 743, 10);
    right(`Due: ${i.dueDate}`, 553, 727, 10);
    y = 690;
    const left = [studio.name, studio.address, studio.email, studio.phone, studio.taxNumber ? 'Tax number: ' + studio.taxNumber : ''].filter(Boolean).join('\n');
    const r = [client.name, client.contact, client.address, client.email, client.taxNumber ? 'Tax number: ' + client.taxNumber : ''].filter(Boolean).join('\n');
    draw('FROM', 42, y, 9, true, muted);
    draw('BILL TO', 310, y, 9, true, muted);
    y -= 18;
    const llines = lines(left, 235), rlines = lines(r, 243);
    for (let n = 0; n < Math.max(llines.length, rlines.length); n++) {
        room(15);
        if (llines[n])
            draw(llines[n], 42, y);
        if (rlines[n])
            draw(rlines[n], 310, y);
        y -= 15;
    }
    y -= 20;
    if (i.reference)
        block('Reference: ' + i.reference);
    y -= 12;
    const tableHead = () => { page.drawRectangle({ x: 42, y: y - 7, width: 511, height: 24, color: dark }); draw('DESCRIPTION', 50, y, 8, true, rgb(1, 1, 1)); draw('QTY', 320, y, 8, true, rgb(1, 1, 1)); draw('RATE', 371, y, 8, true, rgb(1, 1, 1)); draw('DISC.', 434, y, 8, true, rgb(1, 1, 1)); draw('TOTAL', 505, y, 8, true, rgb(1, 1, 1)); y -= 30; };
    room(60);
    tableHead();
    for (const item of i.items) {
        const desc = lines(item.description, 255, 9);
        let first = true;
        for (const line of desc) {
            if (y < 85) {
                room(40);
                tableHead();
            }
            draw(line, 50, y, 9);
            if (first) {
                draw(String(item.quantity), 320, y, 9);
                right((item.rate / 100).toFixed(2), 417, y, 9);
                right((item.discount / 100).toFixed(2) + '%', 471, y, 8);
                right((Math.round(Math.round(item.quantity * item.rate) * (10000 - item.discount) / 10000) / 100).toFixed(2), 547, y, 9, true);
                first = false;
            }
            y -= 14;
        }
        page.drawLine({ start: { x: 42, y: y - 3 }, end: { x: 553, y: y - 3 }, color: rgb(.9, .91, .9), thickness: .5 });
        y -= 20;
    }
    const t = totals(i);
    room(145);
    y -= 5;
    for (const [label, value] of [['Subtotal', t.subtotal], ['Tax (' + i.taxRate / 100 + '%)', t.tax], ['Total', t.total], ['Payments received', t.paid], ['Balance due', t.balance]] as [
        string,
        number
    ][]) {
        draw(label, 310, y, 10, label === 'Balance due');
        right(moneyText(value, i.currency), 553, y, 11, label === 'Balance due');
        y -= 22;
    }
    if (i.cancelledAt) {
        room(50);
        draw('CANCELLED', 42, y, 22, true, red);
        y -= 30;
        block(i.cancelReason || '');
    }
    else if (i.issuedAt && t.balance === 0) {
        room(55);
        page.drawText('PAID', { x: 65, y: y - 10, size: 33, font: bold, color: red, rotate: degrees(12) });
        y -= 60;
    }
    const payments = i.payments.filter(p => !p.voidedAt);
    if (payments.length) {
        room(40);
        block('PAYMENTS', 42, 511, 10, true);
        for (const p of payments)
            block(`${p.date}  ${moneyText(p.amount, i.currency)}  ${p.reference}`, 42, 511, 9);
        y -= 14;
    }
    if (studio.bankDetails) {
        room(40);
        block('PAYMENT DETAILS', 42, 511, 10, true);
        block(studio.bankDetails, 42, 511, 9);
        y -= 15;
    }
    if (i.terms) {
        room(40);
        block('TERMS', 42, 511, 10, true);
        block(i.terms, 42, 511, 9);
        y -= 15;
    }
    if (i.notes) {
        room(40);
        block('NOTES', 42, 511, 10, true);
        block(i.notes, 42, 511, 9);
    }
    footer();
    doc.setTitle('Invoice ' + (i.number || 'Draft'));
    doc.setAuthor(studio.name);
    return doc.save();
}
