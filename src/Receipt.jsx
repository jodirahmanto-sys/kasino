import { useState } from 'react'
import { digits } from './client'

// Struk + kirim WhatsApp + cetak. Dipakai di Kasir (setelah simpan) dan Riwayat.
export default function Receipt({ text }) {
  const [wa, setWa] = useState('')
  function link() {
    let n = digits(wa)
    if (n.startsWith('0')) n = '62' + n.slice(1)
    return `https://wa.me/${n}?text=${encodeURIComponent(text)}`
  }
  return (
    <div>
      <pre className="receipt print-area">{text.replace(/\*/g, '')}</pre>
      <input className="field" placeholder="No. WhatsApp pelanggan (kosongkan untuk pilih kontak)" inputMode="tel" value={wa} onChange={(e) => setWa(e.target.value)} />
      <a className="btn primary full" href={link()} target="_blank" rel="noreferrer">Kirim struk lewat WhatsApp</a>
      <button className="full" onClick={() => window.print()}>Cetak struk</button>
    </div>
  )
}
