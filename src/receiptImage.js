// Struk -> gambar (canvas) -> PNG atau PDF dengan ukuran halaman persis selebar kertas.
import { receiptLines, wrap } from './receiptLayout'

const COLS = { 58: 32, 80: 48 }
const DOTS = { 58: 384, 80: 576 } // titik printer thermal 203 dpi
const SCALE = 2
const FONT = 'ui-monospace, Menlo, Consolas, monospace'
const font = (ctx, bold, size) => { ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}` }

export function receiptCanvas(d, mm = '58') {
  const cols = COLS[mm]
  const dots = DOTS[mm] * SCALE
  const pad = 12 * SCALE
  const maxW = dots - pad * 2
  const fs = Math.floor(maxW / cols / 0.6)
  const m = document.createElement('canvas').getContext('2d')

  const ops = []
  receiptLines(d).forEach((o) => {
    const size = o.big ? Math.round(fs * 1.25) : fs
    font(m, o.bold, size)
    if (o.sep) return ops.push({ t: o.sep.repeat(Math.floor(maxW / m.measureText(o.sep).width)), size })
    const fits = (s) => m.measureText(s).width <= maxW
    if (o.r !== undefined) {
      if (m.measureText(o.l).width + m.measureText(' ').width * 2 + m.measureText(o.r).width <= maxW) return ops.push({ t: o.l, r: o.r, size, bold: o.bold })
      wrap(o.l, fits).forEach((t) => ops.push({ t, size, bold: o.bold }))
      return ops.push({ t: o.r, x: 'r', size, bold: o.bold })
    }
    wrap(o.l, fits).forEach((t) => ops.push({ t, x: o.center ? 'c' : 'l', size, bold: o.bold }))
  })

  const step = (o) => Math.round(o.size * 1.35)
  const c = document.createElement('canvas')
  c.width = dots
  c.height = ops.reduce((s, o) => s + step(o), 0) + pad * 2
  const g = c.getContext('2d')
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = '#000'; g.textBaseline = 'top'
  let y = pad
  ops.forEach((o) => {
    font(g, o.bold, o.size)
    if (o.r !== undefined) { g.textAlign = 'left'; g.fillText(o.t, pad, y); g.textAlign = 'right'; g.fillText(o.r, dots - pad, y) }
    else if (o.x === 'c') { g.textAlign = 'center'; g.fillText(o.t, dots / 2, y) }
    else if (o.x === 'r') { g.textAlign = 'right'; g.fillText(o.t, dots - pad, y) }
    else { g.textAlign = 'left'; g.fillText(o.t, pad, y) }
    y += step(o)
  })
  return c
}

export const receiptPng = (d, mm) => new Promise((res) => receiptCanvas(d, mm).toBlob(res, 'image/png'))

export async function receiptPdf(d, mm = '58') {
  const { jsPDF } = await import('jspdf')
  const c = receiptCanvas(d, mm)
  const w = Number(mm)
  const imgH = (c.height / c.width) * w
  const pdf = new jsPDF({ unit: 'mm', format: [w, Math.max(imgH, w + 1)], orientation: 'portrait' })
  pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, w, imgH)
  return pdf.output('blob')
}
