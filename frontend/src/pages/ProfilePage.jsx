import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [myResources, setMyResources] = useState([])
  const [myDemands, setMyDemands] = useState([])
  const [tab, setTab] = useState('resources')

  useEffect(() => {
    if (!user) return
    api.get('/resources/').then(r => setMyResources(r.data.filter(x => x.user_id === user.id)))
    api.get('/demands/').then(r => setMyDemands(r.data.filter(x => x.user_id === user.id)))
  }, [user])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="page-content">
      <div className="app-header"><h2><i className="fa-solid fa-user"></i>我的帳號</h2></div>

      {/* 個人資訊 header */}
      <div style={{ background: 'var(--primary)', padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%',
          background: 'var(--accent-light)', border: '3px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <i className="fa-solid fa-person" style={{ fontSize: 30, color: 'var(--primary)' }}></i>
        </div>
        <div>
          <div style={{ fontSize: 21, fontWeight: 800, color: '#fff' }}>{user?.username}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>
            <i className="fa-solid fa-seedling" style={{ marginRight: 6, fontSize: 13 }}></i>社區共享成員
          </div>
        </div>
      </div>

      {/* 統計 */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {[
          { num: myResources.length, label: '已發布物資' },
          { num: myDemands.length, label: '需求登記' },
          { num: myResources.filter(r => !r.is_available).length, label: '已完成分享' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{s.num}</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 分頁 */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        {[
          { key: 'resources', label: '我的物資' },
          { key: 'demands', label: '我的需求' },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            fontSize: 15, fontWeight: 600,
            color: tab === t.key ? 'var(--primary)' : 'var(--text-sub)',
            borderBottom: tab === t.key ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer', marginBottom: -2,
          }}>{t.label}</div>
        ))}
      </div>

      {/* 清單 */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(tab === 'resources' ? myResources : myDemands).length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '24px 0' }}>尚無記錄</p>
        ) : (tab === 'resources' ? myResources : myDemands).map(item => (
          <div key={item.id} style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
            padding: '12px 14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: tab === 'resources' ? 'pointer' : 'default',
          }} onClick={() => tab === 'resources' && navigate(`/resources/${item.id}`)}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 3 }}>
                <i className="fa-regular fa-calendar" style={{ marginRight: 4 }}></i>
                {item.created_at?.slice(0, 10)}
              </div>
            </div>
            <span className={`tag ${tab === 'resources' ? (item.is_available ? 'tag-green' : 'tag-gray') : (item.is_fulfilled ? 'tag-gray' : 'tag-yellow')}`}>
              {tab === 'resources' ? (item.is_available ? '分享中' : '已領完') : (item.is_fulfilled ? '已滿足' : '等待中')}
            </span>
          </div>
        ))}
      </div>

      {/* 設定 */}
      <div className="section-label"><i className="fa-solid fa-gear"></i>設定</div>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column' }}>
        {[
          { icon: 'fa-box-open', label: '發布新物資', action: () => navigate('/publish') },
          { icon: 'fa-clipboard-list', label: '登記需求', action: () => navigate('/demand') },
          { icon: 'fa-right-from-bracket', label: '登出', action: handleLogout, red: true },
        ].map((item, i, arr) => (
          <div key={item.label} onClick={item.action} style={{
            background: 'var(--surface)',
            padding: '15px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            fontSize: 16, fontWeight: 600,
            borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            borderRadius: i === 0 ? 'var(--r-md) var(--r-md) 0 0' : i === arr.length - 1 ? '0 0 var(--r-md) var(--r-md)' : 0,
            cursor: 'pointer',
            color: item.red ? '#c0392b' : 'var(--text)',
          }}>
            <i className={`fa-solid ${item.icon}`} style={{ fontSize: 18, color: item.red ? '#c0392b' : 'var(--primary)', width: 20 }}></i>
            {item.label}
            <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--border)' }}></i>
          </div>
        ))}
      </div>
    </div>
  )
}
