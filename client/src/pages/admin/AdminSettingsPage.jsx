import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Settings' }]

function SettingRow({ label, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-5 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-charcoal">{label}</p>
        <p className="text-xs text-warm-gray mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function DisabledInput({ placeholder }) {
  return (
    <input
      type="text"
      disabled
      placeholder={placeholder}
      className="w-52 px-3 py-2 text-sm border border-border rounded-lg bg-cream text-warm-gray
                 placeholder:text-warm-gray/50 cursor-not-allowed opacity-60"
    />
  )
}

function DisabledToggle({ label }) {
  return (
    <div className="flex items-center gap-2 opacity-50 cursor-not-allowed" aria-label={`${label} — requires backend`}>
      <div className="w-10 h-6 rounded-full bg-border relative">
        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
      <span className="text-xs text-warm-gray">Off</span>
    </div>
  )
}

const SETTING_SECTIONS = [
  {
    title: 'Platform',
    rows: [
      { label: 'Platform Name', description: 'The public name of the platform shown in emails and the browser tab.', control: <DisabledInput placeholder="Sidra" /> },
      { label: 'Contact Email', description: 'Support and notification email address.', control: <DisabledInput placeholder="hello@sidra.et" /> },
      { label: 'Maintenance Mode', description: 'Temporarily take the platform offline for maintenance.', control: <DisabledToggle label="Maintenance mode" /> },
    ],
  },
  {
    title: 'Authentication',
    rows: [
      { label: 'Allow New Registrations', description: 'Control whether new users can create accounts.', control: <DisabledToggle label="Allow registrations" /> },
      { label: 'Email Verification', description: 'Require users to verify their email address before accessing the platform.', control: <DisabledToggle label="Email verification" /> },
    ],
  },
  {
    title: 'Courses',
    rows: [
      { label: 'Default Currency', description: 'Currency used for all course prices.', control: <DisabledInput placeholder="ETB" /> },
      { label: 'Allow Free Courses', description: 'Enable courses to be offered at no cost.', control: <DisabledToggle label="Free courses" /> },
    ],
  },
  {
    title: 'Payments',
    rows: [
      { label: 'Telebirr Integration', description: 'Connect Telebirr as a payment method. Requires backend configuration.', control: <DisabledToggle label="Telebirr" /> },
      { label: 'Chapa Integration', description: 'Connect Chapa as a payment method. Requires backend configuration.', control: <DisabledToggle label="Chapa" /> },
    ],
  },
]

export default function AdminSettingsPage() {
  return (
    <DashboardLayout title="Settings" breadcrumb={breadcrumb}>
      <DashboardPageHeader
        title="Platform Settings"
        subtitle="Global configuration for the Sidra platform. All settings require the backend API to take effect."
      />

      {/* Backend notice */}
      <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
        <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
        <span>
          <span className="font-semibold text-charcoal">Backend required — </span>
          settings controls are shown for planning purposes only. Saving changes requires
          the backend API and database to be connected.
        </span>
      </div>

      {/* Settings sections */}
      <div className="flex flex-col gap-6">
        {SETTING_SECTIONS.map((section) => (
          <div key={section.title} className="card px-6 py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-gray pt-4 pb-2 border-b border-border">
              {section.title}
            </h3>
            {section.rows.map((row) => (
              <SettingRow key={row.label} label={row.label} description={row.description}>
                {row.control}
              </SettingRow>
            ))}
          </div>
        ))}
      </div>

      {/* Save button — disabled */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save settings — requires backend API"
        >
          Save Settings
        </button>
      </div>
    </DashboardLayout>
  )
}
