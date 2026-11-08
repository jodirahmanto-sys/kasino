import { useState } from 'react'
import { client } from './client'

const THEMES = [['laut', 'Laut', '#0E8F8A'], ['sakura', 'Sakura', '#E0527A'], ['jeruk', 'Jeruk', '#F07A1F'], ['ungu', 'Ungu', '#7A5AF8'], ['hutan', 'Hutan', '#2F9E62']]

export default function Settings({ business, canEdit, onSaved }) {
  const [f, setF] = useState({ theme: business.theme || 'laut', name: business.name, business_type: business.business_type || '', phone: business.phone || '', address: business.address || '' })
  const [msg, setMsg] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function save(e) {
    e.preventDefault()
    setMsg('')
    const body = { name: f.name.trim(), business_type: f.business_type.trim() || null, phone: f.phone.trim() || null, address: f.address.trim() || null, theme: f.theme }
    const { data, error } = await client.from('businesses').update(body).eq('id', business.id).select().single()
    if (error) return setMsg('Gagal menyimpan: ' + error.message)
    onSaved(data); setMsg('Perubahan tersimpan.')
  }

  return (
    <section>
      <h2>Pengaturan usaha</h2>
      <p className="muted">Data ini tampil di struk.</p>
      <form className="form" onSubmit={save}>
        <label>Nama usaha<input className="field" value={f.name} onChange={set('name')} required disabled={!canEdit} /></label>
        <label>Jenis usaha<input className="field" value={f.business_type} onChange={set('business_type')} disabled={!canEdit} /></label>
        <label>Nomor telepon<input className="field" value={f.phone} onChange={set('phone')} disabled={!canEdit} /></label>
        <label>Alamat<input className="field" value={f.address} onChange={set('address')} disabled={!canEdit} /></label>
        <div><p className="label">Warna tema</p>
          <div className="themes">{THEMES.map(([k, name, c]) => (
            <button type="button" key={k} className={'swatch' + (f.theme === k ? ' on' : '')} style={{ background: c }} aria-label={name} title={name} disabled={!canEdit}
              onClick={() => { setF({ ...f, theme: k }); document.documentElement.dataset.theme = k }} />
          ))}</div></div>
        {msg && <p className={msg.startsWith('Gagal') ? 'error' : 'muted'}>{msg}</p>}
        {canEdit ? <button className="primary">Simpan perubahan</button> : <p className="muted">Hanya pemilik yang bisa mengubah pengaturan.</p>}
      </form>
    </section>
  )
}
