import { useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

/**
 * App.jsx
 *
 * Admin routes (/admin/*) render inside the DashboardLayout defined in
 * their own pages — they must NOT be wrapped in the public Navbar and Footer.
 * All other routes keep the standard public shell.
 */
export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return <AppRoutes />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <AppRoutes />
      </div>
      <Footer />
    </div>
  )
}
