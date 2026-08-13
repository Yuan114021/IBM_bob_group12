import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const SERVICES = ['日間照護', '居家訪視', '課程教學', '健康諮詢', '其他']
const TIME_SLOTS = ['週一至五上午', '週一至五下午', '週一至五晚間', '週末上午', '週末下午', '隨時']

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
    if (!form.name || !form.phone) { setError('請填寫姓名與電話'); return }
    if (form.services.length === 0) { setError('請選擇至少一項服務'); return }
    if (form.time_slots.length === 0) { setError('請選擇至少一個時段'); return }
    setLoading(true); setError('')
    try {
      await api.post('/volunteers/', form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || '登記失敗，請稍後再試')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🙌</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 8 }}>登記成功！</h2>
      <p style={{ color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.7 }}>
        感謝您願意成為社區志工。<br/>您的資料已送出，等待審核後即可開始配對。
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
        <h2><i className="fa-solid fa-hands-holding-circle"></i>成為志工</h2>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">姓名 *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="form-input" placeholder="請輸入真實姓名" />
        </div>

        <div className="form-group">
          <label className="form-label">聯絡電話 *</label>
          <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="form-input" placeholder="0912-345-678" />
        </div>

        <div className="form-group">
          <label className="form-label">可提供服務 *（可複選）</label>
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

        <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--r-md)', padding: '12px 14px', fontSize: 13, color: 'var(--primary-dark)' }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }}></i>
          提交後將等待管理員審核，審核通過後系統將自動為您配對有需要的銀髮族長輩。
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? .5 : 1 }}>
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
          {loading ? '提交中...' : '成為志工'}
        </button>
      </div>
    </div>
  )
}
