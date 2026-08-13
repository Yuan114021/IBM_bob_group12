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
        <h2><i className="fa-solid fa-seedling"></i>社區共享平台</h2>
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
          {user ? `嗨，${user.username}！` : '歡迎來到社區共享'}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          互助共享，從這裡開始
        </div>
        <div style={{ fontSize: 14, opacity: .8 }}>
          <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent)', marginRight: 4 }}></i>
          附近共 {stats.resources} 件物資・{stats.demands} 筆需求
        </div>
      </div>

      {/* 快速功能 */}
      <div className="section-label">
        <i className="fa-solid fa-grip"></i>快速功能
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
        {[
          { icon: 'fa-box-open', label: '瀏覽物資', count: `${stats.resources} 件`, to: '/resources' },
          { icon: 'fa-map-location-dot', label: '查看地圖', count: '附近資源', to: '/map' },
          { icon: 'fa-clipboard-list', label: '登記需求', count: '告訴鄰居', to: '/demand' },
          { icon: 'fa-plus-circle', label: '發布物資', count: '分享給大家', to: '/publish' },
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

      {/* 公告 */}
      <div className="section-label" style={{ marginTop: 8 }}>
        <i className="fa-solid fa-bullhorn"></i>平台公告
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { title: '食品分享安全提醒', date: '2025/07/10', tag: '置頂', body: '食品類物資請確實標示有效期限，領取者請自行評估食用安全。' },
          { title: '新功能：需求媒合上線', date: '2025/07/08', tag: null, body: '發布物資時，系統將自動比對附近未滿足的需求，方便直接聯繫。' },
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
