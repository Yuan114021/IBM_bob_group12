import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import PublishPage from './pages/PublishPage'
import DemandPage from './pages/DemandPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResourceDetailPage from './pages/ResourceDetailPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/resources/:id" element={<ResourceDetailPage />} />
              <Route path="/publish" element={<PrivateRoute><PublishPage /></PrivateRoute>} />
              <Route path="/demand" element={<PrivateRoute><DemandPage /></PrivateRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
