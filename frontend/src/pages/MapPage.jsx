import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import L from 'leaflet'
import api from '../api'

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

function RecenterMap({ lat, lng }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 14) }, [lat, lng])
  return null
}

export default function MapPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [demands, setDemands] = useState([])
  const [filter, setFilter] = useState('all')
  const [userPos, setUserPos] = useState({ lat: 22.6273, lng: 120.3014 })
  const [actionTarget, setActionTarget] = useState(null)  // { item, mode: 'receive'|'offer' }
  const [offered, setOffered] = useState({})              // { `d-${id}`: true }
  const [requested, setRequested] = useState({})          // { `r-${id}`: true }

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  useEffect(() => {
    const params = { lat: userPos.lat, lng: userPos.lng, radius_km: 10 }
    api.get('/resources/', { params }).then(r => setResources(r.data))
    api.get('/demands/', { params }).then(r => setDemands(r.data))
  }, [userPos])

  const nearby = [
    ...resources.map(r => ({ ...r, type: 'resource' })),
    ...demands.map(d => ({ ...d, type: 'demand' })),
  ].sort((a, b) => (a.distance_km || 99) - (b.distance_km || 99))

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', paddingBottom: 64 }}>
      <div className="app-header">
        <h2><i className="fa-solid fa-map-location-dot"></i>資源地圖</h2>
      </div>

      {/* 篩選 */}
      <div className="filter-bar">
        {[
          { key: 'all', label: '全部' },
          { key: 'resources', label: '物資點', icon: 'fa-box-open' },
          { key: 'demands', label: '需求點', icon: 'fa-clipboard-list' },
        ].map(f => (
          <div key={f.key} className={`chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.icon && <i className={`fa-solid ${f.icon}`} style={{ marginRight: 4 }}></i>}
            {f.label}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: 'var(--text-sub)', flexShrink: 0 }}>
          <span><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)', marginRight: 4 }}></span>物資</span>
          <span><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#1976D2', marginRight: 4 }}></span>需求</span>
        </div>
      </div>

      {/* 地圖 */}
      <div style={{ height: 300, flexShrink: 0 }}>
        <MapContainer center={[userPos.lat, userPos.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <RecenterMap lat={userPos.lat} lng={userPos.lng} />
          {(filter === 'all' || filter === 'resources') && resources.map(r => (
            <Marker key={`r-${r.id}`} position={[r.location_lat, r.location_lng]} icon={greenIcon}>
              <Popup>
                <div style={{ fontFamily: 'inherit', fontSize: 14 }}>
                  <p style={{ fontWeight: 700 }}>{r.title}</p>
                  <p style={{ color: 'var(--text-sub)' }}>{r.category}・{r.location_display}</p>
                  <a onClick={() => navigate(`/resources/${r.id}`)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>查看詳情</a>
                </div>
              </Popup>
            </Marker>
          ))}
          {(filter === 'all' || filter === 'demands') && demands.map(d => (
            <Marker key={`d-${d.id}`} position={[d.location_lat, d.location_lng]} icon={blueIcon}>
              <Popup>
                <div style={{ fontFamily: 'inherit', fontSize: 14 }}>
                  <p style={{ fontWeight: 700 }}>{d.title}</p>
                  <p style={{ color: 'var(--text-sub)' }}>{d.category}・{d.location_display}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 附近清單 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="section-label">
          <i className="fa-solid fa-list-ul"></i>附近資源（{nearby.length} 筆）
        </div>
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nearby.length === 0 ? (
            <p style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '16px 0' }}>附近暫無資源</p>
          ) : nearby.map(item => (
            <div key={`${item.type}-${item.id}`} style={{
              background: 'var(--surface)', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              borderLeft: `4px solid ${item.type === 'resource' ? 'var(--primary)' : '#1976D2'}`,
              padding: '12px 14px',
            }}>
              {/* 上半：icon + 資訊 + 距離 */}
              <div
                onClick={() => item.type === 'resource' && navigate(`/resources/${item.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: item.type === 'resource' ? 'pointer' : 'default' }}
              >
                <div className={`ni-icon ${item.type === 'resource' ? 'g' : 'b'}`}>
                  <i className={`fa-solid ${item.type === 'resource' ? 'fa-box-open' : 'fa-clipboard-list'}`}></i>
                </div>
                <div className="ni-info" style={{ flex: 1 }}>
                  <div className="ni-name">{item.title}</div>
                  <div className="ni-meta">
                    <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }}></i>
                    {item.location_display}&nbsp;
                    <span className={`tag ${item.type === 'resource' ? 'tag-green' : 'tag-yellow'}`}>
                      {item.type === 'resource' ? '物資' : '需求'}
                    </span>
                  </div>
                </div>
                {item.distance_km != null && (
                  <div className="ni-dist">{item.distance_km < 1 ? `${Math.round(item.distance_km * 1000)}m` : `${item.distance_km}km`}</div>
                )}
              </div>

              {/* 下半：操作按鈕 */}
              {item.type === 'resource' && user && user.id !== item.user_id && item.is_available && (
                <button
                  onClick={() => setActionTarget({ item, mode: 'receive' })}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 'var(--r-md)', border: 'none',
                    background: requested[`r-${item.id}`] ? '#e0fce7' : 'var(--primary)',
                    color: requested[`r-${item.id}`] ? '#166534' : '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <i className={`fa-solid ${requested[`r-${item.id}`] ? 'fa-circle-check' : 'fa-hand-holding-heart'}`} style={{ marginRight: 6 }}></i>
                  {requested[`r-${item.id}`] ? '已送出接收申請' : '我要接收這項物資'}
                </button>
              )}
              {item.type === 'demand' && user && user.id !== item.user_id && (
                <button
                  onClick={() => setActionTarget({ item, mode: 'offer' })}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 'var(--r-md)', border: 'none',
                    background: offered[`d-${item.id}`] ? '#e0fce7' : '#1976D2',
                    color: offered[`d-${item.id}`] ? '#166534' : '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <i className={`fa-solid ${offered[`d-${item.id}`] ? 'fa-circle-check' : 'fa-hand-holding-heart'}`} style={{ marginRight: 6 }}></i>
                  {offered[`d-${item.id}`] ? '已提供協助' : '我可以提供'}
                </button>
              )}
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 'var(--r-md)',
                    background: 'none', border: '1.5px solid var(--border)',
                    color: 'var(--text-sub)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 6 }}></i>
                  登入後才能互動
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 接收 / 提供 浮窗 ── */}
      {actionTarget && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setActionTarget(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 480 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 99, margin: '0 auto 20px' }}></div>

            {actionTarget.mode === 'receive' ? (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>聯絡發布者</h3>
                <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20, lineHeight: 1.6 }}>
                  你想接收 <strong>「{actionTarget.item.title}」</strong>，請透過以下方式聯絡
                  <strong style={{ color: 'var(--primary)' }}> {actionTarget.item.username}</strong>：
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button className="btn btn-primary"
                    onClick={() => { navigate(`/resources/${actionTarget.item.id}`); setActionTarget(null) }}>
                    <i className="fa-solid fa-eye" style={{ marginRight: 8 }}></i>查看完整詳情
                  </button>
                  <button className="btn btn-primary" style={{ background: '#25d366' }}
                    onClick={() => {
                      window.open(`https://line.me/R/msg/text/?我想接收您在好厝邊發布的「${encodeURIComponent(actionTarget.item.title)}」，請問還有嗎？`)
                      setRequested(prev => ({ ...prev, [`r-${actionTarget.item.id}`]: true }))
                      setActionTarget(null)
                    }}>
                    <i className="fa-brands fa-line" style={{ marginRight: 8 }}></i>透過 LINE 聯絡
                  </button>
                  <button className="btn btn-primary" style={{ background: '#06b6d4' }}
                    onClick={() => {
                      alert(`平台內部訊息功能即將上線！\n目前請透過 LINE 聯絡 ${actionTarget.item.username}。`)
                      setRequested(prev => ({ ...prev, [`r-${actionTarget.item.id}`]: true }))
                      setActionTarget(null)
                    }}>
                    <i className="fa-solid fa-envelope" style={{ marginRight: 8 }}></i>發送平台訊息（即將上線）
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>提供協助</h3>
                <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20, lineHeight: 1.6 }}>
                  你想協助 <strong style={{ color: '#1976D2' }}>{actionTarget.item.username}</strong> 的需求：
                  <strong>「{actionTarget.item.title}」</strong>，請選擇方式：
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button className="btn btn-primary"
                    onClick={() => { navigate('/publish'); setActionTarget(null) }}>
                    <i className="fa-solid fa-box-open" style={{ marginRight: 8 }}></i>發布相關物資給他
                  </button>
                  <button className="btn btn-primary" style={{ background: '#25d366' }}
                    onClick={() => {
                      window.open(`https://line.me/R/msg/text/?我看到您在好厝邊登記了「${encodeURIComponent(actionTarget.item.title)}」的需求，我可以提供，請問方便聯繫嗎？`)
                      setOffered(prev => ({ ...prev, [`d-${actionTarget.item.id}`]: true }))
                      setActionTarget(null)
                    }}>
                    <i className="fa-brands fa-line" style={{ marginRight: 8 }}></i>透過 LINE 聯絡對方
                  </button>
                  <button className="btn btn-primary" style={{ background: '#06b6d4' }}
                    onClick={() => {
                      alert(`平台內部訊息功能即將上線！\n目前請透過 LINE 聯絡 ${actionTarget.item.username}。`)
                      setOffered(prev => ({ ...prev, [`d-${actionTarget.item.id}`]: true }))
                      setActionTarget(null)
                    }}>
                    <i className="fa-solid fa-envelope" style={{ marginRight: 8 }}></i>發送平台訊息（即將上線）
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setActionTarget(null)}
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
