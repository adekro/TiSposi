import { Routes, Route, Navigate } from 'react-router-dom'
import GalleryPage from './pages/GalleryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GalleryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
