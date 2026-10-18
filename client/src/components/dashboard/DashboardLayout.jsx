import DashboardSidebar from './DashboardSidebar.jsx'
import DashboardHeader from './DashboardHeader.jsx'

/**
 * DashboardLayout — reusable shell for all dashboard pages.
 *
 * Props:
 *   title      — page title shown in the header
 *   breadcrumb — optional array of { label, to }
 *   children   — page content
 *
 * This component is intentionally separate from the public Navbar/Footer shell.
 * App.jsx detects /admin/* routes and renders AppRoutes without the public shell,
 * so DashboardLayout controls its own full-page layout.
 *
 * Designed to be reused by future Parent and Professional dashboards —
 * pass a different sidebar component as needed.
 */
export default function DashboardLayout({ title, breadcrumb, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      {/* Sidebar — fixed height, scrolls independently */}
      <DashboardSidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader title={title} breadcrumb={breadcrumb} />

        {/* Scrollable content area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-6 py-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
