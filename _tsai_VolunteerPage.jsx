import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const SERVICES = ['?仿??扯風', '撅振閮芾?', '隤脩??飛', '?亙熒隢株岷', '?嗡?']
const TIME_SLOTS = ['?曹??喃?銝?', '?曹??喃?銝?', '?曹??喃???', '?望銝?', '?望銝?', '?冽?']

export default function VolunteerPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', services: [], time_slots: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const toggle = (field, val) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(val)
        ? prev[field].filter(x => x !== val)
        : [...prev[field], val]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) { setError('隢‵撖怠????餉店'); return }
    if (form.services.length === 0) { setError('隢?撠?????); return }
    if (form.time_slots.length === 0) { setError('隢?撠???畾?); return }
    setLoading(true); setError('')
    try {
      await api.post('/volunteers/', form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || '?餉?憭望?嚗?蝔??岫')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>??</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 8 }}>?餉???嚗?/h2>
      <p style={{ color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.7 }}>
        ???券????箇冗?敹極??br/>?函?鞈?撌脤嚗?敺祟?詨??喳??????      </p>
      <button className="btn btn-primary" onClick={() => navigate('/matching')}>?亦???蝯?</button>
      <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => navigate('/')}>????/button>
    </div>
  )

  return (
    <div className="page-content">
      <div className="app-header" style={{ justifyContent: 'flex-start', padding: '0 16px', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 18 }}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2><i className="fa-solid fa-hands-holding-circle"></i>?敹極</h2>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">憪? *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="form-input" placeholder="隢撓?亦?撖血??? />
        </div>

        <div className="form-group">
          <label className="form-label">?舐窗?餉店 *</label>
          <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="form-input" placeholder="0912-345-678" />
        </div>

        <div className="form-group">
          <label className="form-label">?舀?靘???*嚗銴嚗?/label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {SERVICES.map(s => (
              <button key={s} type="button" onClick={() => toggle('services', s)} style={{
                padding: '7px 14px', borderRadius: 9999, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                background: form.services.includes(s) ? 'var(--primary)' : 'var(--surface)',
                color: form.services.includes(s) ? '#fff' : 'var(--text-sub)',
                border: `1.5px solid ${form.services.includes(s) ? 'var(--primary)' : 'var(--border)'}`,
              }}>{s}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">?舀???畾?*嚗銴嚗?/label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {TIME_SLOTS.map(t => (
              <button key={t} type="button" onClick={() => toggle('time_slots', t)} style={{
                padding: '7px 14px', borderRadius: 9999, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                background: form.time_slots.includes(t) ? 'var(--accent)' : 'var(--surface)',
                color: form.time_slots.includes(t) ? '#7a5c00' : 'var(--text-sub)',
                border: `1.5px solid ${form.time_slots.includes(t) ? 'var(--accent)' : 'var(--border)'}`,
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--r-md)', padding: '12px 14px', fontSize: 13, color: 'var(--primary-dark)' }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }}></i>
          ?漱敺?蝑?蝞∠??∪祟?賂?撖拇??敺頂蝯勗??芸??箸????閬??擃格??瑁憬??        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .5 : 1 }}>
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
          {loading ? '?漱銝?..' : '?敹極'}
        </button>
      </div>
    </div>
  )
}
