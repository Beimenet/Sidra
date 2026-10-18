import { Link } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL MEDIA CONFIGURATION
// Add your real account URLs here when they are ready.
// Set `href` to the full URL (e.g. "https://www.instagram.com/sidra.et").
// Leave `href` as `null` to keep the icon visible but non-clickable until
// the account is live.
// ─────────────────────────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  {
    id: 'instagram',
    label: 'Sidra on Instagram',
    href: 'https://www.instagram.com', // TODO: replace with Sidra's Instagram profile URL
    icon: (
      // Instagram — official brand shape
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Sidra on Facebook',
    href: 'https://www.facebook.com', // TODO: replace with Sidra's Facebook profile URL
    icon: (
      // Facebook — standard F mark
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'tiktok',
    label: 'Sidra on TikTok',
    href: 'https://www.tiktok.com', // TODO: replace with Sidra's TikTok profile URL
    icon: (
      // TikTok — musical note / double-d shape
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    label: 'Sidra on YouTube',
    href: 'https://www.youtube.com', // TODO: replace with Sidra's YouTube channel URL
    icon: (
      // YouTube — play button in rounded rectangle
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 'telegram',
    label: 'Sidra on Telegram',
    href: 'https://t.me', // TODO: replace with Sidra's Telegram channel URL
    icon: (
      // Telegram — paper plane
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
]

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

        {/* Social media row */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">Follow us</p>
          <ul className="flex items-center gap-3" role="list" aria-label="Sidra social media links">
            {SOCIAL_LINKS.map(({ id, label, href, icon }) =>
              href ? (
                /* Real link — opens in new tab */
                <li key={id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/70
                               hover:bg-terracotta hover:text-white
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal
                               transition-colors duration-150"
                  >
                    {icon}
                  </a>
                </li>
              ) : (
                /* Placeholder — not yet clickable */
                <li key={id}>
                  <span
                    role="img"
                    aria-label={`${label} (coming soon)`}
                    title={`${label} — link coming soon`}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-white/30 cursor-default select-none"
                  >
                    {icon}
                  </span>
                </li>
              )
            )}
          </ul>
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
