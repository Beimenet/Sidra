import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// ── Public pages ──────────────────────────────────────────────────────────────
import HomePage from '../pages/HomePage.jsx'
import CoursesPage from '../pages/CoursesPage.jsx'
import CourseDetailPage from '../pages/CourseDetailPage.jsx'
import PlaceholderPage from '../pages/PlaceholderPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'

// ── Professional pages ─────────────────────────────────────────────────────────
import ProfessionalsPage from '../pages/ProfessionalsPage.jsx'
import ProfessionalProfilePage from '../pages/ProfessionalProfilePage.jsx'

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminOverviewPage from '../pages/admin/AdminOverviewPage.jsx'
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx'
import AdminProfessionalsPage from '../pages/admin/AdminProfessionalsPage.jsx'
import AdminCoursesPage from '../pages/admin/AdminCoursesPage.jsx'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage.jsx'
import AdminResourcesPage from '../pages/admin/AdminResourcesPage.jsx'
import AdminReportsPage from '../pages/admin/AdminReportsPage.jsx'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage.jsx'

// ── Route guards ──────────────────────────────────────────────────────────────

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * UI convenience only — real authorization is enforced server-side.
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
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

/**
 * AdminRoute — redirects to /login if not authenticated, or to / if
 * authenticated but not an admin.
 *
 * ⚠ UI-layer guard only. Server-side middleware enforces real authorization
 * on every protected API endpoint. Never rely on this alone for security.
 *
 * Admin access is determined by user.role === 'admin' from the real backend.
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream" aria-label="Loading">
        <div className="w-8 h-8 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

// ── Routes ────────────────────────────────────────────────────────────────────

export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Public ───────────────────────────────────────────────────────── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />

      <Route path="/professionals" element={<ProfessionalsPage />} />
      <Route path="/professionals/:id" element={<ProfessionalProfilePage />} />
      <Route path="/about" element={<PlaceholderPage title="About Sidra" description="Learn more about our mission to support every family on their parenting journey." />} />
      <Route path="/resources" element={<PlaceholderPage title="Resources" description="A curated library of resources for families is coming soon." />} />
      <Route path="/guides" element={<PlaceholderPage title="Guides & Chat" description="Expert guides and chat features are coming soon." />} />
      <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="The Privacy Policy will be published before the platform launches." />} />
      <Route path="/terms" element={<PlaceholderPage title="Terms of Use" description="The Terms of Use will be published before the platform launches." />} />

      {/* ── Auth ─────────────────────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* ── Admin ────────────────────────────────────────────────────────── */}
      <Route path="/admin" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/professionals" element={<AdminRoute><AdminProfessionalsPage /></AdminRoute>} />
      <Route path="/admin/courses" element={<AdminRoute><AdminCoursesPage /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
      <Route path="/admin/resources" element={<AdminRoute><AdminResourcesPage /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

      {/* ── 404 ──────────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
}
