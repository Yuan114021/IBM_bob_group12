import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['憌?', '銵?', '摰園', '?嗡?']

export default function DemandPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', category: '憌?', description: '', location_display: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getLocation = () => new Promise((resolve, reject) => {
    navigator.geolocation?.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('?⊥???雿蔭'))
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const pos = await getLocation()
      await api.post('/demands/', { ...form, location_lat: pos.lat, location_lng: pos.lng, location_display: form.location_display || '????? })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '?餉?憭望?嚗?蝔??岫')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-content">
      <div className="app-header"><h2><i className="fa-solid fa-clipboard-list"></i>?瘙閮?/h2></div>

      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 16 }}>
          ?迄憭批振雿?閬?暻潘??迂???撅隞亙鼠?拐?嚗?        </p>

        {/* ???瘙???- 隞?詨?＊蝷箄”??*/}
        <div className="section-label" style={{ padding: '0 0 10px' }}>
          <i className="fa-solid fa-pen-to-square"></i>?啣??瘙?        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">?瘙???/label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-select">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">?瘙?憿?*</label>
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="form-input" placeholder="靘??閬為?﹝?押??曇??駁?" />
          </div>

          <div className="form-group">
            <label className="form-label">閰喟敦隤芣?</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="form-textarea" placeholder="隤芣?雿??瘙敦蝭嚗?憒偕撖詻??.." />
          </div>

          <div className="form-group">
            <label className="form-label">憿舐內?啣?嚗芋蝟?荔?</label>
            <input value={form.location_display} onChange={e => setForm(p => ({ ...p, location_display: e.target.value }))} className="form-input" placeholder="靘?靽∠儔???" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? .5 : 1 }}>
            <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
            {loading ? '?餉?銝?..' : '??瘙?}
          </button>
        </form>
      </div>
    </div>
  )
}
