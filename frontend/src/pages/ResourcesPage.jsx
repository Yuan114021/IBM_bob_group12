import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['全部', '食品', '衣物', '家電', '其他']
const CATEGORY_ICONS = { '食品': 'fa-bowl-rice', '衣物': 'fa-shirt', '家電': 'fa-plug', '其他': 'fa-box' }

export default function ResourcesPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('全部')
  const [keyword, setKeyword] = useState('')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [userPos, setUserPos] = useState(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  const fetchResources = async (cat, kw) => {
    setLoading(true)
    try {
      const params = {}
      if (kw) params.keyword = kw
      if (cat !== '全部') params.category = cat
      if (userPos) { params.lat = userPos.lat; params.lng = userPos.lng }
      const res = await api.get('/resources/', { params })
      setResources(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResources(category, keyword) }, [category, userPos])

  const handleSearch = e => { e.preventDefault(); fetchResources(category, keyword) }

  return (
    <div className="page-content" style={{ background: 'var(--bg)' }}>
      <div className="app-header">
        <h2><i className="fa-solid fa-box-open"></i>物資瀏覽</h2>
      </div>

      {/* 搜尋 */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, padding: '10px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="搜尋物資..."
          style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)' }}
        />
        <button type="submit" className="btn-sm btn-primary">搜尋</button>
      </form>

      {/* 分類篩選 */}
      <div className="filter-bar">
        {CATEGORIES.map(c => (
          <div key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {CATEGORY_ICONS[c] && <i className={`fa-solid ${CATEGORY_ICONS[c]}`} style={{ marginRight: 4 }}></i>}
            {c}
          </div>
        ))}
      </div>

      {/* 列表 */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 0' }}>載入中...</p>
        ) : resources.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 0' }}>附近沒有符合的物資</p>
        ) : resources.map(r => (
          <div key={r.id} className="goods-card" onClick={() => navigate(`/resources/${r.id}`)} style={{ cursor: 'pointer' }}>
            <div className="gc-top">
              <div className="gc-meta" style={{ marginBottom: 4 }}>
                <span className="tag tag-green">{r.category}</span>
                {r.expiry_date && <span className="tag tag-yellow" style={{ marginLeft: 6 }}>到期 {r.expiry_date}</span>}
              </div>
              <div className="gc-name">
                {r.title}
                {!r.is_available && <span className="tag tag-gray">已領完</span>}
              </div>
              <div className="gc-meta">
                <div><i className="fa-solid fa-location-dot"></i>{r.location_display}{r.distance_km != null ? `・${r.distance_km} km` : ''}</div>
                <div><i className="fa-solid fa-cubes-stacked"></i>新舊：{r.condition || '未標示'}・{r.pickup_method}</div>
              </div>
            </div>
            <div className="gc-actions">
              <button className="gc-btn"><i className="fa-solid fa-hand-holding-heart"></i>查看詳情</button>
              <button className="gc-btn" onClick={e => { e.stopPropagation(); navigate('/map') }}><i className="fa-solid fa-map-location-dot"></i>看地圖</button>
            </div>
          </div>
        ))}
      </div>

      {/* 發布按鈕 */}
      <div style={{ padding: '0 16px 16px' }}>
        <button className="btn btn-outline" onClick={() => navigate('/publish')}>
          <i className="fa-solid fa-plus"></i> 發布新物資
        </button>
      </div>
    </div>
  )
}
