import { useEffect, useState } from 'react'
import { client } from './client'
import Products from './Products'
import Cashier from './Cashier'
import History from './History'
import Settings from './Settings'
import Guide from './Guide'

function Login({ onIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  async function submit(e) {
    e.preventDefault()
    setErr('')
    const { error } = await client.auth.signIn.email({ email, password })
    if (error) return setErr('Email atau password salah.')
    const { data } = await client.auth.getSession()
    onIn(data?.user ?? null)
  }
  return (
    <main className="login">
      <img className="logo-full" src="/logo-full.png" alt="KASINO, Kasir Inovasi untuk Kedai dan UMKM" />
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {err && <p className="error">{err}</p>}
        <button className="primary">Masuk</button>
      </form>
    </main>
  )
}

const ICON = {
  kasir: 'M4 5h2l2 9h9l2-6H7M9.5 19.5h.01M16.5 19.5h.01',
  riwayat: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  produk: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
  pengaturan: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4',
}
const TABS = [['kasir', 'Kasir'], ['riwayat', 'Riwayat'], ['produk', 'Harga'], ['pengaturan', 'Atur']]

function Shell({ user, onOut }) {
  const [list, setList] = useState([])
  const [current, setCurrent] = useState(null)
  const [tab, setTab] = useState('kasir')
  const [guide, setGuide] = useState(false)
  const [msg, setMsg] = useState('Memuat usaha…')

  useEffect(() => {
    client.from('memberships').select('role, businesses(id, name, business_type, phone, address, theme)').then(({ data, error }) => {
      if (error) return setMsg('Gagal memuat usaha: ' + error.message)
      const rows = (data || []).filter((r) => r.businesses)
      setList(rows)
      setCurrent(rows[0]?.businesses.id ?? null)
      if (!rows.length) setMsg('Akunmu belum ditautkan ke usaha mana pun. Hubungi admin KASINO.')
    })
  }, [])

  const row = list.find((r) => r.businesses.id === current)
  const b = row?.businesses
  const canEdit = row?.role === 'owner'
  useEffect(() => { document.documentElement.dataset.theme = b?.theme || 'laut' }, [b?.theme])
  const patchBusiness = (nb) => setList((l) => l.map((r) => (r.businesses.id === nb.id ? { ...r, businesses: nb } : r)))

  return (
    <>
      <header className="bar">
        <img className="logo-img" src="/logo.png" alt="KASINO" />
        {list.length > 1 ? (
          <select className="bizsel" value={current} onChange={(e) => setCurrent(e.target.value)}>
            {list.map((r) => <option key={r.businesses.id} value={r.businesses.id}>{r.businesses.name}</option>)}
          </select>
        ) : b && <strong className="biz">{b.name}</strong>}
        <span className="grow" />
        <button className="small" onClick={() => setGuide(true)}>Panduan</button>
        <button className="small" onClick={onOut}>Keluar</button>
      </header>
      {guide && <Guide onClose={() => setGuide(false)} />}
      <main>
        {!b && <p className="muted">{msg}</p>}
        {b && tab === 'kasir' && <Cashier key={current} business={b} />}
        {b && tab === 'riwayat' && <History key={current} business={b} canEdit={canEdit} />}
        {b && tab === 'produk' && <Products key={current} business={b} canEdit={canEdit} />}
        {b && tab === 'pengaturan' && <Settings key={current} business={b} canEdit={canEdit} onSaved={patchBusiness} />}
      </main>
      {b && (
        <nav className="tabbar">
          {TABS.map(([k, label]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON[k]} /></svg><span>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    client.auth.getSession().then(({ data }) => { setUser(data?.user ?? null); setReady(true) })
  }, [])
  if (!ready) return <p className="muted pad">Memuat…</p>
  if (!user) return <Login onIn={setUser} />
  return <Shell user={user} onOut={async () => { await client.auth.signOut(); setUser(null) }} />
}
