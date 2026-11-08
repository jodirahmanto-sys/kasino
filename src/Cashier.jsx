import { useEffect, useMemo, useState } from 'react'
import { client, rupiah, digits, buildReceipt, tint } from './client'

export default function Cashier({ business }) {
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Semua')
  const [cart, setCart] = useState([])
  const [open, setOpen] = useState(false)
  const [paid, setPaid] = useState('')
  const [method, setMethod] = useState('cash')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [wa, setWa] = useState('')

  useEffect(() => {
    client.from('products').select('id,name,image_url,is_custom,categories(name),product_units(id,unit,price,sort)')
      .eq('business_id', business.id).eq('is_active', true).order('name')
      .then(({ data }) => setProducts((data || []).map((p) => ({ ...p, product_units: [...p.product_units].sort((a, b) => a.sort - b.sort) }))))
  }, [business.id])

  const cats = useMemo(() => [...new Set(products.map((p) => p.categories?.name).filter(Boolean))], [products])
  const shown = products.filter((p) => (cat === 'Semua' || p.categories?.name === cat) && p.name.toLowerCase().includes(q.toLowerCase()))
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)
  const inCart = (id) => cart.filter((i) => i.product_id === id).reduce((s, i) => s + i.qty, 0)

  function add(p, unit, price) {
    const label = p.product_units.length > 1 || p.is_custom ? `${p.name} (${unit})` : p.name
    const key = unit === 'custom' ? p.id + Date.now() : p.id + unit
    setCart((c) => {
      const x = c.find((i) => i.key === key)
      return x ? c.map((i) => (i === x ? { ...i, qty: i.qty + 1 } : i)) : [...c, { key, product_id: p.id, name: label, price, qty: 1 }]
    })
  }
  const addCustom = (p) => { const v = Number(digits(window.prompt(`Harga custom untuk ${p.name} (Rp)`))); if (v > 0) add(p, 'custom', v) }
  const patch = (key, ch) => setCart((c) => c.map((i) => (i.key === key ? { ...i, ...ch } : i)).filter((i) => i.qty > 0))

  async function save() {
    setErr('')
    if (!cart.length) return setErr('Pilih produk dulu.')
    const pay = Number(digits(paid)) || total
    if (pay < total) return setErr('Uang bayar kurang dari total.')
    const { data: t, error } = await client.from('transactions')
      .insert({ business_id: business.id, total, paid: pay, payment_method: method, note: note || null }).select().single()
    if (error) return setErr(error.message)
    const { error: e2 } = await client.from('transaction_items').insert(cart.map((i) => ({
      transaction_id: t.id, business_id: business.id, product_id: i.product_id,
      product_name: i.name, unit_price: i.price, qty: i.qty, subtotal: i.price * i.qty,
    })))
    if (e2) return setErr('Rincian gagal disimpan: ' + e2.message)
    setReceipt(buildReceipt(business, cart, total, pay))
    setCart([]); setPaid(''); setNote(''); setOpen(false)
  }

  function waLink() {
    let n = digits(wa)
    if (n.startsWith('0')) n = '62' + n.slice(1)
    return `https://wa.me/${n}?text=${encodeURIComponent(receipt)}`
  }

  if (receipt) return (
    <section>
      <h2>Transaksi tersimpan</h2>
      <pre className="receipt">{receipt}</pre>
      <input className="field" placeholder="No. WhatsApp pelanggan (08…)" inputMode="tel" value={wa} onChange={(e) => setWa(e.target.value)} />
      <a className="btn primary full" href={waLink()} target="_blank" rel="noreferrer">Kirim struk lewat WhatsApp</a>
      <button className="full" onClick={() => { setReceipt(null); setWa('') }}>Transaksi baru</button>
    </section>
  )

  return (
    <>
      <input className="field" placeholder="Cari produk" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {['Semua', ...cats].map((c) => <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {shown.length === 0 && <p className="muted">Belum ada produk. Tambahkan di menu Daftar harga.</p>}
      <div className="cards">
        {shown.map((p) => (
          <div className="pcard" key={p.id}>
            <div className={`ph t${tint(p.categories?.name || p.name)}`}>{p.image_url ? <img src={p.image_url} alt="" /> : p.name[0]?.toUpperCase()}{inCart(p.id) > 0 && <span className="badge">{inCart(p.id)}</span>}</div>
            <div className="pbody">
              <h3>{p.name}</h3>
              {p.is_custom && <button className="custom" onClick={() => addCustom(p)}>Isi harga custom</button>}
              {p.product_units.map((u) => (
                <button key={u.id} className="unit" onClick={() => add(p, u.unit, u.price)}><span>{u.unit}</span><b>{rupiah(u.price)}</b></button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {count > 0 && (
        <div className="cartbar">
          <div><small>{count} item</small><b className="lcd">{rupiah(total)}</b></div>
          <button className="primary" onClick={() => setOpen(true)}>Lihat pesanan</button>
        </div>
      )}
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>Pesanan</h2>
            <ul className="list">
              {cart.map((i) => (
                <li key={i.key} className="cartrow">
                  <span>{i.name}</span>
                  <input className="price" inputMode="numeric" value={rupiah(i.price)} onChange={(e) => patch(i.key, { price: Number(digits(e.target.value)) })} aria-label={`Harga ${i.name}`} />
                  <button onClick={() => patch(i.key, { qty: i.qty - 1 })}>−</button><b>{i.qty}</b><button onClick={() => patch(i.key, { qty: i.qty + 1 })}>+</button>
                </li>
              ))}
            </ul>
            <p className="total">Total <strong>{rupiah(total)}</strong></p>
            <div className="row">
              <input className="field" placeholder="Uang diterima (kosong = pas)" inputMode="numeric" value={paid ? rupiah(digits(paid)) : ''} onChange={(e) => setPaid(e.target.value)} />
              <select value={method} onChange={(e) => setMethod(e.target.value)}><option value="cash">Tunai</option><option value="qris">QRIS</option><option value="transfer">Transfer</option></select>
            </div>
            <input className="field" placeholder="Catatan (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />
            {err && <p className="error">{err}</p>}
            <div className="row"><button onClick={() => setOpen(false)}>Kembali</button><button className="primary grow" onClick={save}>Simpan transaksi</button></div>
          </div>
        </div>
      )}
    </>
  )
}
