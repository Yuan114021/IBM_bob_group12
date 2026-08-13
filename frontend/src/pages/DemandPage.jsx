import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['食品', '衣物', '家電', '其他']

export default function DemandPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', category: '食品', description: '', location_display: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const getLocation = () => new Promise((resolve, reject) => {
    navigator.geolocation?.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('無法取得位置'))
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const pos = await getLocation()
      await api.post('/demands/', {
        ...form,
        location_lat: pos.lat,
        location_lng: pos.lng,
        location_display: form.location_display || '附近區域',
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '登記失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">🙋 登記需求</h1>
      <p className="text-sm text-gray-500 mb-4">告訴大家你需要什麼，或許附近的鄰居可以幫助你！</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">需求標題 *</label>
          <input name="title" required value={form.title} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="例：需要嬰兒衣物、尋找舊電鍋" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分類 *</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">說明</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="說明你的需求細節..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">顯示地址（模糊即可）</label>
          <input name="location_display" value={form.location_display} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="例：信義區附近" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? '登記中...' : '登記需求'}
        </button>
      </form>
    </div>
  )
}
