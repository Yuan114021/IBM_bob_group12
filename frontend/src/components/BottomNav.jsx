import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  const p = location.pathname

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={`nav-item ${p === '/' ? 'active' : ''}`}>
        <i className="fa-solid fa-house"></i>首頁
      </NavLink>
      <NavLink to="/resources" className={`nav-item ${p === '/resources' ? 'active' : ''}`}>
        <i className="fa-solid fa-box-open"></i>物資
      </NavLink>
      <NavLink to="/matching" className={`nav-item ${p === '/matching' || p === '/volunteer' || p === '/elder' ? 'active' : ''}`}>
        <i className="fa-solid fa-handshake"></i>志工
      </NavLink>
      <NavLink to="/map" className={`nav-item ${p === '/map' ? 'active' : ''}`}>
        <i className="fa-solid fa-map-location-dot"></i>地圖
      </NavLink>
      <NavLink to={user ? '/profile' : '/login'} className={`nav-item ${p === '/profile' || p === '/login' ? 'active' : ''}`}>
        <i className="fa-solid fa-user"></i>我的
      </NavLink>
    </nav>
  )
}
