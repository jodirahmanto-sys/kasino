import { useState } from 'react'
import { digits } from './client'
import { receiptText } from './receiptLayout'
import { receiptPng, receiptPdf } from './receiptImage'

const getW = () => { try { return localStorage.getItem('kasino_paper') || '58' } catch { return '58' } }

function download(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = name
  document.body.appendChild(a); a.click(); a.remove()
}

// Struk + kirim WhatsApp (gambar PNG atau teks) + cetak/simpan PDF seukuran kertas.
export default function Receipt({ data }) {
  const [wa, setWa] = useState('')
  const [width, setWidth] = useState(getW)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')
  const text = receiptText(data, 32)
  const name = `struk-${data.nota || 'kasino'}`

  function link() {
    let n = digits(wa)
    if (n.startsWith('0')) n = '62' + n.slice(1)
    return `https://wa.me/${n}?text=${encodeURIComponent('```\n' + text + '\n```')}`
  }
  function pickWidth(v) {
    setWidth(v)
    try { localStorage.setItem('kasino_paper', v) } catch { /* abaikan */ }
  }

  async function sharePng() {
    setBusy(true); setInfo('')
    try {
      const blob = await receiptPng(data, width)
      const file = new File([blob], name + '.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Struk' })
      else { download(blob, name + '.png'); setInfo('Gambar struk tersimpan. Lampirkan di WhatsApp lewat tombol klip.') }
    } catch (e) { if (e?.name !== 'AbortError') setInfo('Gagal membuat gambar: ' + e.message) }
    setBusy(false)
  }

  async function printPdf() {
    setBusy(true); setInfo('')
    const w = window.open('', '_blank') // dibuka lebih dulu agar tidak diblokir browser
    try {
      const blob = await receiptPdf(data, width)
      if (w) w.location.href = URL.createObjectURL(blob)
      else { download(blob, name + '.pdf'); setInfo('PDF struk tersimpan. Buka file itu untuk mencetak.') }
    } catch (e) { w?.close(); setInfo('Gagal membuat PDF: ' + e.message) }
    setBusy(false)
  }

  return (
    <div>
      <pre className="receipt">{text}</pre>
      <button className="primary full" onClick={sharePng} disabled={busy}>Kirim gambar struk (PNG)</button>
      <div className="row">
        <button className="grow" onClick={printPdf} disabled={busy}>Cetak / simpan PDF</button>
        <select value={width} onChange={(e) => pickWidth(e.target.value)} aria-label="Lebar kertas">
          <option value="58">Kertas 58 mm</option><option value="80">Kertas 80 mm</option>
        </select>
      </div>
      {info && <p className="muted">{info}</p>}
      <p className="label">Atau kirim sebagai teks</p>
      <input className="field" placeholder="No. WhatsApp pelanggan (kosongkan untuk pilih kontak)" inputMode="tel" value={wa} onChange={(e) => setWa(e.target.value)} />
      <a className="btn full" href={link()} target="_blank" rel="noreferrer">Kirim teks lewat WhatsApp</a>
    </div>
  )
}
