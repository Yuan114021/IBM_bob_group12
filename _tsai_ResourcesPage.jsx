import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['?券', '憌?', '銵?', '摰園', '?嗡?']
const CATEGORY_ICONS = { '憌?': 'fa-bowl-rice', '銵?': 'fa-shirt', '摰園': 'fa-plug', '?嗡?': 'fa-box' }

export default function ResourcesPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('?券')
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
      if (cat !== '?券') params.category = cat
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
        <h2><i className="fa-solid fa-box-open"></i>?抵??汗</h2>
      </div>

      {/* ?? */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, padding: '10px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="???抵?..."
          style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)' }}
        />
        <button type="submit" className="btn-sm btn-primary">??</button>
      </form>

      {/* ??蝭拚 */}
      <div className="filter-bar">
        {CATEGORIES.map(c => (
          <div key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {CATEGORY_ICONS[c] && <i className={`fa-solid ${CATEGORY_ICONS[c]}`} style={{ marginRight: 4 }}></i>}
            {c}
          </div>
        ))}
      </div>

      {/* ?” */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 0' }}>頛銝?..</p>
        ) : resources.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 0' }}>??瘝?蝚血??鞈?/p>
        ) : resources.map(r => (
          <div key={r.id} className="goods-card" onClick={() => navigate(`/resources/${r.id}`)} style={{ cursor: 'pointer' }}>
            <div className="gc-top">
              <div className="gc-meta" style={{ marginBottom: 4 }}>
                <span className="tag tag-green">{r.category}</span>
                {r.expiry_date && <span className="tag tag-yellow" style={{ marginLeft: 6 }}>?唳? {r.expiry_date}</span>}
              </div>
              <div className="gc-name">
                {r.title}
                {!r.is_available && <span className="tag tag-gray">撌脤?摰?/span>}
              </div>
              <div className="gc-meta">
                <div><i className="fa-solid fa-location-dot"></i>{r.location_display}{r.distance_km != null ? `??{r.distance_km} km` : ''}</div>
                <div><i className="fa-solid fa-cubes-stacked"></i>?啗?嚗r.condition || '?芣?蝷?}?認r.pickup_method}</div>
              </div>
            </div>
            <div className="gc-actions">
              <button className="gc-btn"><i className="fa-solid fa-hand-holding-heart"></i>?亦?閰單?</button>
              <button className="gc-btn" onClick={e => { e.stopPropagation(); navigate('/map') }}><i className="fa-solid fa-map-location-dot"></i>???/button>
            </div>
          </div>
        ))}
      </div>

      {/* ?澆??? */}
      <div style={{ padding: '0 16px 16px' }}>
        <button className="btn btn-outline" onClick={() => navigate('/publish')}>
          <i className="fa-solid fa-plus"></i> ?澆??啁鞈?        </button>
      </div>
    </div>
  )
}
