import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['憌?', '銵?', '摰園', '?嗡?']
const CONDITIONS = ['?冽', '?臬末', '?桅?, '?芰']
const PICKUP_METHODS = ['?Ｖ漱', '?芸?', '??']

export default function PublishPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', category: '憌?', description: '',
    condition: '?臬末', pickup_method: '?Ｖ漱', expiry_date: '', location_display: '',
  })
  const [photo, setPhoto] = useState(null)
  const [showWarning, setShowWarning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matchedDemands, setMatchedDemands] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'category' && value === '憌?') setShowWarning(true)
  }

  const getLocation = () => new Promise((resolve, reject) => {
    navigator.geolocation?.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('?⊥???雿蔭'))
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('隢‵撖怎??憿?); return }
    if (!form.description.trim()) { setError('隢‵撖怎陛閬牧??); return }
    if (!form.location_display.trim()) { setError('隢‵撖恍＊蝷箏?'); return }
    if (form.category === '憌?' && !form.expiry_date) { setError('憌?憿敹?憛怠神????'); return }
    setLoading(true); setError('')
    try {
      const pos = await getLocation()
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => v && data.append(k, v))
      data.append('location_lat', pos.lat)
      data.append('location_lng', pos.lng)
      if (!form.location_display) data.set('location_display', '?????)
      if (photo) data.append('photo', photo)
      const res = await api.post('/resources/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (res.data.matched_demands?.length > 0) setMatchedDemands(res.data.matched_demands)
      else navigate('/resources')
    } catch (err) {
      setError(err.response?.data?.detail || '?澆?憭望?嚗?蝔??岫')
    } finally { setLoading(false) }
  }

  if (matchedDemands.length > 0) return (
    <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>??</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 8 }}>?抵??澆???嚗?/h2>
      <p style={{ color: 'var(--text-sub)', marginBottom: 16 }}>????<strong>{matchedDemands.length}</strong> 蝑蝚衣??瘙?</p>
      <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 20, textAlign: 'left' }}>
        {matchedDemands.map(d => (
          <div key={d.id} style={{ fontSize: 14, color: '#7a5c00', padding: '6px 0', borderBottom: '1px solid #f0e0a0' }}>
            <i className="fa-solid fa-clipboard-list" style={{ marginRight: 8 }}></i>{d.title}
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/map')}>???啣??亦?</button>
    </div>
  )

  return (
    <div className="page-content">
      <div className="app-header"><h2><i className="fa-solid fa-box-open"></i>?澆??抵?</h2></div>

      {/* 憌?摰霅血? Modal */}
      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--r-lg)', padding: 24, maxWidth: 320, margin: '0 16px', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>??</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>憌?摰??</h3>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 16, lineHeight: 1.6 }}>
              ?砍像?啣?靘???鈭恬??悅憌?隢銵?隡圈??典??具?蝣箏祕憛怠神??????            </p>
            <button className="btn btn-primary" style={{ background: '#e67e22', height: 44, lineHeight: '44px', fontSize: 15 }} onClick={() => setShowWarning(false)}>
              ??閫??蝜潛?憛怠神
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">璅? *</label>
          <input name="title" required value={form.title} onChange={handleChange} className="form-input" placeholder="靘??芸振蝔桃??祈????駁◢?? />
        </div>

        <div className="form-group">
          <label className="form-label">?? *</label>
          <select name="category" value={form.category} onChange={handleChange} className="form-select">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {form.category === '憌?' && (
          <div className="form-group">
            <label className="form-label" style={{ color: '#e67e22' }}>???? * <span style={{ fontSize: 12, fontWeight: 400 }}>(憌?敹‵)</span></label>
            <input type="date" name="expiry_date" required value={form.expiry_date} onChange={handleChange} className="form-input" style={{ borderColor: '#f0a050' }} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">?啗?蝔漲 *</label>
          <select name="condition" value={form.condition} onChange={handleChange} className="form-select">
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">?辣?孵? *</label>
          <select name="pickup_method" value={form.pickup_method} onChange={handleChange} className="form-select">
            {PICKUP_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">蝪∟?隤芣? *</label>
          <textarea name="description" required value={form.description} onChange={handleChange} className="form-textarea" placeholder="隢?餈啁??瘜??鞈?..." />
        </div>

        <div className="form-group">
          <label className="form-label">憿舐內?啣? * <span style={{ fontSize: 12, fontWeight: 400 }}>(璅∠??喳嚗??蝎曄Ⅱ???</span></label>
          <input name="location_display" required value={form.location_display} onChange={handleChange} className="form-input" placeholder="靘?靽∠儔????葉甇?楝銝撣? />
        </div>

        <div className="form-group">
          <label className="form-label">?拙??抒?</label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ fontSize: 14, color: 'var(--text-sub)' }} />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .5 : 1 }}>
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
          {loading ? '?澆?銝?..' : '?澆??抵?'}
        </button>
      </div>
    </div>
  )
}
