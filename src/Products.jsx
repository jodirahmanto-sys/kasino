import { useEffect, useState } from 'react'
import { client, rupiah, digits, resizeImage } from './client'

const blank = { id: null, name: '', category: '', image: null, is_custom: false, units: [{ unit: '', price: '' }] }

export default function Products({ business, canEdit }) {
  const [items, setItems] = useState([])
  const [cats, setCats] = useState([])
  const [form, setForm] = useState(null)
  const [err, setErr] = useState('')

  async function load() {
    const [p, c] = await Promise.all([
      client.from('products').select('id,name,image_url,is_custom,category_id,categories(name),product_units(id,unit,price,sort)').eq('business_id', business.id).order('name'),
      client.from('categories').select('id,name').eq('business_id', business.id).order('name'),
    ])
    if (p.error) setErr(p.error.message); else setItems(p.data)
    if (c.data) setCats(c.data)
  }
  useEffect(() => { load() }, [])

  const edit = (p) => setForm({
    id: p.id, name: p.name, category: p.categories?.name || '', image: p.image_url || null, is_custom: p.is_custom,
    units: [...p.product_units].sort((a, b) => a.sort - b.sort).map((u) => ({ unit: u.unit, price: String(u.price) })),
  })
  const setUnit = (k, ch) => setForm((f) => ({ ...f, units: f.units.map((u, i) => (i === k ? { ...u, ...ch } : u)) }))

  async function pick(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { const image = await resizeImage(f); setForm((p) => ({ ...p, image })); setErr('') } catch (x) { setErr(x.message) }
  }

  async function save() {
    setErr('')
    const name = form.name.trim()
    const units = form.units.filter((u) => u.unit.trim() && digits(u.price))
    if (!name) return setErr('Nama produk wajib diisi.')
    if (!units.length && !form.is_custom) return setErr('Isi minimal satu satuan dan harga, atau centang harga custom.')
    let category_id = null
    const cname = form.category.trim()
    if (cname) {
      const found = cats.find((c) => c.name.toLowerCase() === cname.toLowerCase())
      if (found) category_id = found.id
      else {
        const { data, error } = await client.from('categories').insert({ business_id: business.id, name: cname }).select().single()
        if (error) return setErr(error.message)
        category_id = data.id
      }
    }
    const body = { name, is_custom: form.is_custom, category_id, image_url: form.image || null }
    let pid = form.id
    if (pid) {
      const { error } = await client.from('products').update(body).eq('id', pid)
      if (error) return setErr(error.message)
      await client.from('product_units').delete().eq('product_id', pid)
    } else {
      const { data, error } = await client.from('products').insert({ ...body, business_id: business.id }).select().single()
      if (error) return setErr(error.message)
      pid = data.id
    }
    if (units.length) {
      const { error } = await client.from('product_units').insert(units.map((u, k) => ({ product_id: pid, business_id: business.id, unit: u.unit.trim(), price: Number(digits(u.price)), sort: k })))
      if (error) return setErr(error.message)
    }
    setForm(null); load()
  }

  async function remove(p) {
    if (!confirm(`Hapus ${p.name}?`)) return
    const { error } = await client.from('products').delete().eq('id', p.id)
    if (error) setErr(error.message); else load()
  }

  return (
    <section>
      <div className="row between"><h2>Daftar harga</h2>{canEdit && <button className="primary" onClick={() => setForm(blank)}>Produk baru</button>}</div>
      {err && !form && <p className="error">{err}</p>}
      {items.length === 0 && <p className="muted">Belum ada produk. Ketuk Produk baru untuk menambahkan.</p>}
      {items.map((p) => (
        <div className="card" key={p.id}>
          <div className="row between">{p.image_url && <img className="thumb" src={p.image_url} alt="" />}<h3 className="grow">{p.name}</h3>{p.categories?.name && <span className="chip on small">{p.categories.name}</span>}</div>
          {p.is_custom && <p className="muted">Harga custom, diisi saat transaksi</p>}
          {[...p.product_units].sort((a, b) => a.sort - b.sort).map((u) => <div className="unit static" key={u.id}><span>{u.unit}</span><b>{rupiah(u.price)}</b></div>)}
          {canEdit && <div className="row"><button onClick={() => edit(p)}>Ubah</button><button className="danger" onClick={() => remove(p)}>Hapus</button></div>}
        </div>
      ))}
      {form && (
        <div className="overlay" onClick={() => setForm(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>{form.id ? 'Ubah produk' : 'Produk baru'}</h2>
            <input className="field" placeholder="Nama produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="field" placeholder="Kategori (mis. Cheesecake)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            {cats.length > 0 && <div className="chips">{cats.map((c) => <button key={c.id} className="chip" onClick={() => setForm({ ...form, category: c.name })}>{c.name}</button>)}</div>}
            <div className="row">
              <div className="photo">{form.image ? <img src={form.image} alt="Foto produk" /> : <span>?</span>}</div>
              <label className="btn-like">Pilih atau ambil foto<input type="file" accept="image/*" hidden onChange={pick} /></label>
              {form.image && <button className="danger" onClick={() => setForm({ ...form, image: null })}>Hapus foto</button>}
            </div>
            <label className="check"><input type="checkbox" checked={form.is_custom} onChange={(e) => setForm({ ...form, is_custom: e.target.checked })} /> Harga custom, diisi saat transaksi (cocok untuk pesanan khusus)</label>
            <p className="label">Satuan dan harga</p>
            {form.units.map((u, k) => (
              <div className="row" key={k}>
                <input className="field grow" placeholder="Satuan" value={u.unit} onChange={(e) => setUnit(k, { unit: e.target.value })} />
                <input className="field grow" placeholder="Rp 0" inputMode="numeric" value={u.price ? rupiah(digits(u.price)) : ''} onChange={(e) => setUnit(k, { price: e.target.value })} />
                <button className="danger" onClick={() => setForm({ ...form, units: form.units.filter((_, i) => i !== k) })}>Hapus</button>
              </div>
            ))}
            <button className="full" onClick={() => setForm({ ...form, units: [...form.units, { unit: '', price: '' }] })}>Tambah satuan</button>
            {err && <p className="error">{err}</p>}
            <div className="row"><button onClick={() => setForm(null)}>Batal</button><button className="primary grow" onClick={save}>Simpan</button></div>
          </div>
        </div>
      )}
    </section>
  )
}
