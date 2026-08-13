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
        <img src={`http://localhost:8000/${resource.photo_path}`} alt={resource.title} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
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

        {user && user.id === resource.user_id && resource.is_available && (
          <button className="btn btn-primary" onClick={handleClose} disabled={closing} style={{ opacity: closing ? .5 : 1, background: '#555' }}>
            <i className="fa-solid fa-check" style={{ marginRight: 8 }}></i>
            {closing ? '處理中...' : '標記為已領完'}
          </button>
        )}
      </div>
    </div>
  )
}
