import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const SERVICES = ['日間照護', '居家訪視', '課程教學', '健康諮詢', '其他']
const TIME_SLOTS = ['週一至五上午', '週一至五下午', '週一至五晚間', '週末上午', '週末下午', '隨時']

export default function ElderPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', services: [], time_slots: [], note: '' })
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
    if (!form.name) { setError('請填寫姓名'); return }
    if (form.services.length === 0) { setError('請選擇至少一項需求服務'); return }
    if (form.time_slots.length === 0) { setError('請選擇至少一個時段'); return }
    setLoading(true); setError('')
    try {
      await api.post('/elders/', form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || '登記失敗，請稍後再試')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>💛</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 8 }}>登記成功！</h2>
      <p style={{ color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.7 }}>
        您的需求已登記完成。<br/>系統將為您媒合合適的志工，我們會盡快聯繫您。
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/matching')}>查看配對結果</button>
      <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => navigate('/')}>回首頁</button>
    </div>
  )

  return (
    <div className="page-content">
      <div className="app-header" style={{ justifyContent: 'flex-start', padding: '0 16px', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 18 }}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2><i className="fa-solid fa-heart"></i>銀髮族協助登記</h2>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">姓名 *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="form-input" placeholder="請輸入姓名" />
        </div>

        <div className="form-group">
          <label className="form-label">需求服務 *（可複選）</label>
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
          <label className="form-label">可服務時段 *（可複選）</label>
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

        <div className="form-group">
          <label className="form-label">備註說明</label>
          <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="form-textarea" placeholder="其他需要補充的事項..." />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .5 : 1 }}>
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
          {loading ? '提交中...' : '確認提交'}
        </button>
      </div>
    </div>
  )
}
