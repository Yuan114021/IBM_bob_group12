import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['食品', '衣物', '家電', '其他']
const CONDITIONS = ['全新', '良好', '普通', '堪用']
const PICKUP_METHODS = ['面交', '自取', '投遞']

export default function PublishPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', category: '食品', description: '',
    condition: '良好', pickup_method: '面交', expiry_date: '', location_display: '',
  })
  const [photo, setPhoto] = useState(null)
  const [showWarning, setShowWarning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matchedDemands, setMatchedDemands] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'category' && value === '食品') setShowWarning(true)
  }

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('您的瀏覽器不支援定位功能'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === 1) reject(new Error('請允許瀏覽器取得位置權限，再重新送出'))
        else reject(new Error('無法取得位置，請確認裝置定位已開啟'))
      }
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('請填寫物品標題'); return }
    if (!form.description.trim()) { setError('請填寫簡要說明'); return }
    if (!form.location_display.trim()) { setError('請填寫顯示地址'); return }
    if (form.category === '食品' && !form.expiry_date) { setError('食品類別必須填寫有效期限'); return }
    setLoading(true); setError('')
    try {
      let pos = { lat: 22.6273, lng: 120.3014 } // 預設高雄女中附近
      try { pos = await getLocation() } catch (_) {}
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => v && data.append(k, v))
      data.append('location_lat', pos.lat)
      data.append('location_lng', pos.lng)
      if (!form.location_display) data.set('location_display', '附近區域')
      if (photo) data.append('photo', photo)
      const res = await api.post('/resources/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (res.data.matched_demands?.length > 0) setMatchedDemands(res.data.matched_demands)
      else navigate('/resources')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || '發布失敗，請稍後再試')
    } finally { setLoading(false) }
  }

  if (matchedDemands.length > 0) return (
    <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 8 }}>物資發布成功！</h2>
      <p style={{ color: 'var(--text-sub)', marginBottom: 16 }}>附近有 <strong>{matchedDemands.length}</strong> 筆相符的需求：</p>
      <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 20, textAlign: 'left' }}>
        {matchedDemands.map(d => (
          <div key={d.id} style={{ fontSize: 14, color: '#7a5c00', padding: '6px 0', borderBottom: '1px solid #f0e0a0' }}>
            <i className="fa-solid fa-clipboard-list" style={{ marginRight: 8 }}></i>{d.title}
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/map')}>前往地圖查看</button>
    </div>
  )

  return (
    <div className="page-content">
      <div className="app-header"><h2><i className="fa-solid fa-box-open"></i>發布物資</h2></div>

      {/* 食品安全警告 Modal */}
      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--r-lg)', padding: 24, maxWidth: 320, margin: '0 16px', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>食品安全提醒</h3>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 16, lineHeight: 1.6 }}>
              本平台僅供善意分享，生鮮食品請自行評估食用安全。請確實填寫有效期限。
            </p>
            <button className="btn btn-primary" style={{ background: '#e67e22', height: 44, lineHeight: '44px', fontSize: 15 }} onClick={() => setShowWarning(false)}>
              我了解，繼續填寫
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">標題 *</label>
          <input name="title" required value={form.title} onChange={handleChange} className="form-input" placeholder="例：自家種的蔬菜、舊電風扇" />
        </div>

        <div className="form-group">
          <label className="form-label">分類 *</label>
          <select name="category" value={form.category} onChange={handleChange} className="form-select">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {form.category === '食品' && (
          <div className="form-group">
            <label className="form-label" style={{ color: '#e67e22' }}>有效期限 * <span style={{ fontSize: 12, fontWeight: 400 }}>(食品必填)</span></label>
            <input type="date" name="expiry_date" required value={form.expiry_date} onChange={handleChange} className="form-input" style={{ borderColor: '#f0a050' }} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">新舊程度 *</label>
          <select name="condition" value={form.condition} onChange={handleChange} className="form-select">
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">取件方式 *</label>
          <select name="pickup_method" value={form.pickup_method} onChange={handleChange} className="form-select">
            {PICKUP_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">簡要說明 *</label>
          <textarea name="description" required value={form.description} onChange={handleChange} className="form-textarea" placeholder="請描述物品狀況、數量等資訊..." />
        </div>

        <div className="form-group">
          <label className="form-label">顯示地址 * <span style={{ fontSize: 12, fontWeight: 400 }}>(模糊即可，不需精確門牌)</span></label>
          <input name="location_display" required value={form.location_display} onChange={handleChange} className="form-input" placeholder="例：信義區附近、中正路一帶" />
        </div>

        <div className="form-group">
          <label className="form-label">物品照片</label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ fontSize: 14, color: 'var(--text-sub)' }} />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .5 : 1 }}>
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
          {loading ? '發布中...' : '發布物資'}
        </button>
      </div>
    </div>
  )
}
