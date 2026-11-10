import { rupiah } from './client'

const p2 = (n) => String(n).padStart(2, '0')
export const fmtDate = (v) => {
  const d = new Date(v)
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} - ${p2(d.getHours())}:${p2(d.getMinutes())}`
}

// Susunan struk. d = { business, date, nota, cashier, customer, items[{name,qty,price}], subtotal, shipping, total, paid, note }
export function receiptLines(d) {
  const L = []
  L.push({ l: d.business.name, bold: true, center: true, big: true })
  if (d.business.address) L.push({ l: d.business.address, center: true })
  if (d.business.phone) L.push({ l: `Telp: ${d.business.phone}`, center: true })
  L.push({ sep: '=' })
  L.push({ l: `Tanggal : ${fmtDate(d.date)}` })
  if (d.nota) L.push({ l: `No Nota : ${d.nota}` })
  if (d.cashier) L.push({ l: `Kasir   : ${d.cashier}` })
  if (d.customer) L.push({ l: `Nama    : ${d.customer}` })
  L.push({ sep: '=' })
  d.items.forEach((i) => {
    L.push({ l: i.name })
    L.push({ l: `${i.qty} x ${rupiah(i.price)}`, r: rupiah(i.qty * i.price) })
  })
  L.push({ sep: '-' })
  if (d.shipping > 0) {
    L.push({ l: 'Subtotal', r: rupiah(d.subtotal) })
    L.push({ l: 'Ongkir', r: rupiah(d.shipping) })
  }
  L.push({ l: 'TOTAL', r: rupiah(d.total), bold: true })
  L.push({ l: 'Bayar', r: rupiah(d.paid) })
  L.push({ l: 'Kembali', r: rupiah(d.paid - d.total) })
  if (d.note) { L.push({ sep: '-' }); L.push({ l: `Catatan: ${d.note}` }) }
  L.push({ sep: '=' })
  L.push({ l: 'Terima kasih sudah berbelanja!', center: true })
  return L
}

// Pecah per kata; kata yang terlalu panjang dipecah per huruf
export function wrap(s, fits) {
  const out = []
  let cur = ''
  for (const w of String(s).split(' ')) {
    const next = cur ? `${cur} ${w}` : w
    if (fits(next)) { cur = next; continue }
    if (cur) { out.push(cur); cur = '' }
    for (const ch of w) { if (fits(cur + ch)) cur += ch; else { out.push(cur); cur = ch } }
  }
  out.push(cur)
  return out
}

// Versi teks (untuk tampilan dan WhatsApp), lebar kolom 32 untuk kertas 58 mm
export function receiptText(d, cols = 32) {
  const fits = (s) => s.length <= cols
  const out = []
  receiptLines(d).forEach((o) => {
    if (o.sep) return out.push(o.sep.repeat(cols))
    if (o.r !== undefined) {
      if (o.l.length + 1 + o.r.length <= cols) return out.push(o.l + ' '.repeat(cols - o.l.length - o.r.length) + o.r)
      wrap(o.l, fits).forEach((x) => out.push(x))
      return out.push(o.r.padStart(cols))
    }
    wrap(o.l, fits).forEach((x) => out.push(o.center ? ' '.repeat(Math.max(0, Math.floor((cols - x.length) / 2))) + x : x))
  })
  return out.join('\n')
}
