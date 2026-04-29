import { useState, useEffect, useRef } from 'react'
import { useData } from '../context/DataContext.jsx'

const QUICK = [
  'เดือนนี้กำไรเท่าไหร่?',
  'แอปไหนทำเงินดีที่สุด?',
  'ค่าใช้จ่ายสูงสุดคืออะไร?',
  'เปรียบเทียบกับเดือนก่อน',
  'ควรลดค่าใช้จ่ายอะไร?',
  'รายรับจาก App Store vs Play Store',
]

export default function AssistantPage() {
  const { income, expenses, summary, askAssistant, hasBackend } = useData()
  const [msgs,  setMsgs]  = useState([
    { role:'ai', text:'สวัสดีครับ! ผมคือ FinFlow Secretary 💼\nถามอะไรเกี่ยวกับรายรับ รายจ่าย หรือกำไรได้เลยนะครับ' }
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  // Build a local context string from live data for offline answers
  const buildContext = () => {
    const thisM = '2025-04', lastM = '2025-03'
    const mInc = income.filter(x  => x.date.startsWith(thisM)).reduce((s,x)=>s+x.amount,0)
    const mExp = expenses.filter(x => x.date.startsWith(thisM)).reduce((s,x)=>s+x.amount,0)
    const lInc = income.filter(x  => x.date.startsWith(lastM)).reduce((s,x)=>s+x.amount,0)
    const appMap = {}; income.forEach(x => { appMap[x.app_name] = (appMap[x.app_name]||0)+x.amount })
    const top = Object.entries(appMap).sort((a,b)=>b[1]-a[1])[0]
    const catMap = {}; expenses.forEach(x => { catMap[x.category] = (catMap[x.category]||0)+x.amount })
    const topCat = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0]
    return { mInc, mExp, mNet:mInc-mExp, lInc, top, topCat }
  }

  // Simple offline responder when no backend
  const offlineAnswer = (q, ctx) => {
    const lq = q.toLowerCase()
    if (lq.includes('กำไร') || lq.includes('profit'))
      return `กำไรเดือนนี้คือ **$${ctx.mNet.toLocaleString()}** ครับ\n(รายรับ $${ctx.mInc.toLocaleString()} - ค่าใช้จ่าย $${ctx.mExp.toLocaleString()})`
    if (lq.includes('แอปไหน') || lq.includes('best app'))
      return ctx.top ? `แอปที่ทำเงินดีที่สุดคือ **${ctx.top[0]}** รายรับรวม $${ctx.top[1].toLocaleString()} ครับ` : 'ยังไม่มีข้อมูลแอปครับ'
    if (lq.includes('ค่าใช้จ่าย') && lq.includes('สูงสุด') || lq.includes('highest'))
      return ctx.topCat ? `ค่าใช้จ่ายสูงสุดคือหมวด **${ctx.topCat[0]}** รวม $${ctx.topCat[1].toLocaleString()} ครับ` : 'ยังไม่มีข้อมูลครับ'
    if (lq.includes('เดือนก่อน') || lq.includes('compare'))
      return `เดือนก่อน: รายรับ $${ctx.lInc.toLocaleString()}\nเดือนนี้: รายรับ $${ctx.mInc.toLocaleString()}\nเปลี่ยนแปลง ${ctx.lInc ? ((ctx.mInc-ctx.lInc)/ctx.lInc*100).toFixed(1) : 0}%`
    if (lq.includes('ลด') || lq.includes('reduce'))
      return ctx.topCat ? `แนะนำให้พิจารณาลดค่า **${ctx.topCat[0]}** ($${ctx.topCat[1].toLocaleString()}) ซึ่งเป็นค่าใช้จ่ายสูงสุดของคุณครับ` : 'ยังไม่มีข้อมูลพอครับ'
    return `ข้อมูลเดือนนี้:\n• รายรับ: $${ctx.mInc.toLocaleString()}\n• ค่าใช้จ่าย: $${ctx.mExp.toLocaleString()}\n• กำไร: $${ctx.mNet.toLocaleString()}\n\nถามอะไรเพิ่มเติมได้เลยครับ!`
  }

  const send = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    const updated = [...msgs, { role:'user', text:q }]
    setMsgs(updated)
    setLoading(true)

    try {
      let reply
      if (hasBackend) {
        reply = await askAssistant(updated)
      } else {
        // Offline: answer from local data
        await new Promise(r => setTimeout(r, 600)) // simulate thinking
        reply = offlineAnswer(q, buildContext())
      }
      setMsgs(m => [...m, { role:'ai', text:reply }])
    } catch (e) {
      setMsgs(m => [...m, { role:'ai', text:`❌ ไม่สามารถเชื่อมต่อ AI ได้\n\n${e.message}` }])
    }
    setLoading(false)
  }

  return (
    <div className="chat-wrap">
      {/* Header */}
      <div className="chat-head">
        <div className="ai-ava">🤖</div>
        <div>
          <div className="ai-name">FinFlow Secretary</div>
          <div className="ai-status">● {hasBackend ? 'Online · เชื่อมต่อ Backend' : 'Offline Mode · ตอบจากข้อมูลในเครื่อง'}</div>
        </div>
        {summary && (
          <div className="chat-stats">
            <span className="chat-stat">รายรับ <strong>${summary.totalIncome?.toLocaleString()}</strong></span>
            <span className="chat-stat">กำไร <strong className="profit">${summary.netProfit?.toLocaleString()}</strong></span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-msgs">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-ava">{m.role === 'ai' ? '🤖' : '👤'}</div>
            <div className="msg-bub">{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="msg ai">
            <div className="msg-ava">🤖</div>
            <div className="msg-bub"><span className="dot"/><span className="dot"/><span className="dot"/></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Chips */}
      <div className="quick-chips">
        {QUICK.map(q => (
          <button key={q} className="chip" onClick={() => send(q)}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-bottom">
        <input
          className="chat-in"
          placeholder="ถามเกี่ยวกับการเงินของคุณ..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button className="chat-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>↑</button>
      </div>
    </div>
  )
}
