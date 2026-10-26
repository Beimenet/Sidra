/**
 * VerifiedBadge.jsx — Sidra professional verification badge
 *
 * Displays a blue verified checkmark beside a professional's name.
 * The badge is ONLY shown when:
 *   - The user's account role is 'professional'
 *   - Their professional profile has verification_status === 'approved'
 *   - is_suspended is false (or absent)
 *
 * Props:
 *   verificationStatus  — string from professional_profiles.verification_status
 *   isSuspended         — boolean from professional_profiles.is_suspended
 *   size                — 'sm' (14 px) | 'md' (default, 18 px) | 'lg' (22 px)
 *   showTooltip         — boolean, default true
 *   className           — extra Tailwind classes on the wrapper span
 *
 * Accessibility:
 *   The badge icon is aria-hidden; a screen-reader-only label is provided.
 *   The tooltip is role="tooltip" and linked via aria-describedby.
 *
 * IMPORTANT — security note:
 *   This component renders a badge based on data passed as props.
 *   Always source verificationStatus from the backend API response,
 *   never from local state, localStorage, or any user-editable field.
 *   The backend enforces that only admins can set status = 'approved'.
 */

const BLUE = '#4389C7'

const SIZES = {
  sm: 14,
  md: 18,
  lg: 22,
}

/**
 * Returns true only when the badge should be visible.
 * This helper can be imported and used for conditional rendering without
 * mounting the full component.
 */
export function isVerified(verificationStatus, isSuspended = false) {
  return verificationStatus === 'approved' && !isSuspended
}

export default function VerifiedBadge({
  verificationStatus,
  isSuspended = false,
  size = 'md',
  showTooltip = true,
  className = '',
}) {
  // Hard gate: never render the badge unless truly verified
  if (!isVerified(verificationStatus, isSuspended)) return null

  const px = SIZES[size] ?? SIZES.md
  const tooltipId = `verified-badge-tooltip-${Math.random().toString(36).slice(2, 7)}`

  return (
    <span
      className={`inline-flex items-center flex-shrink-0 relative group ${className}`}
      aria-describedby={showTooltip ? tooltipId : undefined}
    >
      {/* Badge icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill={BLUE}
        aria-hidden="true"
      >
        {/* BadgeCheck shape — shield/hexagon base with inner checkmark */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        />
      </svg>

      {/* Screen-reader text */}
      <span className="sr-only">Verified Professional</span>

      {/* Tooltip */}
      {showTooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className="
            pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            w-64 px-3 py-2 bg-charcoal text-white text-xs rounded-lg shadow-lg
            opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
            transition-opacity duration-150 z-50 text-center leading-relaxed
          "
        >
          <strong className="font-semibold">Verified Professional</strong>
          <br />
          Credentials reviewed and approved by Sidra.
          {/* small arrow */}
          <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-charcoal" aria-hidden="true" />
        </span>
      )}
    </span>
  )
}
