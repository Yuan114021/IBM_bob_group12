import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ resources: 0, demands: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/resources/').catch(() => ({ data: [] })),
      api.get('/demands/').catch(() => ({ data: [] })),
    ]).then(([r, d]) => {
      setStats({ resources: r.data.length, demands: d.data.length })
    })
  }, [])

  return (
    <div className="page-content" style={{ background: 'var(--bg)' }}>
      {/* App Header */}
      <div className="app-header">
        <h2><i className="fa-solid fa-seedling"></i>蝷曉??曹澈撟喳</h2>
      </div>

      {/* Banner */}
      <div style={{
        background: 'var(--primary)',
        margin: '14px 16px',
        borderRadius: 'var(--r-md)',
        padding: '20px 18px',
        color: '#fff',
      }}>
        <div style={{ fontSize: 15, opacity: .85, marginBottom: 4 }}>
          {user ? `?剁?${user.username}嚗 : '甇∟?靘蝷曉??曹澈'}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          鈭?曹澈嚗??ㄐ??
        </div>
        <div style={{ fontSize: 14, opacity: .8 }}>
          <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent)', marginRight: 4 }}></i>
          ????{stats.resources} 隞嗥鞈{stats.demands} 蝑?瘙?        </div>
      </div>

      {/* 敹恍???*/}
      <div className="section-label">
        <i className="fa-solid fa-grip"></i>敹恍???      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
        {[
          { icon: 'fa-box-open', label: '?汗?抵?', count: `${stats.resources} 隞跆, to: '/resources' },
          { icon: 'fa-map-location-dot', label: '?亦??啣?', count: '??鞈?', to: '/map' },
          { icon: 'fa-clipboard-list', label: '?餉??瘙?, count: '?迄?啣?', to: '/demand' },
          { icon: 'fa-plus-circle', label: '?澆??抵?', count: '?澈蝯血之摰?, to: '/publish' },
        ].map(q => (
          <div key={q.label} onClick={() => navigate(q.to)} style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            padding: '18px 12px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`fa-solid ${q.icon}`} style={{ fontSize: 22, color: 'var(--primary)' }}></i>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{q.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{q.count}</div>
          </div>
        ))}
      </div>

      {/* ?砍? */}
      <div className="section-label" style={{ marginTop: 8 }}>
        <i className="fa-solid fa-bullhorn"></i>撟喳?砍?
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { title: '憌??澈摰??', date: '2025/07/10', tag: '蝵桅?', body: '憌?憿鞈?蝣箏祕璅內????嚗????芾?閰摯憌摰?? },
          { title: '?啣??踝??瘙???蝺?, date: '2025/07/08', tag: null, body: '?澆??抵???蝟餌絞撠??撠?餈皛輯雲??瘙??嫣噶?湔?舐鼠?? },
        ].map(a => (
          <div key={a.title} style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
            padding: '12px 14px',
            borderLeft: '4px solid var(--primary)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{a.title}</div>
              {a.tag && <span className="tag tag-yellow">{a.tag}</span>}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 5 }}>
              <i className="fa-regular fa-calendar" style={{ marginRight: 3 }}></i>{a.date}
            </div>
            <div style={{ fontSize: 14, color: '#555', lineHeight: 1.55 }}>{a.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
