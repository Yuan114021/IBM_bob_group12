import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const REQUEST_TYPES = ['尿布褲片', '居家清潔', '陪同就醫', '居家照護', '其他']
const CATEGORIES = ['衣物/衣飾', '餐具', '衛生紙', '食品', '日用品', '其他']

export default function MatchingPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('match') // match | request
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)

  // 需求表單
  const [form, setForm] = useState({ request_type: '居家照護', category: '', quantity: '', urgency: '一般', description: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [anonId, setAnonId] = useState('')

  useEffect(() => {
    api.get('/service-requests/match')
      .then(r => setMatchData(r.data))
      .finally(() => setLoading(false))
  }, [])

  const isSupply = ['尿布褲片', '食品', '日用品'].includes(form.request_type)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const res = await api.post('/service-requests/', form)
      setAnonId(res.data.anonymous_id)
    } catch (err) {
      setError('提交失敗，請稍後再試')
    } finally { setSubmitting(false) }
  }

  if (anonId) return (
    <div className="page-content" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 8 }}>需求已提交！</h2>
      <p style={{ color: 'var(--text-sub)', marginBottom: 8 }}>您的匿名查詢代碼：</p>
      <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--r-md)', padding: '14px 20px', fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 24, letterSpacing: 2 }}>
        {anonId}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 24 }}>請記下此代碼以便後續查詢進度</p>
      <button className="btn btn-primary" onClick={() => { setAnonId(''); setTab('match') }}>查看配對結果</button>
    </div>
  )

  return (
    <div className="page-content">
      <div className="app-header"><h2><i className="fa-solid fa-handshake"></i>志工媒合</h2></div>

      {/* 頂部導覽 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'match', icon: 'fa-handshake', label: '配對結果' },
          { key: 'request', icon: 'fa-clipboard-list', label: '提交需求' },
          { key: 'register', icon: 'fa-user-plus', label: '加入志工' },
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

      {/* 配對結果 */}
      {tab === 'match' && (
        <div style={{ padding: '0 0 16px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 0' }}>載入中...</p>
          ) : (
            <>
              {/* 統計 */}
              <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                {[
                  { num: matchData?.stats.elders || 0, label: '銀髮族登記' },
                  { num: matchData?.stats.volunteers || 0, label: '志工登記' },
                  { num: matchData?.stats.matches || 0, label: '成功配對' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{s.num}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 配對列表 */}
              <div className="section-label"><i className="fa-solid fa-link"></i>配對結果</div>
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matchData?.matches.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '24px 0' }}>
                    <p>目前尚無配對</p>
                    <p style={{ fontSize: 13, marginTop: 8 }}>
                      <span onClick={() => navigate('/elder')} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>銀髮族登記</span>
                      {' '}或{' '}
                      <span onClick={() => navigate('/volunteer')} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>成為志工</span>
                      {' '}來開始媒合
                    </p>
                  </div>
                ) : matchData.matches.map((m, i) => (
                  <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{ flex: 1, background: 'var(--primary-light)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>銀髮族</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-dark)' }}>{m.elder.name}</div>
                      </div>
                      <i className="fa-solid fa-handshake" style={{ fontSize: 20, color: 'var(--primary)' }}></i>
                      <div style={{ flex: 1, background: 'var(--accent-light)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>志工</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#7a5c00' }}>{m.volunteer.name}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                      服務：{m.elder.services.join('、')}
                    </div>
                  </div>
                ))}
              </div>

              {/* 未配對 */}
              {matchData?.unmatched.length > 0 && (
                <>
                  <div className="section-label" style={{ marginTop: 8 }}><i className="fa-solid fa-clock"></i>等待配對</div>
                  <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {matchData.unmatched.map(u => (
                      <div key={u.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        <span className="tag tag-yellow">等待志工</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 快速入口 */}
              <div style={{ padding: '16px 16px 0', display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ height: 44, lineHeight: '44px', fontSize: 14 }} onClick={() => navigate('/elder')}>
                  <i className="fa-solid fa-heart" style={{ marginRight: 6 }}></i>銀髮族登記
                </button>
                <button className="btn btn-primary" style={{ height: 44, lineHeight: '44px', fontSize: 14 }} onClick={() => navigate('/volunteer')}>
                  <i className="fa-solid fa-hands-holding-circle" style={{ marginRight: 6 }}></i>成為志工
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 提交需求 */}
      {tab === 'request' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 14 }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">需求類型</label>
            <select value={form.request_type} onChange={e => setForm(p => ({ ...p, request_type: e.target.value }))} className="form-select">
              {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {isSupply && (
            <>
              <div className="form-group">
                <label className="form-label">物資分類</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-select">
                  <option value="">請選擇...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">數量</label>
                <input value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} className="form-input" placeholder="例：2 包、1 件" />
              </div>
              <div className="form-group">
                <label className="form-label">緊急程度</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['一般', '急迫'].map(u => (
                    <button key={u} type="button" onClick={() => setForm(p => ({ ...p, urgency: u }))} style={{
                      flex: 1, padding: '10px', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                      background: form.urgency === u ? (u === '急迫' ? '#fee2e2' : 'var(--primary-light)') : 'var(--surface)',
                      color: form.urgency === u ? (u === '急迫' ? '#b91c1c' : 'var(--primary-dark)') : 'var(--text-sub)',
                      border: `1.5px solid ${form.urgency === u ? (u === '急迫' ? '#fca5a5' : 'var(--primary)') : 'var(--border)'}`,
                    }}>{u === '急迫' ? '🚨 急迫' : '📋 一般'}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">說明</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="form-textarea" placeholder="請詳細說明您的需求..." />
          </div>

          <div className="form-group">
            <label className="form-label">聯絡電話（選填）</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="form-input" placeholder="0912-345-678" />
          </div>

          <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: '#7a5c00' }}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight: 6 }}></i>
            提交後系統將產生匿名代碼，可用來追蹤需求狀態，不會洩露個人資訊。
          </div>

          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ opacity: submitting ? .5 : 1 }}>
            <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
            {submitting ? '提交中...' : '送出需求'}
          </button>
        </div>
      )}
    </div>
  )
}
