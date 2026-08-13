import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import api from '../api'

// 自訂圖示
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
  const [resources, setResources] = useState([])
  const [demands, setDemands] = useState([])
  const [filter, setFilter] = useState('all') // all | resources | demands
  const [userPos, setUserPos] = useState({ lat: 25.033, lng: 121.565 }) // 預設台北

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  useEffect(() => {
    const params = { lat: userPos.lat, lng: userPos.lng, radius_km: 10 }
    api.get('/resources/', { params }).then(r => setResources(r.data))
    api.get('/demands/', { params }).then(r => setDemands(r.data))
  }, [userPos])

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* 圖例與篩選 */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white shadow-sm z-10 flex-shrink-0">
        <span className="text-sm font-medium text-gray-700">顯示：</span>
        {[
          { key: 'all', label: '全部' },
          { key: 'resources', label: '📦 物資' },
          { key: 'demands', label: '🙋 需求' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${filter === f.key ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>物資</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>需求</span>
        </div>
      </div>

      {/* 地圖 */}
      <div className="flex-1">
        <MapContainer center={[userPos.lat, userPos.lng]} zoom={14} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <RecenterMap lat={userPos.lat} lng={userPos.lng} />

          {(filter === 'all' || filter === 'resources') && resources.map(r => (
            <Marker key={`r-${r.id}`} position={[r.location_lat, r.location_lng]} icon={greenIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-gray-500">{r.category} · {r.location_display}</p>
                  <Link to={`/resources/${r.id}`} className="text-green-600 underline mt-1 block">查看詳情</Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {(filter === 'all' || filter === 'demands') && demands.map(d => (
            <Marker key={`d-${d.id}`} position={[d.location_lat, d.location_lng]} icon={blueIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-gray-500">{d.category} · {d.location_display}</p>
                  {d.description && <p className="text-gray-400">{d.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
