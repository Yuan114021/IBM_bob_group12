import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
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
  const [resources, setResources] = useState([])
  const [demands, setDemands] = useState([])
  const [filter, setFilter] = useState('all')
  const [userPos, setUserPos] = useState({ lat: 25.033, lng: 121.565 })

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
    ...resources.slice(0, 3).map(r => ({ ...r, type: 'resource' })),
    ...demands.slice(0, 2).map(d => ({ ...d, type: 'demand' })),
  ].sort((a, b) => (a.distance_km || 99) - (b.distance_km || 99)).slice(0, 5)

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
            <div key={`${item.type}-${item.id}`} className="nearby-card"
              onClick={() => item.type === 'resource' && navigate(`/resources/${item.id}`)}
              style={{ cursor: item.type === 'resource' ? 'pointer' : 'default' }}
            >
              <div className={`ni-icon ${item.type === 'resource' ? 'g' : 'b'}`}>
                <i className={`fa-solid ${item.type === 'resource' ? 'fa-box-open' : 'fa-clipboard-list'}`}></i>
              </div>
              <div className="ni-info">
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
          ))}
        </div>
      </div>
    </div>
  )
}
