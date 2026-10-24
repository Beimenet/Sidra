import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.jpg'
import { useAuth } from '../../context/AuthContext.jsx'
import RoleAvatar from '../common/RoleAvatar.jsx'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/professionals', label: 'Professionals' },
  { to: '/resources', label: 'Resources' },
  { to: '/guides', label: 'Guides & Chat' },
  { to: '/about', label: 'About Us' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const hamburgerRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        hamburgerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !hamburgerRef.current?.contains(e.target)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleLogout() {
    await logout()
    navigate('/')
    setMenuOpen(false)
  }

  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-terracotta font-semibold relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-terracotta after:rounded-full'
      : 'text-warm-gray font-medium hover:text-charcoal transition-colors duration-150 relative'

  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? 'block px-4 py-2.5 text-terracotta font-semibold bg-terracotta/8 rounded-lg'
      : 'block px-4 py-2.5 text-warm-gray font-medium hover:text-charcoal hover:bg-cream rounded-lg transition-colors duration-150'

  // Profile avatar destination: /profile when logged in, /login when not
  const profileDest = user ? '/profile' : '/login'
  const profileLabel = user ? `My Profile — ${user.name}` : 'My Profile — log in to view'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-terracotta focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <nav
        className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4"
        aria-label="Main navigation"
      >
        {/* ── Brand: logo + bilingual name ──────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 flex-shrink-0 focus-visible:rounded-lg"
          aria-label="Sidra home"
        >
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="h-14 w-auto object-contain"
          />
          <span className="flex flex-col leading-tight select-none">
            <span className="text-base font-bold text-charcoal tracking-tight">
              Sidra<span lang="am" className="text-terracotta">(ሥ.)</span>
            </span>
            <span className="text-[11px] text-warm-gray font-medium tracking-wide">
              Solutions for Every Family
            </span>
          </span>
        </Link>

        {/* ── Desktop nav links ──────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-5 flex-1 justify-center">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* ── Desktop right controls ─────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {user ? (
            /* Logged in: Log Out text link + circular avatar */
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-warm-gray hover:text-charcoal transition-colors duration-150 px-2"
              >
                Log Out
              </button>
            </>
          ) : (
            /* Guest: Login + Get Started buttons */
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors duration-150 px-3 py-2 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-terracotta text-white px-5 py-2 rounded-full hover:bg-terracotta-hover transition-colors duration-200 shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Circular profile avatar — always visible, far right */}
          <Link
            to={profileDest}
            aria-label={profileLabel}
            className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 hover:opacity-90 transition-opacity duration-150"
          >
            <RoleAvatar
              role={user?.role ?? null}
              size={42}
            />
          </Link>
        </div>

        {/* ── Hamburger — mobile only ────────────────────────────────────── */}
        <div className="md:hidden flex items-center gap-2">
          {/* Compact avatar on mobile too */}
          <Link
            to={profileDest}
            aria-label={profileLabel}
            className="rounded-full focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-1"
          >
            <RoleAvatar role={user?.role ?? null} size={36} />
          </Link>

          <button
            ref={hamburgerRef}
            type="button"
            className="p-2 rounded-lg text-charcoal hover:bg-cream transition-colors duration-150"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ────────────────────────────────────────────────────── */}
      {menuOpen && (
        <div id="mobile-menu" ref={menuRef} className="md:hidden border-t border-border bg-white px-4 pb-4 pt-2">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={mobileLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-charcoal font-medium hover:text-terracotta hover:bg-cream rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <RoleAvatar role={user.role ?? null} size={34} />
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs text-warm-gray">My Profile</span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-secondary w-full text-center"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary w-full text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary w-full text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
