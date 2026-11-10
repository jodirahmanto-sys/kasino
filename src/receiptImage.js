// Struk teks -> gambar (canvas) -> PNG atau PDF dengan ukuran halaman persis selebar kertas.
const DOTS = { 58: 384, 80: 576 } // titik printer thermal 203 dpi
const SCALE = 2 // 2x supaya tajam

export function receiptCanvas(text, mm = '58') {
  const dots = DOTS[mm] * SCALE
  const pad = 14 * SCALE, fs = 13 * SCALE, lh = 17 * SCALE
  const font = (bold) => `${bold ? 'bold ' : ''}${fs}px ui-monospace, Menlo, Consolas, monospace`
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  const maxW = dots - pad * 2
  const lines = []
  text.replace(/\*/g, '').split('\n').forEach((raw, idx) => {
    ctx.font = font(idx === 0)
    if (!raw) return lines.push({ t: '', b: false })
    let cur = ''
    for (const word of raw.split(' ')) {
      const next = cur ? cur + ' ' + word : word
      if (ctx.measureText(next).width <= maxW) { cur = next; continue }
      if (cur) lines.push({ t: cur, b: idx === 0 })
      cur = ''
      for (const ch of word) { // kata terlalu panjang: potong per huruf
        if (ctx.measureText(cur + ch).width > maxW) { lines.push({ t: cur, b: idx === 0 }); cur = ch } else cur += ch
      }
    }
    lines.push({ t: cur, b: idx === 0 })
  })
  c.width = dots
  c.height = Math.max(lines.length * lh + pad * 2, Math.round(dots * 1.2))
  const g = c.getContext('2d')
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = '#000'; g.textBaseline = 'top'
  lines.forEach((l, i) => { g.font = font(l.b); g.fillText(l.t, pad, pad + i * lh) })
  return c
}

export const receiptPng = (text, mm) =>
  new Promise((res) => receiptCanvas(text, mm).toBlob(res, 'image/png'))

export async function receiptPdf(text, mm = '58') {
  const { jsPDF } = await import('jspdf')
  const c = receiptCanvas(text, mm)
  const w = Number(mm)
  const h = (c.height / c.width) * w
  const pdf = new jsPDF({ unit: 'mm', format: [w, h], orientation: 'portrait' })
  pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, w, h)
  return pdf.output('blob')
}
