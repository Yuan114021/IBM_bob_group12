import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide">🌿 社區共享</Link>
        <div className="flex gap-4 items-center text-sm">
          <Link to="/" className="hover:underline">首頁</Link>
          <Link to="/map" className="hover:underline">地圖</Link>
          {user ? (
            <>
              <Link to="/publish" className="hover:underline">發布物資</Link>
              <Link to="/demand" className="hover:underline">登記需求</Link>
              <span className="opacity-75">Hi, {user.username}</span>
              <button onClick={handleLogout} className="bg-white text-green-700 px-3 py-1 rounded font-medium hover:bg-green-50">
                登出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">登入</Link>
              <Link to="/register" className="bg-white text-green-700 px-3 py-1 rounded font-medium hover:bg-green-50">
                註冊
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
