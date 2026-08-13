import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import ResourcesPage from './pages/ResourcesPage'
import MapPage from './pages/MapPage'
import PublishPage from './pages/PublishPage'
import DemandPage from './pages/DemandPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResourceDetailPage from './pages/ResourceDetailPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/publish" element={<PrivateRoute><PublishPage /></PrivateRoute>} />
            <Route path="/demand" element={<PrivateRoute><DemandPage /></PrivateRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
