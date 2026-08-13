import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['全部', '食品', '衣物', '家電', '其他']

function ResourceCard({ item }) {
  return (
    <Link to={`/resources/${item.id}`} className="block bg-white rounded-xl shadow hover:shadow-md transition p-4 flex gap-3">
      {item.photo_path ? (
        <img src={`http://localhost:8000/${item.photo_path}`} alt={item.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
      ) : (
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0 text-2xl">📦</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.category}</span>
          {item.expiry_date && <span className="text-xs text-orange-500">到期：{item.expiry_date}</span>}
        </div>
        <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 mt-1">📍 {item.location_display} {item.distance_km != null && `· ${item.distance_km} km`}</p>
        <p className="text-xs text-gray-400">{item.pickup_method} · {item.condition}</p>
      </div>
    </Link>
  )
}

function DemandCard({ item }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 text-lg">🙋</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item.category}</span>
        </div>
        <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 mt-1">📍 {item.location_display} {item.distance_km != null && `· ${item.distance_km} km`}</p>
        {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [tab, setTab] = useState('resources')
  const [resources, setResources] = useState([])
  const [demands, setDemands] = useState([])
  const [userPos, setUserPos] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserPos(null)
    )
  }, [])

  const search = async () => {
    setLoading(true)
    try {
      const params = {}
      if (keyword) params.keyword = keyword
      if (category !== '全部') params.category = category
      if (userPos) { params.lat = userPos.lat; params.lng = userPos.lng }

      const [rRes, dRes] = await Promise.all([
        api.get('/resources/', { params }),
        api.get('/demands/', { params }),
      ])
      setResources(rRes.data)
      setDemands(dRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { search() }, [userPos, category])

  const handleSearch = (e) => {
    e.preventDefault()
    search()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 標語 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">🌿 社區物資共享平台</h1>
        <p className="text-gray-500 text-sm mt-1">將多餘的物資分享給有需要的鄰居</p>
      </div>

      {/* 搜尋 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="搜尋物資或需求..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">搜尋</button>
      </form>

      {/* 分類篩選 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${category === c ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 分頁切換 */}
      <div className="flex border-b mb-4">
        <button onClick={() => setTab('resources')} className={`flex-1 py-2 text-sm font-medium ${tab === 'resources' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>
          📦 物資 ({resources.length})
        </button>
        <button onClick={() => setTab('demands')} className={`flex-1 py-2 text-sm font-medium ${tab === 'demands' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          🙋 需求 ({demands.length})
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">載入中...</p>
      ) : tab === 'resources' ? (
        resources.length === 0 ? (
          <p className="text-center text-gray-400 py-8">附近沒有符合的物資</p>
        ) : (
          <div className="flex flex-col gap-3">
            {resources.map(r => <ResourceCard key={r.id} item={r} />)}
          </div>
        )
      ) : (
        demands.length === 0 ? (
          <p className="text-center text-gray-400 py-8">附近沒有符合的需求</p>
        ) : (
          <div className="flex flex-col gap-3">
            {demands.map(d => <DemandCard key={d.id} item={d} />)}
          </div>
        )
      )}
    </div>
  )
}
