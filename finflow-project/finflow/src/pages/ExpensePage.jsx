import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import Modal from '../components/Modal.jsx'

const CAT_COLORS = { Ads:'var(--gold)', Server:'var(--blue)', Tools:'var(--purple)', API:'var(--green)', Subscription:'var(--red)' }
const CAT_ICONS  = { Ads:'📢', Server:'🖥️', Tools:'🔧', API:'⚡', Subscription:'📋' }
const BLANK = { date:'', name:'', category:'Ads', amount:'', recurring:false }

export default function ExpensePage() {
  const { expenses, addExpense, removeExpense } = useData()
  const [filter, setFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [modal, setModal]  = useState(false)
  const [form,  setForm]   = useState(BLANK)
  const [busy,  setBusy]   = useState(false)

  const filtered = expenses.filter(x =>
    x.name.toLowerCase().includes(filter.toLowerCase()) &&
    (catFilter === '' || x.category === catFilter)
  )

  const save = async () => {
    if (!form.date || !form.name || !form.amount) return
    setBusy(true)
    await addExpense(form)
    setBusy(false)
    setModal(false)
    setForm(BLANK)
  }

  return (
    <div>
      <div className="filter-bar">
        <input className="fi" placeholder="🔍  ค้นหา..." value={filter} onChange={e => setFilter(e.target.value)} style={{ flex:1 }} />
        <select className="fi" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width:140 }}>
          <option value="">ทุกหมวดหมู่</option>
          {['Ads','Server','Tools','API','Subscription'].map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary ml" onClick={() => setModal(true)}>+ เพิ่มค่าใช้จ่าย</button>
      </div>

      <div className="card">
        {filtered.length === 0
          ? <div className="empty"><div className="empty-icon">📋</div><div>ยังไม่มีรายการค่าใช้จ่าย</div></div>
          : filtered.map(x => (
            <div key={x.id} className="txn-row">
              <div className="txn-icon" style={{ background: (CAT_COLORS[x.category]||'gray')+'22' }}>
                {CAT_ICONS[x.category]||'💸'}
              </div>
              <div className="txn-info">
                <div className="txn-name">{x.name}</div>
                <div className="txn-meta">{x.date}{x.recurring ? ' · 🔄 ประจำ' : ''}</div>
              </div>
              <span className="badge" style={{ background:(CAT_COLORS[x.category]||'gray')+'22', color:CAT_COLORS[x.category]||'gray', marginRight:10 }}>
                {x.category}
              </span>
              <div className="txn-amt" style={{ color:'var(--red)' }}>-${Number(x.amount).toLocaleString()}</div>
              <button
                onClick={() => removeExpense(x.id)}
                style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', marginLeft:8, fontSize:14 }}
                title="ลบ"
              >✕</button>
            </div>
          ))
        }
      </div>

      {modal && (
        <Modal title="+ เพิ่มค่าใช้จ่ายใหม่" onClose={() => setModal(false)}>
          <div className="fg"><label>วันที่</label><input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} /></div>
          <div className="fg"><label>ชื่อรายการ</label><input placeholder="Google Ads" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
          <div className="fg">
            <label>หมวดหมู่</label>
            <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
              {['Ads','Server','Tools','API','Subscription'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fg"><label>จำนวนเงิน ($)</label><input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} /></div>
          <label className="check-row">
            <input type="checkbox" checked={form.recurring} onChange={e => setForm({...form, recurring:e.target.checked})} />
            ค่าใช้จ่ายประจำ (Recurring)
          </label>
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>ยกเลิก</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'บันทึก...' : 'บันทึก'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
