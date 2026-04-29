import { useData } from '../context/DataContext.jsx'

const MONTHS = [
  { key:'2025-04', label:'เมษายน 2025' },
  { key:'2025-03', label:'มีนาคม 2025' },
]

export default function ReportsPage() {
  const { income, expenses, exportCSV } = useData()

  return (
    <div>
      {MONTHS.map(({ key, label }) => {
        const mInc = income.filter(x  => x.date.startsWith(key)).reduce((s,x)=>s+x.amount,0)
        const mExp = expenses.filter(x => x.date.startsWith(key)).reduce((s,x)=>s+x.amount,0)
        const mNet = mInc - mExp

        // App breakdown
        const appMap = {}
        income.filter(x => x.date.startsWith(key)).forEach(x => { appMap[x.app_name] = (appMap[x.app_name]||0)+x.amount })
        const apps = Object.entries(appMap).sort((a,b)=>b[1]-a[1])

        // Category breakdown
        const catMap = {}
        expenses.filter(x => x.date.startsWith(key)).forEach(x => { catMap[x.category] = (catMap[x.category]||0)+x.amount })
        const cats = Object.entries(catMap).sort((a,b)=>b[1]-a[1])

        return (
          <div key={key} className="card report-section">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontFamily:'Syne, sans-serif', fontSize:14, fontWeight:600 }}>{label}</div>
              <div className="export-btns">
                <button className="btn-csv" onClick={() => exportCSV(key)}>⬇ Export CSV</button>
              </div>
            </div>

            <div className="report-row">
              <span style={{ color:'var(--text2)' }}>รายรับรวม</span>
              <span style={{ color:'var(--green)', fontWeight:500 }}>${mInc.toLocaleString()}</span>
            </div>
            <div className="report-row">
              <span style={{ color:'var(--text2)' }}>ค่าใช้จ่ายรวม</span>
              <span style={{ color:'var(--red)', fontWeight:500 }}>${mExp.toLocaleString()}</span>
            </div>
            <div className="report-row">
              <span style={{ fontWeight:500 }}>กำไรสุทธิ</span>
              <span style={{ color: mNet>=0 ? 'var(--green)' : 'var(--red)', fontWeight:700, fontSize:16 }}>
                ${mNet.toLocaleString()}
              </span>
            </div>

            {apps.length > 0 && (
              <>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:14, marginBottom:6, letterSpacing:.5 }}>รายรับแยกตามแอป</div>
                {apps.map(([name, amt]) => (
                  <div key={name} className="report-row" style={{ paddingLeft:8 }}>
                    <span style={{ color:'var(--text2)' }}>{name}</span>
                    <span style={{ color:'var(--green)' }}>${amt.toLocaleString()}</span>
                  </div>
                ))}
              </>
            )}

            {cats.length > 0 && (
              <>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:14, marginBottom:6, letterSpacing:.5 }}>ค่าใช้จ่ายแยกหมวด</div>
                {cats.map(([cat, amt]) => (
                  <div key={cat} className="report-row" style={{ paddingLeft:8 }}>
                    <span style={{ color:'var(--text2)' }}>{cat}</span>
                    <span style={{ color:'var(--red)' }}>-${amt.toLocaleString()}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
