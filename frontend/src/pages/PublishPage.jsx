import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['食品', '衣物', '家電', '其他']
const CONDITIONS = ['全新', '良好', '普通', '堪用']
const PICKUP_METHODS = ['面交', '自取', '投遞']

export default function PublishPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', category: '食品', description: '',
    condition: '良好', pickup_method: '面交', expiry_date: '',
    location_display: '',
  })
  const [photo, setPhoto] = useState(null)
  const [showWarning, setShowWarning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matchedDemands, setMatchedDemands] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'category' && value === '食品') setShowWarning(true)
  }

  const getLocation = () => new Promise((resolve, reject) => {
    navigator.geolocation?.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('無法取得位置'))
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.category === '食品' && !form.expiry_date) {
      setError('食品類別必須填寫有效期限')
      return
    }
    setLoading(true)
    setError('')
    try {
      const pos = await getLocation()
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => v && data.append(k, v))
      data.append('location_lat', pos.lat)
      data.append('location_lng', pos.lng)
      if (!form.location_display) data.set('location_display', '附近區域')
      if (photo) data.append('photo', photo)

      const res = await api.post('/resources/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data.matched_demands?.length > 0) {
        setMatchedDemands(res.data.matched_demands)
      } else {
        navigate('/map')
      }
    } catch (err) {
      setError(err.response?.data?.detail || '發布失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  if (matchedDemands.length > 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-green-700 mb-2">物資發布成功！</h2>
        <p className="text-gray-600 mb-4">附近有 <strong>{matchedDemands.length}</strong> 筆相符的需求：</p>
        <ul className="text-left bg-blue-50 rounded-xl p-4 mb-6">
          {matchedDemands.map(d => (
            <li key={d.id} className="text-sm text-blue-800 py-1 border-b border-blue-100 last:border-0">🙋 {d.title}</li>
          ))}
        </ul>
        <button onClick={() => navigate('/map')} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          前往地圖查看
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📦 發布物資</h1>

      {/* 食品安全警告 Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="font-bold text-gray-800 mb-2">食品安全提醒</h3>
            <p className="text-sm text-gray-600 mb-4">
              本平台僅供善意分享，生鮮食品請自行評估食用安全。
              請確實填寫有效期限，讓領取者能判斷食品狀態。
            </p>
            <button onClick={() => setShowWarning(false)} className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600">
              我了解，繼續填寫
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
          <input name="title" required value={form.title} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="例：自家種的蔬菜、舊電風扇" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分類 *</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {form.category === '食品' && (
          <div>
            <label className="block text-sm font-medium text-orange-600 mb-1">有效期限 * <span className="text-xs font-normal">(食品必填)</span></label>
            <input type="date" name="expiry_date" required value={form.expiry_date} onChange={handleChange}
              className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">新舊程度</label>
          <select name="condition" value={form.condition} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">取件方式 *</label>
          <select name="pickup_method" value={form.pickup_method} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            {PICKUP_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">簡要說明</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="補充說明..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">顯示地址（模糊即可）</label>
          <input name="location_display" value={form.location_display} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="例：信義區附近、中正路一帶" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">物品照片</label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])}
            className="w-full text-sm text-gray-500" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
          {loading ? '發布中...' : '發布物資'}
        </button>
      </form>
    </div>
  )
}
