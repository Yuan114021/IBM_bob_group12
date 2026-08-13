import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const REQUEST_TYPES = ['撠踹?銴脩?', '撅振皜?', '?芸?撠梢', '撅振?扯風', '?嗡?']
const CATEGORIES = ['銵?/銵?ˇ', '擗', '銵?蝝?, '憌?', '?亦??, '?嗡?']

export default function MatchingPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('match') // match | request
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)

  // ?瘙”??  const [form, setForm] = useState({ request_type: '撅振?扯風', category: '', quantity: '', urgency: '銝??, description: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [anonId, setAnonId] = useState('')

  useEffect(() => {
    api.get('/service-requests/match')
      .then(r => setMatchData(r.data))
      .finally(() => setLoading(false))
  }, [])

  const isSupply = ['撠踹?銴脩?', '憌?', '?亦??].includes(form.request_type)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const res = await api.post('/service-requests/', form)
      setAnonId(res.data.anonymous_id)
    } catch (err) {
      setError('?漱憭望?嚗?蝔??岫')
    } finally { setSubmitting(false) }
  }

  if (anonId) return (
    <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>??/div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 8 }}>?瘙歇?漱嚗?/h2>
      <p style={{ color: 'var(--text-sub)', marginBottom: 8 }}>?函??踹??亥岷隞?Ⅳ嚗?/p>
      <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--r-md)', padding: '14px 20px', fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 24, letterSpacing: 2 }}>
        {anonId}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 24 }}>隢?銝迨隞?Ⅳ隞乩噶敺??亥岷?脣漲</p>
      <button className="btn btn-primary" onClick={() => { setAnonId(''); setTab('match') }}>?亦???蝯?</button>
    </div>
  )

  return (
    <div className="page-content">
      <div className="app-header"><h2><i className="fa-solid fa-handshake"></i>敹極慦?</h2></div>

      {/* ?撠汗 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'match', icon: 'fa-handshake', label: '??蝯?' },
          { key: 'request', icon: 'fa-clipboard-list', label: '?漱?瘙? },
          { key: 'register', icon: 'fa-user-plus', label: '?敹極' },
        ].map(t => (
          <button key={t.key} onClick={() => t.key === 'register' ? navigate('/volunteer') : setTab(t.key)} style={{
            background: tab === t.key ? 'var(--primary-light)' : 'var(--bg)',
            border: `1.5px solid ${tab === t.key ? 'var(--primary)' : 'var(--border)'}`,
            color: tab === t.key ? 'var(--primary-dark)' : 'var(--text-sub)',
            borderRadius: 'var(--r-md)', padding: '10px 4px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <i className={`fa-solid ${t.icon}`} style={{ fontSize: 18 }}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* ??蝯? */}
      {tab === 'match' && (
        <div style={{ padding: '0 0 16px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 0' }}>頛銝?..</p>
          ) : (
            <>
              {/* 蝯梯? */}
              <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                {[
                  { num: matchData?.stats.elders || 0, label: '?擃格??餉?' },
                  { num: matchData?.stats.volunteers || 0, label: '敹極?餉?' },
                  { num: matchData?.stats.matches || 0, label: '????' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{s.num}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* ???” */}
              <div className="section-label"><i className="fa-solid fa-link"></i>??蝯?</div>
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matchData?.matches.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '24px 0' }}>
                    <p>?桀?撠??</p>
                    <p style={{ fontSize: 13, marginTop: 8 }}>
                      <span onClick={() => navigate('/elder')} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>?擃格??餉?</span>
                      {' '}?' '}
                      <span onClick={() => navigate('/volunteer')} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>?敹極</span>
                      {' '}靘?憪???                    </p>
                  </div>
                ) : matchData.matches.map((m, i) => (
                  <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{ flex: 1, background: 'var(--primary-light)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>?擃格?</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-dark)' }}>{m.elder.name}</div>
                      </div>
                      <i className="fa-solid fa-handshake" style={{ fontSize: 20, color: 'var(--primary)' }}></i>
                      <div style={{ flex: 1, background: 'var(--accent-light)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>敹極</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#7a5c00' }}>{m.volunteer.name}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                      ??嚗m.elder.services.join('??)}
                    </div>
                  </div>
                ))}
              </div>

              {/* ?芷?撠?*/}
              {matchData?.unmatched.length > 0 && (
                <>
                  <div className="section-label" style={{ marginTop: 8 }}><i className="fa-solid fa-clock"></i>蝑???</div>
                  <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {matchData.unmatched.map(u => (
                      <div key={u.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        <span className="tag tag-yellow">蝑?敹極</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 敹恍??*/}
              <div style={{ padding: '16px 16px 0', display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ height: 44, lineHeight: '44px', fontSize: 14 }} onClick={() => navigate('/elder')}>
                  <i className="fa-solid fa-heart" style={{ marginRight: 6 }}></i>?擃格??餉?
                </button>
                <button className="btn btn-primary" style={{ height: 44, lineHeight: '44px', fontSize: 14 }} onClick={() => navigate('/volunteer')}>
                  <i className="fa-solid fa-hands-holding-circle" style={{ marginRight: 6 }}></i>?敹極
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ?漱?瘙?*/}
      {tab === 'request' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">?瘙???/label>
            <select value={form.request_type} onChange={e => setForm(p => ({ ...p, request_type: e.target.value }))} className="form-select">
              {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {isSupply && (
            <>
              <div className="form-group">
                <label className="form-label">?抵???</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-select">
                  <option value="">隢??..</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">?賊?</label>
                <input value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} className="form-input" placeholder="靘?2 ?? 隞? />
              </div>
              <div className="form-group">
                <label className="form-label">蝺亦?摨?/label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['銝??, '?亥翰'].map(u => (
                    <button key={u} type="button" onClick={() => setForm(p => ({ ...p, urgency: u }))} style={{
                      flex: 1, padding: '10px', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                      background: form.urgency === u ? (u === '?亥翰' ? '#fee2e2' : 'var(--primary-light)') : 'var(--surface)',
                      color: form.urgency === u ? (u === '?亥翰' ? '#b91c1c' : 'var(--primary-dark)') : 'var(--text-sub)',
                      border: `1.5px solid ${form.urgency === u ? (u === '?亥翰' ? '#fca5a5' : 'var(--primary)') : 'var(--border)'}`,
                    }}>{u === '?亥翰' ? '? ?亥翰' : '?? 銝??}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">隤芣?</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="form-textarea" placeholder="隢底蝝啗牧???瘙?.." />
          </div>

          <div className="form-group">
            <label className="form-label">?舐窗?餉店嚗憛恬?</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="form-input" placeholder="0912-345-678" />
          </div>

          <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: '#7a5c00' }}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight: 6 }}></i>
            ?漱敺頂蝯勗??Ｙ??踹?隞?Ⅳ嚗?其?餈質馱?瘙???銝?瘣拚?犖鞈???          </div>

          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ opacity: submitting ? .5 : 1 }}>
            <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
            {submitting ? '?漱銝?..' : '??瘙?}
          </button>
        </div>
      )}
    </div>
  )
}
