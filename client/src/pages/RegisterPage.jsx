import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { useAuth, FAMILY_ROLES } from '../context/AuthContext.jsx'

// ── Account type options ─────────────────────────────────────────────────────
const ACCOUNT_TYPES = [
  {
    value: 'parent',
    label: 'Parent / Caregiver',
    description: 'You are a parent or caregiver looking for guidance, courses, and resources.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'You are a licensed child development professional. Your credentials will be verified before your profile appears in the directory.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695ZM19.5 8.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
      </svg>
    ),
  },
]

// ── Reusable field wrapper ────────────────────────────────────────────────────
function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-charcoal">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Input({ id, type = 'text', value, onChange, placeholder, 'aria-describedby': ariaDescribedby, autoComplete }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-describedby={ariaDescribedby}
      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-charcoal placeholder:text-warm-gray/60
                 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
    />
  )
}

// ── Role card ─────────────────────────────────────────────────────────────────
function RoleCard({ role, selected, onChange }) {
  const isSelected = selected === role.value
  return (
    <label
      className={`relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 cursor-pointer
                  transition-all duration-150 select-none
                  ${isSelected
          ? 'border-terracotta bg-terracotta/5 shadow-md'
          : 'border-border bg-white hover:border-terracotta/50 hover:bg-cream'
        }`}
    >
      <input
        type="radio"
        name="familyRole"
        value={role.value}
        checked={isSelected}
        onChange={() => onChange(role.value)}
        className="sr-only"
        aria-label={role.label}
      />

      {/* Selected tick */}
      {isSelected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-terracotta flex items-center justify-center" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        </span>
      )}

      {/* Icon */}
      <span className={`${isSelected ? 'text-terracotta' : 'text-warm-gray'} transition-colors`}>
        {role.icon}
      </span>

      {/* Label */}
      <span className={`text-sm font-semibold ${isSelected ? 'text-terracotta' : 'text-charcoal'}`}>
        {role.label}
      </span>

      {/* Description */}
      <span className="text-xs text-warm-gray leading-snug">
        {role.description}
      </span>
    </label>
  )
}

// ── Account-type card ─────────────────────────────────────────────────────────
function AccountTypeCard({ type, selected, onChange }) {
  const isSelected = selected === type.value
  return (
    <label
      className={`relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 cursor-pointer
                  transition-all duration-150 select-none
                  ${isSelected
          ? 'border-terracotta bg-terracotta/5 shadow-md'
          : 'border-border bg-white hover:border-terracotta/50 hover:bg-cream'
        }`}
    >
      <input
        type="radio"
        name="accountType"
        value={type.value}
        checked={isSelected}
        onChange={() => onChange(type.value)}
        className="sr-only"
        aria-label={type.label}
      />
      {isSelected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-terracotta flex items-center justify-center" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        </span>
      )}
      <span className={`${isSelected ? 'text-terracotta' : 'text-warm-gray'} transition-colors`}>
        {type.icon}
      </span>
      <span className={`text-sm font-semibold ${isSelected ? 'text-terracotta' : 'text-charcoal'}`}>
        {type.label}
      </span>
      <span className="text-xs text-warm-gray leading-snug">{type.description}</span>
    </label>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  // Step 1: account type  |  Step 2: credentials + role (if parent)
  const [accountType, setAccountType] = useState('')           // 'parent' | 'professional'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [familyRole, setFamilyRole] = useState('')             // only for 'parent' accounts
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (!form.email.trim()) e.email = 'Email address is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = 'Password must include at least one letter and one number.'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match.'
    // Family role only required for parent accounts
    if (accountType === 'parent' && !familyRole)
      e.familyRole = 'Please select your role in the family.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setSubmitting(true)
    try {
      if (accountType === 'professional') {
        // Professional registers with role = 'professional'; no family role
        await register({ name: form.name, email: form.email, password: form.password, role: 'professional' })
      } else {
        await register({ name: form.name, email: form.email, password: form.password, familyRole })
      }
      navigate('/profile')
    } catch (err) {
      if (err.fields) {
        const mapped = {}
        if (err.fields.full_name) mapped.name = err.fields.full_name
        if (err.fields.email) mapped.email = err.fields.email
        if (err.fields.password) mapped.password = err.fields.password
        setErrors(mapped)
      }
      setSubmitError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="bg-cream min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" aria-label="Go to Sidra home">
            <img src={logo} alt="Sidra (ሰድራ) — Guidance for Every Family" className="h-16 w-auto" />
          </Link>
        </div>

        <div className="card p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-charcoal mb-1">Create your account</h1>
          <p className="text-warm-gray text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-terracotta font-semibold hover:text-terracotta-hover underline-offset-2 hover:underline">
              Log in here
            </Link>
          </p>

          {/* ── Step 1: Account type ─────────────────────────────────────── */}
          {!accountType ? (
            <div>
              <p className="text-sm font-semibold text-charcoal mb-1">How will you use Sidra?</p>
              <p className="text-sm text-warm-gray mb-5">Choose the account type that best describes you.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACCOUNT_TYPES.map((type) => (
                  <AccountTypeCard
                    key={type.value}
                    type={type}
                    selected={accountType}
                    onChange={(v) => setAccountType(v)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* ── Step 2: Credentials + role ─────────────────────────────── */
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

              {/* Back to step 1 */}
              <button
                type="button"
                onClick={() => { setAccountType(''); setErrors({}); setSubmitError('') }}
                className="self-start flex items-center gap-1.5 text-sm text-warm-gray hover:text-terracotta transition-colors"
                aria-label="Change account type"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                {accountType === 'professional' ? 'Registering as a Professional' : 'Registering as a Parent / Caregiver'}
              </button>

              {/* Professional notice */}
              {accountType === 'professional' && (
                <div className="flex gap-3 bg-[#E5EEF8] border border-[#4389C7]/30 rounded-xl px-4 py-3 text-sm text-charcoal">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#4389C7] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                  <span>
                    After registration, you will be able to submit your professional profile and credentials for admin review.
                    Your profile will appear in the directory once approved.
                  </span>
                </div>
              )}

              {/* Name */}
              <Field id="name" label="Full name" error={errors.name}>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Meron Tadesse"
                  autoComplete="name"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
              </Field>

              {/* Email */}
              <Field id="email" label="Email address" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </Field>

              {/* Password */}
              <Field id="password" label="Password" error={errors.password}>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
              </Field>

              {/* Confirm password */}
              <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
              </Field>

              {/* ── Family role — only for parent accounts ──────────────── */}
              {accountType === 'parent' && (
                <fieldset>
                  <legend className="mb-1">
                    <span className="text-sm font-semibold text-charcoal">Your role in the family</span>
                  </legend>
                  <p className="text-sm text-warm-gray mb-4">
                    Every family is different. Tell us how you care for or support your child.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="radiogroup" aria-required="true">
                    {FAMILY_ROLES.map((role) => (
                      <RoleCard
                        key={role.value}
                        role={role}
                        selected={familyRole}
                        onChange={(v) => {
                          setFamilyRole(v)
                          if (errors.familyRole) setErrors((prev) => ({ ...prev, familyRole: '' }))
                        }}
                      />
                    ))}
                  </div>
                  {errors.familyRole && (
                    <p role="alert" className="mt-3 text-xs text-red-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                      </svg>
                      {errors.familyRole}
                    </p>
                  )}
                </fieldset>
              )}

              {/* Submit error */}
              {submitError && (
                <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating account…' : 'Create account'}
              </button>

              <p className="text-xs text-center text-warm-gray leading-relaxed">
                By creating an account you agree to our{' '}
                <Link to="/terms" className="text-terracotta hover:underline underline-offset-2">Terms of Use</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-terracotta hover:underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
