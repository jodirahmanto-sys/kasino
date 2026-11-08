import { useEffect, useState } from 'react'
import { client, rupiah, buildReceipt, ymd } from './client'
import Receipt from './Receipt'

export default function History({ business, canEdit }) {
  const [mode, setMode] = useState('day')
  const [date, setDate] = useState(new Date())
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')
  const [openId, setOpenId] = useState(null)
  const [tick, setTick] = useState(0)

  const start = mode === 'day' ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : new Date(date.getFullYear(), date.getMonth(), 1)
  const end = mode === 'day' ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1) : new Date(start.getFullYear(), start.getMonth() + 1, 1)

  useEffect(() => {
    client.from('transactions')
      .select('id,total,paid,payment_method,note,created_at,transaction_items(product_name,unit_price,qty)')
      .eq('business_id', business.id).gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
      .order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows(data) })
  }, [business.id, mode, date, tick])

  const shift = (n) => setDate(mode === 'day' ? new Date(date.getFullYear(), date.getMonth(), date.getDate() + n) : new Date(date.getFullYear(), date.getMonth() + n, 1))
  const omzet = rows.reduce((s, r) => s + r.total, 0)
  const sold = {}
  rows.forEach((r) => r.transaction_items.forEach((i) => { sold[i.product_name] = (sold[i.product_name] || 0) + i.qty }))
  const label = date.toLocaleDateString('id-ID', mode === 'day' ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { month: 'long', year: 'numeric' })

  async function remove(r) {
    if (!confirm('Hapus transaksi ini? Omzet akan berkurang.')) return
    const { error } = await client.from('transactions').delete().eq('id', r.id)
    if (error) setErr(error.message); else setTick((t) => t + 1)
  }

  return (
    <section>
      <div className="seg">
        <button className={mode === 'day' ? 'on' : ''} onClick={() => setMode('day')}>Hari</button>
        <button className={mode === 'month' ? 'on' : ''} onClick={() => setMode('month')}>Bulan</button>
      </div>
      <div className="row between nav">
        <button onClick={() => shift(-1)} aria-label="Sebelumnya">‹</button>
        <strong>{label}</strong>
        <button onClick={() => shift(1)} aria-label="Berikutnya">›</button>
      </div>
      <input className="field" type={mode === 'day' ? 'date' : 'month'} value={mode === 'day' ? ymd(date) : ymd(date).slice(0, 7)}
        onChange={(e) => { if (e.target.value) setDate(new Date(e.target.value + (mode === 'day' ? 'T00:00:00' : '-01T00:00:00'))) }} />
      <div className="card display">
        <p className="muted">Omzet</p>
        <p className="big">{rupiah(omzet)}</p>
        <div className="row between"><div><p className="muted">Transaksi</p><b>{rows.length}</b></div><div><p className="muted">Rata-rata per transaksi</p><b>{rupiah(rows.length ? Math.round(omzet / rows.length) : 0)}</b></div></div>
      </div>
      {Object.keys(sold).length > 0 && (
        <div className="card"><h3>Terjual</h3>
          {Object.entries(sold).sort((a, b) => b[1] - a[1]).map(([n, q]) => <div className="row between" key={n}><span>{n}</span><b>{q}</b></div>)}
        </div>
      )}
      <h3>Transaksi</h3>
      {err && <p className="error">{err}</p>}
      {rows.length === 0 && <p className="muted">Belum ada transaksi di periode ini.</p>}
      {rows.map((r) => {
        const items = r.transaction_items.map((i) => ({ name: i.product_name, price: i.unit_price, qty: i.qty }))
        const d = new Date(r.created_at)
        return (
          <div className="card" key={r.id}>
            <div className="row between"><b>{mode === 'day' ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</b><b>{rupiah(r.total)}</b></div>
            <p className="muted">{items.map((i) => `${i.qty}x ${i.name}`).join(', ')}{r.note ? ` (${r.note})` : ''}</p>
            <div className="row">
              <span className="pill">{r.payment_method}</span>
              <button onClick={() => setOpenId(openId === r.id ? null : r.id)}>Lihat struk</button>
              {canEdit && <button className="danger" onClick={() => remove(r)}>Hapus</button>}
            </div>
            {openId === r.id && <Receipt text={buildReceipt(business, items, r.total, r.paid, r.created_at)} />}
          </div>
        )
      })}
    </section>
  )
}
