import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      let location = { location_lat: 22.6273, location_lng: 120.3014 }
      try {
        const pos = await new Promise((resolve, reject) => navigator.geolocation?.getCurrentPosition(resolve, reject))
        location = { location_lat: pos.coords.latitude, location_lng: pos.coords.longitude }
      } catch (_) {}
      await api.post('/auth/register', { ...form, ...location })
      const data = new URLSearchParams()
      data.append('username', form.username); data.append('password', form.password)
      const loginRes = await api.post('/auth/login', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      login(loginRes.data.access_token, { username: loginRes.data.username, id: loginRes.data.user_id })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '註冊失敗')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="app-header"><h2><i className="fa-solid fa-user-plus"></i>建立帳號</h2></div>

      <div style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">使用者名稱</label>
            <input required value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">密碼</label>
            <input type="password" required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="form-input" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8, opacity: loading ? .5 : 1 }}>
            {loading ? '註冊中...' : '建立帳號'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/login')}>
            已有帳號，去登入
          </button>
        </form>
      </div>
    </div>
  )
}
