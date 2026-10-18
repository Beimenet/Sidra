import { useEffect, useRef } from 'react'
import { formatPrice } from '../../data/courses.js'

const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    description: 'Pay with your Telebirr mobile wallet',
    icon: '📱',
  },
  {
    id: 'chapa',
    name: 'Chapa',
    description: 'Pay securely with Chapa — cards, bank transfers, and more',
    icon: '💳',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Transfer directly to our bank account',
    icon: '🏦',
  },
]

/**
 * PaymentModal — demonstration UI only.
 *
 * IMPORTANT: No real payment processing is connected.
 * This modal shows the intended payment flow for design and testing purposes.
 * A real integration requires a secure backend and official provider APIs.
 */
export default function PaymentModal({ course, onClose }) {
  const modalRef = useRef(null)
  const closeRef = useRef(null)

  // Focus trap + Escape to close
  useEffect(() => {
    closeRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()

      // Basic focus trap
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 id="payment-modal-title" className="text-lg font-bold text-charcoal">
              Enrol in Course
            </h2>
            <p className="text-xs text-warm-gray mt-0.5">
              Review your order before proceeding
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-warm-gray hover:bg-cream hover:text-charcoal transition-colors"
            aria-label="Close payment dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Demo notice */}
          <div className="flex gap-3 bg-terracotta/8 border border-terracotta/20 rounded-xl p-4">
            <span className="text-terracotta text-lg flex-shrink-0" aria-hidden="true">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-terracotta">Demonstration Only</p>
              <p className="text-xs text-warm-gray mt-0.5 leading-relaxed">
                Online payments are coming soon. No real transaction will be processed.
                This checkout is shown for design and planning purposes only.
              </p>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-cream rounded-xl p-4">
            <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide mb-3">
              Order Summary
            </p>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-charcoal leading-snug flex-1">
                {course.title}
              </p>
              <span className="text-base font-bold text-terracotta whitespace-nowrap">
                {formatPrice(course.price)}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm font-semibold text-charcoal">
              <span>Total</span>
              <span className="text-terracotta">{formatPrice(course.price)}</span>
            </div>
          </div>

          {/* Payment methods */}
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wide mb-3">
              Select Payment Method
            </p>
            <ul className="flex flex-col gap-2" role="list">
              {PAYMENT_METHODS.map((method) => (
                <li key={method.id}>
                  <button
                    type="button"
                    disabled
                    className="w-full flex items-center gap-3 px-4 py-3 border border-border rounded-xl
                               text-left cursor-not-allowed opacity-60 hover:border-terracotta/50 transition-colors"
                    aria-label={`${method.name} — coming soon`}
                  >
                    <span className="text-xl" aria-hidden="true">{method.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{method.name}</p>
                      <p className="text-xs text-warm-gray">{method.description}</p>
                    </div>
                    <span className="ml-auto text-xs text-warm-gray bg-cream px-2 py-0.5 rounded-full whitespace-nowrap">
                      Coming soon
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Accessibility + trust note */}
          <p className="text-xs text-warm-gray text-center leading-relaxed">
            Sidra aims to keep all educational resources affordable and accessible to Ethiopian families.
            Some resources will always be available free of charge.
          </p>

          {/* Close action */}
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
