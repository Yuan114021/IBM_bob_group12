import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // 取得使用者位置
      let location = {}
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation?.getCurrentPosition(resolve, reject)
        )
        location = { location_lat: pos.coords.latitude, location_lng: pos.coords.longitude }
      } catch (_) {}

      await api.post('/auth/register', { ...form, ...location })

      // 自動登入
      const data = new URLSearchParams()
      data.append('username', form.username)
      data.append('password', form.password)
      const loginRes = await api.post('/auth/login', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      login(loginRes.data.access_token, { username: loginRes.data.username, id: loginRes.data.user_id })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">建立帳號</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">使用者名稱</label>
          <input required value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
          <input type="password" required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
          {loading ? '註冊中...' : '建立帳號'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        已有帳號？<Link to="/login" className="text-green-600 underline">立即登入</Link>
      </p>
    </div>
  )
}
