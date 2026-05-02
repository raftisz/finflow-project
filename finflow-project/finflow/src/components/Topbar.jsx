export default function Topbar({ title, page }) {
  return (
    <div className="topbar">
      <div className="page-title">{title}</div>
      {page === 'dashboard' && (
        <div className="topbar-right">
          <button className="period-btn active">Monthly</button>
          <button className="period-btn">Yearly</button>
        </div>
      )}
    </div>
  )
}
