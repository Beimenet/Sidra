# UI/UX Design — Sidra (ስድራ)

> This document describes the visual design system, layout direction, and user experience patterns planned for the Sidra platform. All designs described here are **planned** and have not yet been implemented. See also [Project Specification](./PROJECT_SPECIFICATION.md) and [System Architecture](./SYSTEM_ARCHITECTURE.md).

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography and Visual Hierarchy](#typography-and-visual-hierarchy)
4. [Branding and Logo](#branding-and-logo)
5. [Navigation and Responsive Menu](#navigation-and-responsive-menu)
6. [Homepage Layout](#homepage-layout)
7. [Course Catalog and Course Cards](#course-catalog-and-course-cards)
8. [Course Details and Lesson View](#course-details-and-lesson-view)
9. [Professional Directory and Profile Cards](#professional-directory-and-profile-cards)
10. [Login and Registration Pages](#login-and-registration-pages)
11. [Parent Dashboard](#parent-dashboard)
12. [Admin Dashboard](#admin-dashboard)
13. [UI States](#ui-states)
14. [Responsive Behavior](#responsive-behavior)
15. [Accessibility](#accessibility)

---

## Design Philosophy

Sidra's visual identity is built around four guiding principles:

- **Warm and welcoming** — The design uses soft, natural tones to feel approachable and calm, especially for parents who may be navigating stressful situations.
- **Professional and trustworthy** — Clean layouts, consistent spacing, and structured content signal that the platform is reliable and credible.
- **Inclusive** — The design avoids overly childish or playful aesthetics. It should feel appropriate for adults while still being warm and human.
- **Accessible** — Color contrast, font sizes, focus states, and semantic structure are all treated as first-class design requirements, not afterthoughts.

---

## Color Palette

| Name | Token / Usage | Hex Value |
|---|---|---|
| Cream background | Page and section backgrounds | `#FCF8F1` |
| Terracotta primary | Primary buttons, links, active states | `#D9755E` |
| Deep terracotta | Hover and pressed states for primary elements | `#C5634D` |
| Sage green | Accents, tags, supporting highlights | `#A8B6A0` |
| White | Cards, modals, input fields | `#FFFFFF` |
| Charcoal | Primary body text, headings | `#303033` |
| Warm gray | Secondary text, captions, placeholder text | `#77716C` |
| Soft beige | Borders, dividers, subtle separators | `#E8DED3` |

**Usage guidelines:**
- The cream background (`#FCF8F1`) is the default page background. It should not be used for text.
- Terracotta (`#D9755E`) is the primary action color. It is used for primary buttons, important links, and active navigation indicators.
- Deep terracotta (`#C5634D`) is used exclusively as a hover or focus state for terracotta elements, not as a standalone color.
- Sage green (`#A8B6A0`) is a supporting accent. Use it sparingly for tags, badges, or subtle visual emphasis.
- White cards sit on the cream background to create soft layering without harsh contrast.
- All text on white or cream backgrounds uses charcoal (`#303033`) for primary content and warm gray (`#77716C`) for secondary or supporting text.
- Color must never be the only way to convey meaning (e.g., error states must also use an icon or text label).

---

## Typography and Visual Hierarchy

Typography choices have not been finalized. The following guidance describes the intended approach.

**Principles:**
- Use a clean, readable sans-serif typeface for body text and UI elements.
- Consider a slightly warmer or humanist sans-serif for headings to reinforce the platform's approachable character.
- Avoid decorative or display fonts that could feel childish or reduce legibility.
- Maintain a clear hierarchy between headings, subheadings, body text, labels, and captions.

**Planned scale (approximate):**

| Level | Usage | Suggested Size |
|---|---|---|
| H1 | Page hero headlines | 2.5rem – 3rem |
| H2 | Section headings | 1.75rem – 2rem |
| H3 | Card titles, subsection headings | 1.25rem – 1.5rem |
| Body | General content text | 1rem (16px base) |
| Small / Caption | Labels, metadata, helper text | 0.875rem |

- Line height for body text should be at least 1.5 to aid readability.
- Minimum body text size is 16px.
- Font weight should be used deliberately: regular for body, medium or semibold for subheadings, bold for primary headings and CTAs.

---

## Branding and Logo

The logo has not yet been finalized. Until a logo is designed, the platform name is used as text-based branding:

**Temporary branding:** `Sidra | ስድራ`

This text should appear in the navigation bar and in the browser tab title. The vertical bar (`|`) visually separates the Latin script name from the Amharic script, giving equal weight to both.

When a logo is finalized, it should replace the text in the navigation bar and any other branding placements. An `alt` attribute describing the logo must be provided at that point.

---

## Navigation and Responsive Menu

### Desktop Navigation

The navigation bar appears at the top of every page and contains:

- **Left:** Text branding — `Sidra | ስድራ`
- **Center / Right:** Navigation links — Home, Courses, Professionals, (and if authenticated: Dashboard)
- **Right:** Authentication controls — "Log In" as a text link and "Get Started" as a terracotta primary button for unauthenticated users; user menu or name and "Log Out" for authenticated users.

The navigation bar uses a white or very light background to stand out from the cream page background. A soft bottom border (`#E8DED3`) separates it from the page content.

The active page link should be visually distinguished (e.g., terracotta underline or color change).

### Mobile Navigation

On smaller screens (below approximately 768px), the navigation links collapse behind a hamburger menu button. Tapping the button opens a full-width or slide-in drawer showing the navigation links stacked vertically.

- The drawer overlay should be accessible by keyboard.
- Focus must be trapped within the open drawer and returned to the trigger button when closed.
- The drawer must be closeable via the close button, the Escape key, or tapping outside.
- The hamburger button must have a descriptive `aria-label` (e.g., "Open navigation menu").

---

## Homepage Layout

The homepage is the primary entry point for visitors and sets the tone for the entire platform. It is composed of seven sections.

### 1. Navigation Bar

As described above. Present on all pages.

### 2. Hero Section

The hero is the first thing a visitor sees. It should:
- Use the cream background with a large, confident headline.
- Include supporting text (1–2 sentences) that explains what Sidra is and who it is for.
- Include two calls to action: a primary button ("Explore Courses" or "Get Started") in terracotta, and a secondary button or text link ("Browse Professionals").
- Optionally include a warm, relevant illustration or image on the right side on desktop. If an image is used, it must have a descriptive `alt` attribute.

The headline should be the `<h1>` for the page. Only one `<h1>` should appear per page.

### 3. How Sidra Supports Families

A section that briefly explains the platform's value in 3–4 short feature highlights. Each highlight includes:
- An icon or simple illustration
- A short heading (e.g., "Trusted Courses", "Expert Professionals", "Inclusive Resources")
- One to two sentences of supporting text

This section uses the cream background with white cards for each highlight, creating gentle visual separation.

### 4. Featured Courses

A horizontal row or grid of 3–4 course cards pulled from the course catalog. Each card shows:
- Course title
- A short description
- A category tag (in sage green)
- A "View Course" link or button

A "See All Courses" link at the end of the section directs visitors to the full catalog.

### 5. Professional Directory Preview

A brief section showing 2–3 professional profile cards. Each card shows:
- Professional's name
- Specialty or role
- A short excerpt from their biography

A "Browse All Professionals" link directs visitors to the full directory.

### 6. Final Call to Action

A full-width section near the bottom of the page with a centered headline and a single primary CTA button encouraging visitors to register or explore. The background may use terracotta or a warm medium tone to differentiate it visually from the rest of the page.

If a colored background is used for this section, text contrast must still meet WCAG 2.1 AA requirements.

### 7. Footer

The footer contains:
- Text branding: `Sidra | ስድራ`
- Navigation links: Home, Courses, Professionals
- A short copyright notice
- Placeholder links for Privacy Policy and Terms of Use (content not yet written)

The footer uses a slightly darker background (e.g., charcoal or deep warm gray) with light text for contrast.

---

## Course Catalog and Course Cards

### Course Catalog Page

- A page heading ("Courses" or "Parenting Education") as an `<h1>`.
- A brief introductory sentence describing the catalog.
- A grid of course cards (3 columns on desktop, 2 on tablet, 1 on mobile).
- Filtering or search functionality may be added in a later phase.

### Course Card

Each course card is a white card on the cream background containing:
- Course title (as a heading, e.g., `<h2>` or `<h3>` depending on context)
- Short description (2–3 sentences)
- Category tag (small pill in sage green)
- Estimated duration or lesson count
- A "View Course" link or button

Cards have a subtle border (`#E8DED3`) and a soft box shadow. On hover, the shadow deepens slightly or the card lifts, providing tactile feedback.

The entire card or the CTA link should be keyboard-accessible and have a clear focus state.

---

## Course Details and Lesson View

### Course Details Page

When a user clicks a course card, they arrive at the course details page, which includes:
- Course title as `<h1>`
- Full description
- Category and duration metadata
- An ordered list of lessons with titles and brief descriptions
- An "Enroll" button for unauthenticated visitors (redirects to login) and authenticated non-enrolled users
- For enrolled users, the button changes to "Continue Learning" or shows per-lesson completion status

### Lesson View

When an enrolled user accesses a lesson:
- Lesson title as `<h1>`
- Lesson content (text, and potentially media in future phases)
- Navigation links: "Previous Lesson" and "Next Lesson"
- A "Mark as Complete" button or automatic completion tracking
- A breadcrumb trail back to the course (e.g., Courses > Course Title > Lesson Title)

---

## Professional Directory and Profile Cards

### Directory Page

- A page heading ("Professional Directory") as `<h1>`.
- A brief description of the directory and what types of professionals are listed.
- A grid or list of professional profile cards.
- Search by name or specialty may be added in a later phase.

### Professional Profile Card

Each card in the directory shows:
- Professional's name
- Title or specialty (e.g., "Pediatric Occupational Therapist")
- Qualifications (brief)
- Short biography excerpt
- A "View Profile" link

### Full Professional Profile Page

Clicking a card opens the professional's full profile page, which includes:
- Full name and title as `<h1>`
- Complete qualifications
- Full biography
- Specialty areas
- Contact or booking information (if provided — not designed yet)

---

## Login and Registration Pages

Both pages share a consistent, minimal layout:

- Centered card on the cream background
- Text branding at the top of the card
- Form fields with clear labels, visible borders, and focus states
- Primary action button in terracotta
- A link to switch between login and registration
- Inline validation error messages below each field

### Registration Form Fields (planned)

- Full name
- Email address
- Password
- Confirm password

### Login Form Fields (planned)

- Email address
- Password

Error messages must be associated with their fields using `aria-describedby` or similar. A general error message (e.g., "Invalid email or password") should appear near the top of the form on failed login without revealing whether the email or password was the cause.

---

## Parent Dashboard

The parent dashboard is the authenticated home for registered users. It should feel personal and focused.

**Planned sections:**
- Welcome message (e.g., "Welcome back, [Name]")
- Enrolled courses with progress indicators for each
- Quick-access links to continue the most recently accessed course
- (Future) Saved resources

The dashboard uses the same cream background. Each enrolled course is shown as a card with a progress bar or percentage indicator. The progress bar fill color should be terracotta.

---

## Admin Dashboard

The admin dashboard is a protected interface accessible only to users with the administrator role. It is functional rather than decorative — clarity and efficiency take priority over visual warmth.

**Planned sections:**
- Summary statistics: total users, total courses, pending professional verifications
- User management: a table of registered users with the ability to deactivate accounts
- Course management: a list of courses with edit and delete actions, and a "Create Course" button
- Lesson management: accessible from within a course view
- Professional verification: a list of pending profiles with approve and reject actions

Admin-specific UI patterns:
- Table layouts for data-heavy views
- Confirmation dialogs before destructive actions (delete, deactivate)
- Status badges (e.g., "Pending", "Verified", "Rejected") using color plus text

---

## UI States

Every interactive view must handle the following states explicitly.

### Loading State

- Show a spinner or skeleton screen while data is being fetched.
- The loading indicator must be accessible (e.g., `role="status"` with an `aria-label`).
- Avoid layout shift when the data loads.

### Empty State

- When a list or section has no data (e.g., no enrolled courses, no pending verifications), show a friendly empty state message.
- Include a brief explanation and, where appropriate, a suggested next action (e.g., "You haven't enrolled in any courses yet. Browse the catalog to get started.").

### Success State

- After completing a key action (e.g., enrolling in a course, saving a change), display a success message.
- Use brief, specific messages (e.g., "You've successfully enrolled in [Course Name]").
- Success messages can be inline (near the action) or via a toast notification. They should disappear after a few seconds or be dismissible.

### Error State

- Form validation errors appear inline below each relevant field.
- Network or server errors are shown in a clearly visible banner or message near the relevant content.
- Error messages must be non-technical, actionable where possible, and not reveal internal system details.
- Error messages must be accessible (associated with their fields, announced to screen readers).

---

## Responsive Behavior

Sidra is designed mobile-first. Layouts should work well at small sizes and scale up for larger screens.

| Breakpoint | Target | Layout Notes |
|---|---|---|
| < 640px | Mobile | Single-column layout, stacked sections, hamburger navigation |
| 640px – 1024px | Tablet | Two-column grid for cards, navigation may remain or collapse |
| > 1024px | Desktop | Three-column grids, full navigation bar, side-by-side hero content |

**Key responsive behaviors:**
- Course cards: 1 column on mobile → 2 on tablet → 3 on desktop
- Navigation: hamburger menu on mobile → full horizontal nav on desktop
- Hero section: stacked (text above, image below) on mobile → side-by-side on desktop
- Admin tables: horizontal scroll on mobile where tables cannot reflow naturally

Tailwind CSS breakpoint utilities (`sm:`, `md:`, `lg:`) will be used to implement responsive behavior.

---

## Accessibility

Accessibility is a core design requirement for Sidra, not a secondary concern.

### Semantic HTML

- Use the correct HTML elements for their intended purpose: `<nav>` for navigation, `<main>` for page content, `<header>` and `<footer>` for page-level regions, `<section>` for thematic groupings, `<article>` for independent content items, `<button>` for interactive controls.
- Do not use `<div>` or `<span>` elements as buttons or interactive elements.
- Each page should have exactly one `<h1>` that describes the page content. Heading levels should not be skipped.

### Keyboard Navigation

- All interactive elements must be reachable and usable by keyboard alone (Tab, Shift+Tab, Enter, Space, arrow keys where applicable).
- Modal dialogs and drawers must trap focus while open and restore it when closed.
- Skip-to-main-content links should be present to allow keyboard users to bypass navigation.

### Focus States

- Focus indicators must be visible and must not be removed with `outline: none` unless a custom focus style is provided.
- Custom focus styles should use a high-contrast ring (e.g., a 2px offset ring in terracotta or charcoal).

### Color Contrast

- Normal text (< 18px or < 14px bold) on its background must meet a minimum contrast ratio of 4.5:1.
- Large text (≥ 18px or ≥ 14px bold) must meet a minimum contrast ratio of 3:1.
- UI components and graphical elements must meet a minimum contrast ratio of 3:1.
- The combination of charcoal (`#303033`) on cream (`#FCF8F1`) meets AA requirements and should be the default for body text.

### Forms

- Every input field must have a visible, programmatically associated `<label>`.
- Required fields must be indicated visually and via `aria-required="true"` or `required`.
- Error messages must be associated with their fields using `aria-describedby`.
- Do not use placeholder text as a substitute for labels.

### ARIA

- Use ARIA roles and properties only when native HTML semantics are insufficient.
- Common ARIA uses in this project: `aria-label` for icon buttons, `aria-expanded` for toggles, `role="status"` for live regions (success/error messages), `aria-current="page"` for the active navigation link.

> Full WCAG 2.1 Level AA compliance requires manual testing with assistive technologies such as screen readers (e.g., NVDA, VoiceOver) and expert accessibility review. These guidelines represent the design intent, not a guarantee of compliance at this stage.
