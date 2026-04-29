export default function MiniBarChart({ data }) {
  const max = Math.max(...data.flatMap(d => [d.income, d.expense]), 1)
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, display:'flex', alignItems:'flex-end', gap:2 }}>
            <div style={{ flex:1, background:'var(--green)', borderRadius:'3px 3px 0 0', minHeight:4, height:`${(d.income/max)*100}%` }} />
            <div style={{ flex:1, background:'var(--red)', opacity:.7, borderRadius:'3px 3px 0 0', minHeight:4, height:`${(d.expense/max)*100}%` }} />
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:6, marginTop:6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', fontSize:10, color:'var(--text3)' }}>{d.label}</div>
        ))}
      </div>
      <div style={{ display:'flex', gap:12, marginTop:8, fontSize:11 }}>
        <span><span style={{color:'var(--green)'}}>■</span> รายรับ</span>
        <span><span style={{color:'var(--red)'}}>■</span> ค่าใช้จ่าย</span>
      </div>
    </div>
  )
}
