import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/professionals', label: 'Professionals' },
  { to: '/about', label: 'About' },
]

const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Use' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-charcoal text-white" aria-label="Site footer">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand column */}
          <div>
            <p className="text-xl font-bold tracking-tight">
              Sidra{' '}
              <span className="text-terracotta" aria-hidden="true">|</span>{' '}
              <span lang="am">ስድራ</span>
            </p>
            <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-xs">
              Empowering families with reliable knowledge, practical guidance,
              and inclusive resources to support their children's development.
            </p>
          </div>

          {/* Navigation column */}
          <nav aria-label="Footer navigation">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
              Navigate
            </h2>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/80 hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal column */}
          <nav aria-label="Legal links">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
              Legal
            </h2>
            <ul className="flex flex-col gap-2">
              {LEGAL_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/80 hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm text-white/50">
          <p>
            &copy; {currentYear} Sidra. All rights reserved.{' '}
            <span className="text-white/30">·</span>{' '}
            Platform currently in development.
          </p>
        </div>
      </div>
    </footer>
  )
}
