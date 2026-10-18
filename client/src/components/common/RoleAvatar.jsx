/**
 * RoleAvatar.jsx — Sidra role-based circular avatar component
 *
 * Displays a distinct inline SVG illustration for each family role.
 * Used in both the Navbar (small) and the Profile page (large).
 *
 * Role → avatar mapping is defined once here and nowhere else.
 * To update an avatar, edit the SVG in ROLE_AVATARS below.
 *
 * Props:
 *   role   — one of: 'mother' | 'father' | 'legal_guardian' | 'other_caregiver' | null | undefined
 *   size   — pixel size of the circle (default 40)
 *   className — additional Tailwind classes for the outer element
 *
 * Accessibility:
 *   The outer element receives aria-label describing the role.
 *   All internal SVG paths are aria-hidden.
 */

// ── Role colour palettes ───────────────────────────────────────────────────
// Each role gets a distinct background + figure colour pair.
// Colours are drawn exclusively from the Sidra brand palette.
const ROLE_STYLES = {
  mother:          { bg: '#FCE8E2', figure: '#D9755E', accent: '#C5634D' }, // terracotta tones
  father:          { bg: '#E4EDE3', figure: '#5C7A59', accent: '#A8B6A0' }, // sage tones
  legal_guardian:  { bg: '#E8E4F0', figure: '#5C5480', accent: '#7C72A8' }, // muted purple — neutral/professional
  other_caregiver: { bg: '#FEF3E8', figure: '#C8894A', accent: '#E0A96A' }, // warm amber — inclusive
}

const FALLBACK_STYLE = { bg: '#F0ECE8', figure: '#77716C', accent: '#9E948E' }

// ── SVG avatar scenes ──────────────────────────────────────────────────────
// Each avatar is a 100×100 viewBox SVG composed of simple geometric shapes.
// They share a consistent illustration style: round head + body shape + colour.

function MotherSVG({ f, a }) {
  return (
    // Head
    <>
      <circle cx="50" cy="30" r="14" fill={f} />
      {/* Hair — two arcs suggesting longer hair */}
      <path d="M36 30 Q36 18 50 16 Q64 18 64 30 Q64 22 70 28 Q68 14 50 12 Q32 14 30 28 Q36 22 36 30Z" fill={a} />
      {/* Body — slightly wider silhouette (dress shape) */}
      <path d="M34 56 Q34 44 50 44 Q66 44 66 56 L70 76 Q60 80 50 80 Q40 80 30 76Z" fill={f} />
      {/* Small child held at left hip */}
      <circle cx="72" cy="60" r="7" fill={a} opacity="0.85" />
      <rect x="68" y="67" width="8" height="10" rx="4" fill={a} opacity="0.85" />
    </>
  )
}

function FatherSVG({ f, a }) {
  return (
    <>
      {/* Head */}
      <circle cx="50" cy="30" r="14" fill={f} />
      {/* Short hair */}
      <path d="M36 30 Q36 16 50 14 Q64 16 64 30 Q64 18 60 17 Q50 13 40 17 Q36 18 36 30Z" fill={a} />
      {/* Body — broader shoulders */}
      <path d="M30 56 Q30 44 50 44 Q70 44 70 56 L68 76 Q59 80 50 80 Q41 80 32 76Z" fill={f} />
      {/* Collar / shirt detail */}
      <path d="M44 44 L50 52 L56 44" fill="none" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
    </>
  )
}

function GuardianSVG({ f, a }) {
  return (
    <>
      {/* Shield background — guardian symbol */}
      <path d="M50 14 L68 22 L68 44 Q68 60 50 70 Q32 60 32 44 L32 22Z" fill={a} opacity="0.25" />
      {/* Head */}
      <circle cx="50" cy="32" r="13" fill={f} />
      {/* Body */}
      <path d="M33 58 Q33 46 50 46 Q67 46 67 58 L65 76 Q57 80 50 80 Q43 80 35 76Z" fill={f} />
      {/* Shield emblem on chest */}
      <path d="M45 58 L50 54 L55 58 L55 64 Q50 67 45 64Z" fill={a} opacity="0.7" />
    </>
  )
}

function CaregiverSVG({ f, a }) {
  return (
    <>
      {/* Head */}
      <circle cx="50" cy="30" r="13" fill={f} />
      {/* Body */}
      <path d="M34 56 Q34 44 50 44 Q66 44 66 56 L68 76 Q59 80 50 80 Q41 80 32 76Z" fill={f} />
      {/* Heart on chest — care symbol */}
      <path d="M44 55 C44 52 40 50 40 54 C40 57 44 61 44 61 C44 61 48 57 48 54 C48 50 44 52 44 55Z" fill={a} />
      {/* Two small figures beside — representing a group */}
      <circle cx="72" cy="54" r="6" fill={a} opacity="0.8" />
      <rect x="68" y="60" width="8" height="9" rx="4" fill={a} opacity="0.8" />
      <circle cx="28" cy="54" r="6" fill={a} opacity="0.8" />
      <rect x="24" y="60" width="8" height="9" rx="4" fill={a} opacity="0.8" />
    </>
  )
}

function FallbackSVG({ f }) {
  return (
    <>
      <circle cx="50" cy="34" r="15" fill={f} opacity="0.7" />
      <path d="M20 78 Q20 56 50 56 Q80 56 80 78" fill={f} opacity="0.5" />
    </>
  )
}

// ── Role → component map ───────────────────────────────────────────────────
const ROLE_AVATARS = {
  mother:          (s) => <MotherSVG    f={s.figure} a={s.accent} />,
  father:          (s) => <FatherSVG    f={s.figure} a={s.accent} />,
  legal_guardian:  (s) => <GuardianSVG  f={s.figure} a={s.accent} />,
  other_caregiver: (s) => <CaregiverSVG f={s.figure} a={s.accent} />,
}

// ── Component ──────────────────────────────────────────────────────────────
export default function RoleAvatar({ role, size = 40, className = '' }) {
  const style  = ROLE_STYLES[role] ?? FALLBACK_STYLE
  const render = ROLE_AVATARS[role]
  const label  = role
    ? `${role.replace(/_/g, ' ')} avatar`
    : 'profile avatar'

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 ring-2 ring-border ${className}`}
      style={{ width: size, height: size, backgroundColor: style.bg }}
      aria-label={label}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Background circle fill */}
        <circle cx="50" cy="50" r="50" fill={style.bg} />
        {/* Role illustration */}
        {render ? render(style) : <FallbackSVG f={style.figure} />}
      </svg>
    </span>
  )
}
