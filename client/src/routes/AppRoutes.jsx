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
 * ⚠ IMPORTANT: This is a UI-layer guard only. It does NOT provide real
 * security. Every sensitive admin operation must be protected server-side
 * by verifying the JWT and checking the user's role in the database.
 *
 * DEV SHORTCUT: log in with any email containing "admin" (e.g. admin@sidra.et)
 * to get isAdmin: true in the frontend session. This shortcut must be removed
 * when real backend authentication is implemented.
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

  if (!user.isAdmin) {
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

      <Route path="/professionals" element={<PlaceholderPage title="Professional Directory" description="A searchable directory of verified child-development professionals is planned for a future phase." />} />
      <Route path="/professionals/:id" element={<PlaceholderPage title="Professional Profile" description="Individual professional profile pages are planned for a future phase." />} />
      <Route path="/about" element={<PlaceholderPage title="About Sidra" description="Learn more about our mission to support every family on their parenting journey." />} />
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
