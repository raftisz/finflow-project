import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar({ pages, active, onNav, note }) {
  const { user, logout } = useAuth()
  const initials = (user?.name || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark"><span className="logo-dot" />FinFlow</div>
        <div className="logo-sub">Financial Secretary</div>
      </div>

      <div className="nav-section">Main</div>
      {Object.entries(pages).map(([key, { label, icon }]) => (
        <div
          key={key}
          className={`nav-item${active === key ? ' active' : ''}`}
          onClick={() => onNav(key)}
        >
          <span className="nav-icon">{icon}</span>
          <span>{label}</span>
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-ava">{initials}</div>
          <div className="user-name">{user?.name || user?.email}</div>
          <button className="logout-btn" onClick={logout} title="Logout">✕</button>
        </div>
        <div className="sec-note">
          <div className="sec-label">SECRETARY NOTE</div>
          <div className="sec-text">{note}</div>
        </div>
      </div>
    </div>
  )
}
