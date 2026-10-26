/**
 * RoleAvatar.jsx — Sidra role-based circular avatar component
 *
 * Displays a distinct inline SVG illustration for each family/account role.
 * Used in both the Navbar (small) and the Profile page (large).
 *
 * Role → color mapping (Task 3 — role-based color system):
 *   mother          Red    #DC5C65
 *   father          Green  #4D9B72
 *   legal_guardian  Yellow #D6A638
 *   other_caregiver Yellow #D6A638
 *   professional    Blue   #4389C7
 *   admin / null    Neutral gray (fallback)
 *
 * Props:
 *   role      — one of the role strings above, or null/undefined
 *   size      — pixel diameter of the circle (default 40)
 *   className — additional Tailwind classes on the outer span
 */

// ── Role colour palettes ────────────────────────────────────────────────────
// bg: light tint  |  figure: main shape fill  |  accent: secondary detail

const ROLE_STYLES = {
  // Family / caregiver roles — Task 3 specified colors
  mother: {
    bg: '#FCEAEB',   // light red tint
    figure: '#DC5C65',   // red #DC5C65
    accent: '#B8454D',
  },
  father: {
    bg: '#E5F3EC',   // light green tint
    figure: '#4D9B72',   // green #4D9B72
    accent: '#3A7A58',
  },
  legal_guardian: {
    bg: '#FDF4E0',   // light yellow tint
    figure: '#D6A638',   // yellow #D6A638
    accent: '#A87D20',
  },
  other_caregiver: {
    bg: '#FDF4E0',   // same yellow family
    figure: '#D6A638',
    accent: '#A87D20',
  },
  // Account roles
  professional: {
    bg: '#E5EEF8',   // light blue tint
    figure: '#4389C7',   // blue #4389C7
    accent: '#2C6BA0',
  },
}

const FALLBACK_STYLE = { bg: '#F0ECE8', figure: '#77716C', accent: '#9E948E' }

// ── SVG avatar scenes ───────────────────────────────────────────────────────
// 100×100 viewBox; uses figure (f) and accent (a) colours from the palette.

function MotherSVG({ f, a }) {
  return (
    <>
      <circle cx="50" cy="30" r="14" fill={f} />
      <path d="M36 30 Q36 18 50 16 Q64 18 64 30 Q64 22 70 28 Q68 14 50 12 Q32 14 30 28 Q36 22 36 30Z" fill={a} />
      <path d="M34 56 Q34 44 50 44 Q66 44 66 56 L70 76 Q60 80 50 80 Q40 80 30 76Z" fill={f} />
      {/* Child held at hip */}
      <circle cx="72" cy="60" r="7" fill={a} opacity="0.85" />
      <rect x="68" y="67" width="8" height="10" rx="4" fill={a} opacity="0.85" />
    </>
  )
}

function FatherSVG({ f, a }) {
  return (
    <>
      <circle cx="50" cy="30" r="14" fill={f} />
      <path d="M36 30 Q36 16 50 14 Q64 16 64 30 Q64 18 60 17 Q50 13 40 17 Q36 18 36 30Z" fill={a} />
      <path d="M30 56 Q30 44 50 44 Q70 44 70 56 L68 76 Q59 80 50 80 Q41 80 32 76Z" fill={f} />
      <path d="M44 44 L50 52 L56 44" fill="none" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
    </>
  )
}

function GuardianSVG({ f, a }) {
  return (
    <>
      <path d="M50 14 L68 22 L68 44 Q68 60 50 70 Q32 60 32 44 L32 22Z" fill={a} opacity="0.25" />
      <circle cx="50" cy="32" r="13" fill={f} />
      <path d="M33 58 Q33 46 50 46 Q67 46 67 58 L65 76 Q57 80 50 80 Q43 80 35 76Z" fill={f} />
      <path d="M45 58 L50 54 L55 58 L55 64 Q50 67 45 64Z" fill={a} opacity="0.7" />
    </>
  )
}

function CaregiverSVG({ f, a }) {
  return (
    <>
      <circle cx="50" cy="30" r="13" fill={f} />
      <path d="M34 56 Q34 44 50 44 Q66 44 66 56 L68 76 Q59 80 50 80 Q41 80 32 76Z" fill={f} />
      <path d="M44 55 C44 52 40 50 40 54 C40 57 44 61 44 61 C44 61 48 57 48 54 C48 50 44 52 44 55Z" fill={a} />
      <circle cx="72" cy="54" r="6" fill={a} opacity="0.8" />
      <rect x="68" y="60" width="8" height="9" rx="4" fill={a} opacity="0.8" />
      <circle cx="28" cy="54" r="6" fill={a} opacity="0.8" />
      <rect x="24" y="60" width="8" height="9" rx="4" fill={a} opacity="0.8" />
    </>
  )
}

function ProfessionalSVG({ f, a }) {
  return (
    <>
      {/* Head */}
      <circle cx="50" cy="30" r="13" fill={f} />
      {/* Body — professional/clinical coat shape */}
      <path d="M33 58 Q33 46 50 46 Q67 46 67 58 L65 76 Q57 80 50 80 Q43 80 35 76Z" fill={f} />
      {/* Coat lapels */}
      <path d="M50 46 L44 60 M50 46 L56 60" fill="none" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
      {/* Stethoscope loop */}
      <path d="M42 58 Q38 64 42 70 Q46 74 50 72 Q54 74 58 70 Q62 64 58 58"
        fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" />
      {/* Stethoscope earpieces */}
      <circle cx="42" cy="58" r="2.5" fill={a} />
      <circle cx="58" cy="58" r="2.5" fill={a} />
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

// ── Role → renderer map ─────────────────────────────────────────────────────
const ROLE_AVATARS = {
  mother: (s) => <MotherSVG f={s.figure} a={s.accent} />,
  father: (s) => <FatherSVG f={s.figure} a={s.accent} />,
  legal_guardian: (s) => <GuardianSVG f={s.figure} a={s.accent} />,
  other_caregiver: (s) => <CaregiverSVG f={s.figure} a={s.accent} />,
  professional: (s) => <ProfessionalSVG f={s.figure} a={s.accent} />,
}

// ── Component ───────────────────────────────────────────────────────────────
export default function RoleAvatar({ role, size = 40, className = '' }) {
  const style = ROLE_STYLES[role] ?? FALLBACK_STYLE
  const render = ROLE_AVATARS[role]
  const label = role
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
        <circle cx="50" cy="50" r="50" fill={style.bg} />
        {render ? render(style) : <FallbackSVG f={style.figure} />}
      </svg>
    </span>
  )
}
