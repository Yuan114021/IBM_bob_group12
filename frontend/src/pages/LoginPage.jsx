import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const data = new URLSearchParams()
      data.append('username', form.username)
      data.append('password', form.password)
      const res = await api.post('/auth/login', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      login(res.data.access_token, { username: res.data.username, id: res.data.user_id })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '帳號或密碼錯誤')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="app-header"><h2><i className="fa-solid fa-user"></i>登入</h2></div>

      <div style={{ padding: '32px 24px', flex: 1 }}>
        {/* 頭像區 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--primary-light)', border: '3px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-seedling" style={{ fontSize: 36, color: 'var(--primary)' }}></i>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">使用者名稱</label>
            <input required value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">密碼</label>
            <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="form-input" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8, opacity: loading ? .5 : 1 }}>
            {loading ? '登入中...' : '登入'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/register')}>
            建立新帳號
          </button>
        </form>
      </div>
    </div>
  )
}
