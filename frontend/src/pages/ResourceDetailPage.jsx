import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function ResourceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    api.get(`/resources/${id}`).then(r => setResource(r.data)).finally(() => setLoading(false))
  }, [id])

  const handleClose = async () => {
    if (!confirm('確定要標記此物資為已領完嗎？')) return
    setClosing(true)
    try { await api.patch(`/resources/${id}/close`); navigate('/resources') }
    finally { setClosing(false) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>載入中...</div>
  if (!resource) return <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>找不到此物資</div>

  return (
    <div className="page-content">
      <div className="app-header" style={{ justifyContent: 'flex-start', padding: '0 16px', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 18 }}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 style={{ fontSize: 17 }}><i className="fa-solid fa-box-open"></i>物資詳情</h2>
      </div>

      {resource.photo_path ? (
        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${resource.photo_path}`} alt={resource.title} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 160, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: 48, color: 'var(--primary)', opacity: .4 }}></i>
        </div>
      )}

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <span className="tag tag-green">{resource.category}</span>
          {resource.expiry_date && <span className="tag tag-yellow">到期 {resource.expiry_date}</span>}
          {!resource.is_available && <span className="tag tag-gray">已領完</span>}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{resource.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 16 }}>
          由 <strong>{resource.username}</strong> 發布
        </p>

        {resource.description && (
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 16, fontSize: 14, color: '#555', lineHeight: 1.6 }}>
            {resource.description}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: '取件方式', value: resource.pickup_method, icon: 'fa-handshake' },
            { label: '物品狀態', value: resource.condition || '未標示', icon: 'fa-star-half-stroke' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 4 }}>
                <i className={`fa-solid ${item.icon}`} style={{ marginRight: 4 }}></i>{item.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
          <div style={{ gridColumn: 'span 2', background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 4 }}>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }}></i>大約位置
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>📍 {resource.location_display}</div>
          </div>
        </div>

        {/* 其他用戶：接收 / 聯絡按鈕 */}
        {user && user.id !== resource.user_id && resource.is_available && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary"
              onClick={() => { setRequested(true); setShowContact(true) }}
              style={{ opacity: requested ? .7 : 1 }}
            >
              <i className="fa-solid fa-hand-holding-heart" style={{ marginRight: 8 }}></i>
              {requested ? '已送出接收申請' : '我要接收這項物資'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowContact(true)}
              style={{ background: 'var(--surface)', color: 'var(--primary)', border: '1.5px solid var(--primary)' }}
            >
              <i className="fa-solid fa-comment-dots" style={{ marginRight: 8 }}></i>
              聯絡發布者
            </button>
          </div>
        )}

        {/* 未登入提示 */}
        {!user && resource.is_available && (
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }}></i>
            登入後才能接收物資
          </button>
        )}

        {/* 發布者：標記已領完 */}
        {user && user.id === resource.user_id && resource.is_available && (
          <button className="btn btn-primary" onClick={handleClose} disabled={closing} style={{ opacity: closing ? .5 : 1, background: '#6b7280' }}>
            <i className="fa-solid fa-check" style={{ marginRight: 8 }}></i>
            {closing ? '處理中...' : '標記為已領完'}
          </button>
        )}
      </div>

      {/* 聯絡浮窗 */}
      {showContact && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setShowContact(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 480 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 99, margin: '0 auto 20px' }}></div>
            <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>聯絡發布者</h3>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20, lineHeight: 1.6 }}>
              你想接收 <strong>「{resource.title}」</strong>，請透過以下方式聯絡發布者
              <strong style={{ color: 'var(--primary)' }}> {resource.username}</strong>：
            </p>

            {requested && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#166534' }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }}></i>
                已送出接收申請，對方確認後請保持聯繫。
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn btn-primary"
                style={{ background: '#06b6d4' }}
                onClick={() => { alert(`平台內部訊息功能即將上線！\n目前請透過社區公佈欄或其他方式聯絡 ${resource.username}。`) }}
              >
                <i className="fa-solid fa-envelope" style={{ marginRight: 8 }}></i>
                發送平台訊息（即將上線）
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#25d366' }}
                onClick={() => window.open(`https://line.me/R/msg/text/?我想接收您在好厝邊發布的「${encodeURIComponent(resource.title)}」，請問還有嗎？`)}
              >
                <i className="fa-brands fa-line" style={{ marginRight: 8 }}></i>
                透過 LINE 聯絡
              </button>
            </div>

            <button
              onClick={() => setShowContact(false)}
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
