import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import RoleAvatar from '../common/RoleAvatar.jsx'

/**
 * DashboardHeader
 *
 * Props:
 *   title      — current page title (string)
 *   breadcrumb — optional array of { label, to } for breadcrumb trail
 */
export default function DashboardHeader({ title, breadcrumb }) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: breadcrumb + title */}
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex items-center gap-1.5 text-xs text-warm-gray">
              {breadcrumb.map((crumb, i) => (
                <li key={crumb.to ?? i} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true" className="text-border">/</span>}
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-terracotta transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-charcoal font-medium" aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-xl font-bold text-charcoal leading-tight">{title}</h1>
      </div>

      {/* Right: admin identity */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {user ? (
          <>
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-charcoal">{user.name}</span>
              <span className="text-xs text-warm-gray">Administrator</span>
            </div>
            <Link to="/profile" aria-label="My Profile">
              <RoleAvatar role={user.familyRole ?? null} size={36} />
            </Link>
          </>
        ) : (
          <Link to="/login" className="text-sm font-medium text-terracotta hover:text-terracotta-hover transition-colors">
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}
