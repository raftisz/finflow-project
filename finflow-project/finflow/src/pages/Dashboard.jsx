import { useData } from '../context/DataContext.jsx'
import MiniBarChart from '../components/MiniBarChart.jsx'
import LineChart    from '../components/LineChart.jsx'

const CAT_COLORS = {
  Ads:          'var(--gold)',
  Server:       'var(--blue)',
  Tools:        'var(--purple)',
  API:          'var(--green)',
  Subscription: 'var(--red)',
}
const PLAT_ICON = { 'App Store': '🍎', 'Play Store': '🤖' }
const CAT_BADGE = { 'App Sale': 'badge-green', 'Subscription': 'badge-blue', 'In-App Purchase': 'badge-gold' }

export default function Dashboard() {
  const { income, expenses, summary } = useData()

  const thisM = '2025-04', lastM = '2025-03'
  const mInc = income.filter(x => x.date.startsWith(thisM)).reduce((s,x) => s+x.amount, 0)
  const mExp = expenses.filter(x => x.date.startsWith(thisM)).reduce((s,x) => s+x.amount, 0)
  const lInc = income.filter(x => x.date.startsWith(lastM)).reduce((s,x) => s+x.amount, 0)
  const lExp = expenses.filter(x => x.date.startsWith(lastM)).reduce((s,x) => s+x.amount, 0)
  const mNet = mInc - mExp
  const lNet = lInc - lExp

  const incDelta = lInc ? Math.round((mInc - lInc) / lInc * 100) : 0
  const expDelta = lExp ? Math.round((mExp - lExp) / lExp * 100) : 0
  const netDelta = lNet ? Math.round((mNet - lNet) / lNet * 100) : 0

  const insight  = incDelta > 0 ? `รายรับเดือนนี้ดีขึ้นจากเดือนก่อน +${incDelta}% 🎉` : incDelta < 0 ? `รายรับลดลง ${Math.abs(incDelta)}% จากเดือนก่อน ควรตรวจสอบด้วยนะ` : 'รายรับเดือนนี้เท่ากับเดือนก่อน'
  const expHint  = mExp > mInc * 0.4 ? 'ค่าใช้จ่าย Ads ค่อนข้างสูง ควรลดหน่อยนะ 💡' : null

  // Weekly bar data for April
  const barData = [1,2,3,4].map((w) => {
    const s = (w-1)*7+1, e = s+6
    const inc = income.filter(x  => { const d = parseInt(x.date.split('-')[2]); return x.date.startsWith(thisM) && d >= s && d <= e }).reduce((s,x)=>s+x.amount,0)
    const exp = expenses.filter(x => { const d = parseInt(x.date.split('-')[2]); return x.date.startsWith(thisM) && d >= s && d <= e }).reduce((s,x)=>s+x.amount,0)
    return { label: `W${w}`, income: inc, expense: exp }
  })

  const trendPoints = [lInc * 0.7, lInc * 0.9, lInc, mInc * 0.4, mInc * 0.7, mInc]
  const topApps = summary?.topApps || []
  const maxApp  = topApps[0]?.total || 1

  return (
    <div>
      {/* Secretary Banner */}
      <div className="banner">
        <div className="banner-icon">💬</div>
        <div>
          <div className="banner-label">SECRETARY NOTE</div>
          <div className="banner-text">{insight}</div>
          {expHint && <div className="banner-hint">{expHint}</div>}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard label="รายรับเดือนนี้"  value={`$${mInc.toLocaleString()}`} delta={incDelta} color="var(--green)" />
        <StatCard label="ค่าใช้จ่าย"       value={`$${mExp.toLocaleString()}`} delta={expDelta} color="var(--red)"   inverted />
        <StatCard label="กำไรสุทธิ"        value={`$${mNet.toLocaleString()}`} delta={netDelta} color="var(--blue)" />
        <StatCard label="แอปทั้งหมด"       value={`${topApps.length}`}        delta={null}     color="var(--purple)" />
      </div>

      {/* Charts Row */}
      <div className="g3">
        <div className="card">
          <div className="card-title">รายรับ vs ค่าใช้จ่าย (รายสัปดาห์)</div>
          <MiniBarChart data={barData} />
        </div>
        <div className="card">
          <div className="card-title">Trend รายรับ</div>
          <LineChart points={trendPoints} height={110} />
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>ช่วง 2 เดือนที่ผ่านมา</div>
        </div>
      </div>

      {/* Top Apps + Expense Categories */}
      <div className="g2">
        <div className="card">
          <div className="card-title">
            <span>แอปที่ทำรายได้สูงสุด</span>
            <span className="card-sub">เดือนนี้</span>
          </div>
          {topApps.length === 0
            ? <div className="empty"><div className="empty-icon">📱</div><div>ยังไม่มีข้อมูล</div></div>
            : topApps.map(({ app_name, total }) => {
                const plat = income.find(x => x.app_name === app_name)?.platform || ''
                return (
                  <div key={app_name} className="app-row">
                    <div className="app-info">
                      <div className="app-name">{app_name}</div>
                      <div className="app-plat">{PLAT_ICON[plat]} {plat}</div>
                    </div>
                    <div className="bar-wrap">
                      <div className="bar-bg">
                        <div className="bar-fill" style={{ width: `${(total/maxApp)*100}%` }} />
                      </div>
                    </div>
                    <div className="app-amt">${total.toLocaleString()}</div>
                  </div>
                )
              })
          }
        </div>

        <div className="card">
          <div className="card-title">
            <span>ค่าใช้จ่ายแยกหมวด</span>
            <span className="card-sub">เดือนนี้</span>
          </div>
          {(summary?.expByCategory || []).map(({ category, total }) => (
            <div key={category} className="cat-row">
              <span className="badge" style={{ background: (CAT_COLORS[category]||'gray')+'22', color: CAT_COLORS[category]||'gray' }}>
                {category}
              </span>
              <span className="cat-amt">${total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, delta, color, inverted = false }) {
  const isUp = delta > 0
  const good = inverted ? !isUp : isUp
  return (
    <div className="stat-card" style={{ borderTop: `2px solid ${color}` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-val"  style={{ color }}>{value}</div>
      {delta !== null && (
        <div className="stat-delta">
          <span className={good ? 'up' : 'down'}>{isUp ? '▲' : '▼'} {Math.abs(delta)}%</span>
          <span style={{ color:'var(--text3)' }}>จากเดือนก่อน</span>
        </div>
      )}
    </div>
  )
}
