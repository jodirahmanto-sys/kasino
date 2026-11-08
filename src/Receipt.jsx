import { useState } from 'react'
import { digits } from './client'

const getW = () => { try { return localStorage.getItem('kasino_paper') || '58' } catch { return '58' } }

// Struk + kirim WhatsApp + cetak. Dipakai di Kasir (setelah simpan) dan Riwayat.
export default function Receipt({ text }) {
  const [wa, setWa] = useState('')
  const [width, setWidth] = useState(getW)
  const plain = text.replace(/\*/g, '')

  function link() {
    let n = digits(wa)
    if (n.startsWith('0')) n = '62' + n.slice(1)
    return `https://wa.me/${n}?text=${encodeURIComponent(text)}`
  }

  function pickWidth(v) {
    setWidth(v)
    try { localStorage.setItem('kasino_paper', v) } catch { /* abaikan */ }
  }

  // Cetak dari jendela kecil berisi struk saja, supaya hanya satu halaman dan tidak memaksa ukuran kertas.
  function print() {
    const w = window.open('', '_blank', 'width=380,height=640')
    if (!w) return alert('Pop-up diblokir. Izinkan pop-up untuk situs ini, lalu coba lagi.')
    const body = plain.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Struk</title><style>@page{margin:0}body{margin:0;padding:3mm;width:${width}mm;font:11px/1.4 ui-monospace,Consolas,monospace;color:#000}pre{margin:0;white-space:pre-wrap;word-break:break-word;font:inherit}</style></head><body><pre>${body}</pre></body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 250)
  }

  return (
    <div>
      <pre className="receipt">{plain}</pre>
      <input className="field" placeholder="No. WhatsApp pelanggan (kosongkan untuk pilih kontak)" inputMode="tel" value={wa} onChange={(e) => setWa(e.target.value)} />
      <a className="btn primary full" href={link()} target="_blank" rel="noreferrer">Kirim struk lewat WhatsApp</a>
      <div className="row">
        <button className="grow" onClick={print}>Cetak struk</button>
        <select value={width} onChange={(e) => pickWidth(e.target.value)} aria-label="Lebar kertas">
          <option value="58">Kertas 58 mm</option><option value="80">Kertas 80 mm</option>
        </select>
      </div>
    </div>
  )
}
