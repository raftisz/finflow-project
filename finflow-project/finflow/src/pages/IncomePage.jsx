import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import Modal from '../components/Modal.jsx'

const CAT_BADGE = { 'App Sale':'badge-green', 'Subscription':'badge-blue', 'In-App Purchase':'badge-gold' }
const PLAT_ICON = { 'App Store':'🍎', 'Play Store':'🤖' }
const BLANK = { date:'', app_name:'', platform:'App Store', amount:'', category:'App Sale' }

export default function IncomePage() {
  const { income, addIncome, removeIncome } = useData()
  const [filter, setFilter] = useState('')
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState(BLANK)
  const [busy,   setBusy]   = useState(false)

  const filtered = income.filter(x =>
    x.app_name.toLowerCase().includes(filter.toLowerCase()) ||
    x.platform.toLowerCase().includes(filter.toLowerCase())
  )

  const save = async () => {
    if (!form.date || !form.app_name || !form.amount) return
    setBusy(true)
    await addIncome(form)
    setBusy(false)
    setModal(false)
    setForm(BLANK)
  }

  return (
    <div>
      <div className="filter-bar">
        <input className="fi" placeholder="🔍  ค้นหาแอป..." value={filter} onChange={e => setFilter(e.target.value)} style={{ flex:1 }} />
        <button className="btn btn-primary ml" onClick={() => setModal(true)}>+ เพิ่มรายรับ</button>
      </div>

      <div className="card">
        {filtered.length === 0
          ? <div className="empty"><div className="empty-icon">💰</div><div>ยังไม่มีรายการรายรับ</div></div>
          : filtered.map(x => (
            <div key={x.id} className="txn-row">
              <div className="txn-icon" style={{ background:'var(--green-bg)' }}>{PLAT_ICON[x.platform]||'💰'}</div>
              <div className="txn-info">
                <div className="txn-name">{x.app_name}</div>
                <div className="txn-meta">{x.platform} · {x.date}</div>
              </div>
              <span className={`badge ${CAT_BADGE[x.category]||'badge-green'}`} style={{ marginRight:10 }}>{x.category}</span>
              <div className="txn-amt" style={{ color:'var(--green)' }}>+${Number(x.amount).toLocaleString()}</div>
              <button
                onClick={() => removeIncome(x.id)}
                style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', marginLeft:8, fontSize:14 }}
                title="ลบ"
              >✕</button>
            </div>
          ))
        }
      </div>

      {modal && (
        <Modal title="+ เพิ่มรายรับใหม่" onClose={() => setModal(false)}>
          <div className="fg"><label>วันที่</label><input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} /></div>
          <div className="fg"><label>ชื่อแอป</label><input placeholder="WordCraft Pro" value={form.app_name} onChange={e => setForm({...form, app_name:e.target.value})} /></div>
          <div className="fg">
            <label>Platform</label>
            <select value={form.platform} onChange={e => setForm({...form, platform:e.target.value})}>
              <option>App Store</option><option>Play Store</option>
            </select>
          </div>
          <div className="fg">
            <label>หมวดหมู่</label>
            <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
              <option>App Sale</option><option>Subscription</option><option>In-App Purchase</option>
            </select>
          </div>
          <div className="fg"><label>จำนวนเงิน ($)</label><input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} /></div>
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'บันทึก...' : 'บันทึก'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
