import { createClient } from '@neon/neon-js'
// Satu client untuk login (client.auth) dan data (client.from)
export const client = createClient(import.meta.env.VITE_NEON_DATABASE_URL)
export const rupiah = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
export const digits = (s) => String(s ?? '').replace(/\D/g, '')
export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Struk teks biasa (tanpa emoji) untuk WhatsApp dan tampilan
export function buildReceipt(b, items, total, pay, date = new Date()) {
  const tgl = new Date(date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  return [
    `*${b.name}*`, b.address, b.phone && `Telp: ${b.phone}`, tgl, '--------------------',
    ...items.map((i) => `${i.qty}x ${i.name} @ ${rupiah(i.price)} = ${rupiah(i.qty * i.price)}`),
    '--------------------', `Total: ${rupiah(total)}`, `Bayar: ${rupiah(pay)}`, `Kembali: ${rupiah(pay - total)}`,
    '', 'Terima kasih sudah berbelanja!',
  ].filter((l) => l !== null && l !== undefined && l !== false && l !== '' || l === '').join('\n')
}
export const tint = (s = '') => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 6

// Perkecil foto di browser (maks 480 px, JPEG) lalu kembalikan sebagai data URL
export function resizeImage(file, max = 480) {
  return new Promise((resolve, reject) => {
    if (file.size > 8 * 1024 * 1024) return reject(new Error('Foto terlalu besar (maksimal 8 MB).'))
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => reject(new Error('File itu bukan gambar yang valid.'))
    img.src = url
  })
}
