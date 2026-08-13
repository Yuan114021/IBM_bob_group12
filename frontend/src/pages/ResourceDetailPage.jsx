import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function ResourceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    api.get(`/resources/${id}`)
      .then(r => setResource(r.data))
      .finally(() => setLoading(false))
  }, [id])

  const handleClose = async () => {
    if (!confirm('確定要標記此物資為已領完嗎？')) return
    setClosing(true)
    try {
      await api.patch(`/resources/${id}/close`)
      navigate('/')
    } finally {
      setClosing(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">載入中...</div>
  if (!resource) return <div className="text-center py-20 text-gray-400">找不到此物資</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {resource.photo_path && (
        <img src={`http://localhost:8000/${resource.photo_path}`} alt={resource.title}
          className="w-full h-56 object-cover rounded-2xl mb-4" />
      )}

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{resource.category}</span>
        {resource.expiry_date && (
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">到期：{resource.expiry_date}</span>
        )}
        {!resource.is_available && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">已領完</span>
        )}
      </div>

      <h1 className="text-xl font-bold text-gray-800 mb-1">{resource.title}</h1>
      <p className="text-sm text-gray-500 mb-3">由 <strong>{resource.username}</strong> 發布</p>

      {resource.description && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-4">{resource.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">取件方式</p>
          <p className="font-medium text-gray-700">{resource.pickup_method}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">物品狀態</p>
          <p className="font-medium text-gray-700">{resource.condition || '未標示'}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 col-span-2">
          <p className="text-gray-400 text-xs mb-1">大約位置</p>
          <p className="font-medium text-gray-700">📍 {resource.location_display}</p>
        </div>
      </div>

      {user && user.id === resource.user_id && resource.is_available && (
        <button onClick={handleClose} disabled={closing}
          className="w-full bg-gray-700 text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50">
          {closing ? '處理中...' : '✅ 標記為已領完'}
        </button>
      )}
    </div>
  )
}
