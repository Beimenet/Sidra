import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

import HomePage from '../pages/HomePage.jsx'
import CoursesPage from '../pages/CoursesPage.jsx'
import CourseDetailPage from '../pages/CourseDetailPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import PlaceholderPage from '../pages/PlaceholderPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

/**
 * ProtectedRoute — redirects to /login if no user session exists.
 *
 * NOTE: This is a UI convenience only. It does not provide real security.
 * Real authorization must always be enforced server-side via JWT verification.
 * When the backend is connected, also handle 401 responses from API calls.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-cream" aria-label="Loading">
        <div className="w-8 h-8 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" />
      </div>
    )
  }

  if (!user) {
    // Pass the attempted path so LoginPage can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public pages ─────────────────────────────────────────────── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />

      {/* ── Auth pages ───────────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Protected pages ──────────────────────────────────────────── */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* ── Placeholder pages ─────────────────────────────────────────── */}
      <Route path="/professionals" element={<PlaceholderPage title="Professional Directory" description="A searchable directory of verified child-development professionals is planned for a future phase." />} />
      <Route path="/professionals/:id" element={<PlaceholderPage title="Professional Profile" description="Individual professional profile pages are planned for a future phase." />} />
      <Route path="/about" element={<PlaceholderPage title="About Sidra" description="Learn more about our mission to support every family on their parenting journey." />} />
      <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="The Privacy Policy will be published before the platform launches." />} />
      <Route path="/terms" element={<PlaceholderPage title="Terms of Use" description="The Terms of Use will be published before the platform launches." />} />

      {/* ── 404 ──────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
