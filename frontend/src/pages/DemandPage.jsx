import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['食品', '衣物', '家電', '其他']

export default function DemandPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', category: '食品', description: '', location_display: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getLocation = () => new Promise((resolve, reject) => {
    navigator.geolocation?.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('無法取得位置'))
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      // 定位失敗時使用台北市中心作為預設座標
      let pos = { lat: 25.0330, lng: 121.5654 }
      try { pos = await getLocation() } catch (_) {}
      await api.post('/demands/', { ...form, location_lat: pos.lat, location_lng: pos.lng, location_display: form.location_display || '附近區域' })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '登記失敗，請稍後再試')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-content">
      <div className="app-header"><h2><i className="fa-solid fa-clipboard-list"></i>需求登記</h2></div>

      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 16 }}>
          告訴大家你需要什麼，或許附近的鄰居可以幫助你！
        </p>

        {/* 我的需求記錄 - 今日選單先顯示表單 */}
        <div className="section-label" style={{ padding: '0 0 10px' }}>
          <i className="fa-solid fa-pen-to-square"></i>新增需求
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">需求類型</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-select">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">需求標題 *</label>
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="form-input" placeholder="例：需要嬰兒衣物、尋找舊電鍋" />
          </div>

          <div className="form-group">
            <label className="form-label">詳細說明</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="form-textarea" placeholder="說明你的需求細節，例如尺寸、數量..." />
          </div>

          <div className="form-group">
            <label className="form-label">顯示地址（模糊即可）</label>
            <input value={form.location_display} onChange={e => setForm(p => ({ ...p, location_display: e.target.value }))} className="form-input" placeholder="例：信義區附近" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? .5 : 1 }}>
            <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
            {loading ? '登記中...' : '送出需求'}
          </button>
        </form>
      </div>
    </div>
  )
}
