import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const CATEGORIES = ['食品', '衣物', '家電', '其他']
const CATEGORY_ICONS = { '食品': 'fa-bowl-rice', '衣物': 'fa-shirt', '家電': 'fa-plug', '其他': 'fa-box' }

export default function DemandPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState('list')           // 'list' | 'add'
  const [demands, setDemands] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [form, setForm] = useState({ title: '', category: '食品', description: '', location_display: '' })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [offerTarget, setOfferTarget] = useState(null)   // 正在提供的需求
  const [offered, setOffered] = useState({})             // { demandId: true }

  const getLocation = () => new Promise((resolve, reject) => {
    navigator.geolocation?.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('無法取得位置'))
    )
  })

  const fetchDemands = async () => {
    setListLoading(true)
    try {
      const res = await api.get('/demands/')
      setDemands(res.data)
    } catch (_) {}
    finally { setListLoading(false) }
  }

  useEffect(() => { fetchDemands() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitLoading(true); setError('')
    try {
      let pos = { lat: 22.6273, lng: 120.3014 }
      try { pos = await getLocation() } catch (_) {}
      await api.post('/demands/', {
        ...form,
        location_lat: pos.lat,
        location_lng: pos.lng,
        location_display: form.location_display || '高雄市三民區（附近）',
      })
      setForm({ title: '', category: '食品', description: '', location_display: '' })
      await fetchDemands()
      setTab('list')
    } catch (err) {
      setError(err.response?.data?.detail || '登記失敗，請稍後再試')
    } finally { setSubmitLoading(false) }
  }

  return (
    <div className="page-content" style={{ background: 'var(--bg)' }}>
      <div className="app-header">
        <h2><i className="fa-solid fa-clipboard-list"></i>需求列表</h2>
      </div>

      {/* Tab 切換 */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', background: 'var(--surface)' }}>
        {[
          { key: 'list', label: '瀏覽需求', icon: 'fa-list' },
          { key: 'add',  label: '登記需求', icon: 'fa-pen-to-square' },
        ].map(t => (
          <div
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, textAlign: 'center', padding: '12px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', color: tab === t.key ? 'var(--primary)' : 'var(--text-sub)',
              borderBottom: tab === t.key ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            }}
          >
            <i className={`fa-solid ${t.icon}`} style={{ marginRight: 5 }}></i>{t.label}
          </div>
        ))}
      </div>

      {/* ── 需求列表 ── */}
      {tab === 'list' && (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {listLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 0' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }}></i>載入中...
            </p>
          ) : demands.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 0' }}>目前沒有需求</p>
          ) : demands.map(d => (
            <div key={d.id} style={{
              background: 'var(--surface)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              padding: '14px',
              borderLeft: '4px solid var(--primary)',
            }}>
              {/* 標題列 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{d.title}</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: 'var(--primary-light)', color: 'var(--primary)', whiteSpace: 'nowrap', marginLeft: 8,
                }}>
                  <i className={`fa-solid ${CATEGORY_ICONS[d.category] || 'fa-box'}`} style={{ marginRight: 3 }}></i>
                  {d.category}
                </span>
              </div>

              {/* 說明 */}
              {d.description && (
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.55, marginBottom: 8 }}>{d.description}</p>
              )}

              {/* 位置 & 發布者 */}
              <div style={{ fontSize: 12, color: 'var(--text-sub)', display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <span><i className="fa-solid fa-location-dot" style={{ marginRight: 3 }}></i>{d.location_display}{d.distance_km != null ? `・${d.distance_km} km` : ''}</span>
                <span><i className="fa-solid fa-user" style={{ marginRight: 3 }}></i>{d.username}</span>
              </div>

              {/* 操作按鈕 */}
              {user && user.id !== d.user_id && (
                <button
                  onClick={() => setOfferTarget(d)}
                  style={{
                    width: '100%', padding: '9px 0', borderRadius: 'var(--r-md)',
                    background: offered[d.id] ? '#e0fce7' : 'var(--primary)',
                    color: offered[d.id] ? '#166534' : '#fff',
                    border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  <i className={`fa-solid ${offered[d.id] ? 'fa-circle-check' : 'fa-hand-holding-heart'}`} style={{ marginRight: 6 }}></i>
                  {offered[d.id] ? '已提供協助' : '我可以提供'}
                </button>
              )}
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%', padding: '9px 0', borderRadius: 'var(--r-md)',
                    background: 'var(--surface)', color: 'var(--primary)',
                    border: '1.5px solid var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 6 }}></i>
                  登入後才能提供協助
                </button>
              )}
              {user && user.id === d.user_id && (
                <div style={{ fontSize: 12, color: 'var(--text-sub)', textAlign: 'center', padding: '6px 0' }}>
                  這是你的需求
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── 登記需求表單 ── */}
      {tab === 'add' && (
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 16 }}>
            告訴大家你需要什麼，或許附近的鄰居可以幫助你！
          </p>
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
              <input value={form.location_display} onChange={e => setForm(p => ({ ...p, location_display: e.target.value }))} className="form-input" placeholder="例：三民區附近" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitLoading} style={{ opacity: submitLoading ? .5 : 1 }}>
              <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
              {submitLoading ? '登記中...' : '送出需求'}
            </button>
          </form>
        </div>
      )}

      {/* ── 提供協助浮窗 ── */}
      {offerTarget && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setOfferTarget(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 480 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 99, margin: '0 auto 20px' }}></div>
            <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>提供協助</h3>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20, lineHeight: 1.6 }}>
              你想協助 <strong style={{ color: 'var(--primary)' }}>{offerTarget.username}</strong> 的需求：
              <strong>「{offerTarget.title}」</strong>，請選擇聯絡方式：
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* 發布物資 */}
              <button
                className="btn btn-primary"
                onClick={() => { navigate('/publish'); setOfferTarget(null) }}
              >
                <i className="fa-solid fa-box-open" style={{ marginRight: 8 }}></i>
                發布相關物資給他
              </button>

              {/* LINE */}
              <button
                className="btn btn-primary"
                style={{ background: '#25d366' }}
                onClick={() => {
                  window.open(`https://line.me/R/msg/text/?我看到您在好厝邊登記了「${encodeURIComponent(offerTarget.title)}」的需求，我可以提供，請問方便聯繫嗎？`)
                  setOffered(prev => ({ ...prev, [offerTarget.id]: true }))
                  setOfferTarget(null)
                }}
              >
                <i className="fa-brands fa-line" style={{ marginRight: 8 }}></i>
                透過 LINE 聯絡對方
              </button>

              {/* 平台訊息（預留） */}
              <button
                className="btn btn-primary"
                style={{ background: '#06b6d4' }}
                onClick={() => {
                  alert(`平台內部訊息功能即將上線！\n目前請透過 LINE 或社區公佈欄聯絡 ${offerTarget.username}。`)
                  setOffered(prev => ({ ...prev, [offerTarget.id]: true }))
                  setOfferTarget(null)
                }}
              >
                <i className="fa-solid fa-envelope" style={{ marginRight: 8 }}></i>
                發送平台訊息（即將上線）
              </button>
            </div>

            <button
              onClick={() => setOfferTarget(null)}
              style={{ marginTop: 16, width: '100%', background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: 14, cursor: 'pointer', padding: 8 }}
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
