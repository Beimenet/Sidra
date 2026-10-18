# Sidra (ስድራ)

> A parenting education and family-support platform designed to help parents and caregivers access educational courses, trusted professional guidance, and inclusive resources to support their children's development.

**"ቤተሰብ ማለት ሀገር ነው፤ ቤተሰብን ማስተማር ሀገርን ማስተማር ነው።"**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Mission and Vision](#mission-and-vision)
3. [Current Project Status](#current-project-status)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Running the Frontend](#running-the-frontend)
8. [Running the Backend](#running-the-backend)
9. [Environment Variables](#environment-variables)
10. [Implemented Features](#implemented-features)
11. [Planned Features](#planned-features)
12. [Design Direction](#design-direction)
13. [Documentation](#documentation)
14. [Development Roadmap](#development-roadmap)
15. [Contributing](#contributing)
16. [License](#license)

---

## Project Overview

Sidra is a full-stack web platform built for parents and caregivers who want reliable, practical support throughout their parenting journey. The platform offers structured educational courses, a directory of verified child-development professionals, and inclusive resources that address a wide range of developmental needs.

The name **Sidra (ስድራ)** comes from Amharic, reflecting a commitment to family, community, and belonging.

---

## Mission and Vision

**Mission**
Empower families with reliable knowledge, practical guidance, and inclusive resources to support their children's development and well-being.

**Vision**
A future where every family feels informed, supported, and included throughout their parenting journey.

---

## Current Project Status

**Status: Active Development — Frontend Foundation Complete**

| Area | Status |
|---|---|
| React frontend (Vite + Tailwind) | ✅ Complete |
| Homepage | ✅ Implemented |
| Courses catalog page | ✅ Implemented |
| Course detail pages | ✅ Implemented |
| Demo course data (8 courses) | ✅ Complete |
| Login page | ✅ Implemented (frontend only) |
| Register page with family role selection | ✅ Implemented (frontend only) |
| Profile page with view and edit mode | ✅ Implemented (frontend only) |
| Role-based circular avatar | ✅ Implemented |
| Bilingual navbar with logo | ✅ Implemented |
| Social media icons in footer | ✅ Implemented |
| Frontend auth state (sessionStorage) | ✅ Implemented (dev simulation) |
| Responsive design | ✅ Implemented |
| Express backend foundation | ✅ Scaffolded (not yet functional) |
| API health-check endpoint | ✅ Ready to test |
| PostgreSQL database | 🔲 Pending |
| Authentication (JWT) — real backend | 🔲 Pending |
| Real API endpoints | 🔲 Stubs only (501) |
| Payment integration | 🔲 Pending |
| Professional directory page | 🔲 Placeholder |
| Admin dashboard | 🔲 Pending |

---

## Technology Stack

Sidra is being built on the **PERN** stack.

| Layer | Technology | Version | Status |
|---|---|---|---|
| Database | PostgreSQL | Latest stable | Pending setup |
| Backend runtime | Node.js | v18 LTS or later | Scaffolded |
| Backend framework | Express.js | v4.x | Scaffolded |
| Frontend library | React.js | v18.3 | ✅ Running |
| Frontend build tool | Vite | v5.4 | ✅ Running |
| Styling | Tailwind CSS | v3.4 | ✅ Running |
| Frontend routing | React Router | v6.26 | ✅ Running |
| Version control | Git + GitHub | — | ✅ Active |

---

## Project Structure

```
Sidra/
│
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── logo.jpg             # Sidra brand logo (used in Navbar)
│   │   │   └── Capture.PNG          # Hero section image
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── RoleAvatar.jsx   # Role-based circular avatar (4 roles + fallback)
│   │   │   ├── courses/             # Course-specific components
│   │   │   │   ├── ActiveFilters.jsx
│   │   │   │   ├── CategoryFilter.jsx
│   │   │   │   ├── CourseCard.jsx
│   │   │   │   ├── FormatFilter.jsx
│   │   │   │   ├── LevelFilter.jsx
│   │   │   │   ├── PaymentModal.jsx
│   │   │   │   ├── PriceFilter.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── SortSelect.jsx
│   │   │   ├── home/                # Homepage section components
│   │   │   │   ├── CallToAction.jsx
│   │   │   │   ├── FeaturedCourses.jsx
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── HowItWorks.jsx
│   │   │   │   └── ProfessionalPreview.jsx
│   │   │   └── layout/
│   │   │       ├── Footer.jsx       # Footer with nav, legal, social media icons
│   │   │       └── Navbar.jsx       # Sticky navbar — logo, bilingual name, auth-aware
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state, FAMILY_ROLES, register/login/logout
│   │   ├── data/
│   │   │   └── courses.js           # 8 demo courses — edit here
│   │   ├── hooks/                   # Custom React hooks (reserved)
│   │   ├── pages/
│   │   │   ├── CourseDetailPage.jsx # ✅ Implemented
│   │   │   ├── CoursesPage.jsx      # ✅ Implemented
│   │   │   ├── HomePage.jsx         # ✅ Implemented
│   │   │   ├── LoginPage.jsx        # ✅ Implemented (frontend only)
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── PlaceholderPage.jsx
│   │   │   ├── ProfilePage.jsx      # ✅ Implemented (frontend only)
│   │   │   └── RegisterPage.jsx     # ✅ Implemented (frontend only)
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx        # React Router — includes ProtectedRoute
│   │   ├── services/                # API call functions (reserved for backend connection)
│   │   ├── styles/
│   │   │   └── index.css            # Tailwind directives + global styles
│   │   ├── App.jsx
│   │   └── main.jsx                 # App root — wrapped with AuthProvider
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # PostgreSQL setup (pending)
│   │   │   └── env.js               # Centralised environment variables
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Centralised error handling
│   │   │   └── notFound.js          # 404 handler
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes (stubs — 501)
│   │   │   ├── courses.js           # Course routes (stubs — 501)
│   │   │   ├── health.js            # GET /api/health ✅ works
│   │   │   └── professionals.js     # Professional routes (stubs — 501)
│   │   └── app.js                   # Server entry point
│   ├── .env.example                 # Environment variable template
│   ├── .gitignore
│   └── package.json
│
├── docs/
│   ├── PROJECT_SPECIFICATION.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── UI_UX_DESIGN.md
│
├── .gitignore                       # Root — covers client/ and server/
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9 or later (included with Node.js)
- **PostgreSQL** — required only when database integration is implemented

### Clone the repository

```bash
git clone <your-repository-url>
cd Sidra
```

---

## Running the Frontend

The frontend is a self-contained Vite + React application inside `client/`.

```bash
# 1. Move into the client directory
cd client

# 2. Install dependencies (first time only)
npm install

# 3. Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**

**Other frontend commands:**

```bash
# Production build (output written to client/dist/)
npm run build

# Preview the production build locally
npm run preview
```

**Available routes:**

| Route | Page | Status |
|---|---|---|
| `/` | Homepage | ✅ Implemented |
| `/courses` | Course catalog | ✅ Implemented |
| `/courses/:id` | Course detail (1–8) | ✅ Implemented |
| `/login` | Login | ✅ Implemented (frontend only) |
| `/register` | Register with family role | ✅ Implemented (frontend only) |
| `/profile` | User profile — protected route | ✅ Implemented (frontend only) |
| `/professionals` | Professional directory | 🔲 Placeholder |
| `/about` | About page | 🔲 Placeholder |

> The frontend runs independently of the backend. No server or database is needed to view the homepage and Courses pages.
>
> Login and Register work as a frontend simulation using `sessionStorage`. No real backend authentication is connected yet. See [Implemented Features — Authentication](#authentication-frontend-simulation) for details.

---

## Running the Backend

The backend is a minimal Express API inside `server/`. It currently provides a working health-check endpoint. All other endpoints return `501 Not Implemented` until the database and feature logic are built.

### Setup

```bash
# 1. Move into the server directory
cd server

# 2. Install dependencies (first time only)
npm install

# 3. Create your local environment file
cp .env.example .env
# Then open .env and fill in values as needed

# 4. Start the development server (with file watching)
npm run dev
```

The API will be available at **http://localhost:5000**

**Verify the server is running:**

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "sidra-api",
  "environment": "development",
  "database": "not connected — PostgreSQL integration pending"
}
```

**Other backend commands:**

```bash
# Start without file watching (production-style)
npm run start
```

> The backend and frontend run on separate ports and do not depend on each other at this stage. You can run either independently.

---

## Environment Variables

The backend uses a `.env` file inside `server/`. A template is provided at `server/.env.example`.

```bash
cd server
cp .env.example .env
```

| Variable | Purpose | Required now? |
|---|---|---|
| `PORT` | Port the Express server listens on (default: 5000) | No — has default |
| `NODE_ENV` | Environment: `development` \| `production` | No — has default |
| `CLIENT_ORIGIN` | URL of the React frontend for CORS (default: `http://localhost:5173`) | No — has default |
| `DATABASE_URL` | PostgreSQL connection string | No — pending setup |
| `JWT_SECRET` | Secret key for signing JWT tokens | No — pending auth |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`) | No — pending auth |

**Security rules:**
- Never commit `.env` to version control — it is listed in `.gitignore`
- `.env.example` contains only placeholder values and is safe to commit
- Never hardcode secrets in source code

---

## Implemented Features

The following features are complete and working in the current build.

### Homepage (`/`)
- Sticky responsive navbar with logo, bilingual brand name (Sidra / ስድራ), and mobile hamburger menu
- Hero section with Amharic slogan and family image (`Capture.PNG`)
- "How Sidra Supports Families" section (4 feature highlights)
- Featured courses preview (3 cards)
- Professional directory preview (3 sample cards)
- Call-to-action section
- Footer with navigation links, legal links, and social media icons

### Navbar
- Sidra logo (`logo.jpg`) displayed at the far left
- Bilingual brand name — "Sidra" in charcoal and "ስድራ" in terracotta — beside the logo
- Navigation links: Home, Courses, Professionals, About
- Auth-aware controls: shows Login + Register when guest; shows Log Out when authenticated
- Circular role-based profile avatar at the far right — links to `/profile` when authenticated, `/login` when not
- Fully responsive with mobile hamburger drawer

### Footer
- Brand name, mission statement, navigation links, and legal links
- Social media icons: Instagram, Facebook, TikTok, YouTube, Telegram
- Icons link to the respective platform homepages as temporary links
- To update with Sidra's real account URLs, edit the `SOCIAL_LINKS` array at the top of `client/src/components/layout/Footer.jsx`

### Course Catalog (`/courses`)
- Page introduction with search field
- Live search by title, description, and category
- Filter by category, level, price (free/paid), and format
- Sort by: Recommended, Price Low→High, Price High→Low, Newest
- Active filter chips with individual remove and Reset All
- Results count with `aria-live` announcement
- Desktop sidebar filters + mobile filter drawer
- Empty state when no results match
- 8 demonstration courses with realistic parenting education content

### Course Detail Pages (`/courses/1` through `/courses/8`)
- Breadcrumb navigation
- Course header with category, level, format, and duration metadata
- Enrolment card with ETB pricing
- Video lesson placeholder
- Learning objectives and intended audience
- Accordion curriculum (modules and lessons)
- External learning resources (links to WHO, CDC, AAP, UNICEF, NHS, etc.)
- Payment modal (demonstration UI — no real payment processed)

### Authentication (Frontend Simulation)

> ⚠ This is a frontend-only development simulation. No real backend authentication is connected. Passwords are never stored. Sessions are held in `sessionStorage` and cleared when the browser tab is closed.

- **Login page (`/login`)** — email and password form with validation and a dev-mode notice
- **Register page (`/register`)** — full name, email, password, confirm password, and family role selection
- **Family role selection** — four illustrated role cards: Mother, Father, Legal Guardian, Other Caregiver
- **Profile page (`/profile`)** — protected route; redirects to `/login` if not authenticated
  - View mode: role-based avatar, full name, email, family role badge
  - Edit mode: editable name and role selector; email is read-only
  - Save Changes / Cancel / Log Out
- **`AuthContext`** — provides `user`, `register()`, `login()`, `updateProfile()`, `logout()` to the whole app
- When the backend is ready, replace the three simulation functions in `AuthContext.jsx` with real API calls

### Role-Based Avatars (`RoleAvatar`)
- Reusable component at `client/src/components/common/RoleAvatar.jsx`
- Distinct inline SVG illustration for each family role, using the Sidra colour palette
- Fallback avatar for users with no role set
- Used in the Navbar (42 px) and Profile page (80 px)
- Avatar updates immediately when a user changes their role in the Profile edit form

### Design System
- Cream, terracotta, sage green, charcoal colour palette
- Inter typeface via Google Fonts
- Accessible focus states, semantic HTML, keyboard navigation
- Mobile-first responsive layout (1 → 2 → 3 column grids)
- Reusable component classes: `.btn-primary`, `.btn-secondary`, `.card`, `.tag`, `.section-container`

---

## Planned Features

The following features are planned and have not yet been implemented.

| Feature | Notes |
|---|---|
| Real backend authentication (JWT) | Replace `AuthContext` simulation with real `POST /api/auth/register` and `POST /api/auth/login` |
| PostgreSQL database | Users table needs `name`, `email`, `password_hash`, `family_role`, `created_at` |
| Persistent profile data | Currently session-only; requires backend `GET /api/auth/me` and `PUT /api/auth/me` |
| Course enrolment | Requires authentication |
| Learning progress tracking | Requires database |
| Professional directory | Frontend placeholder exists at `/professionals` |
| Professional profiles | Requires database + admin verification |
| Admin dashboard | Requires auth + role-based access control |
| Payment integration (Telebirr, Chapa) | Requires backend + official provider APIs |
| Real course data from API | Currently served from static `client/src/data/courses.js` |
| Sidra social media accounts | Add real profile URLs to `SOCIAL_LINKS` in `Footer.jsx` when accounts are created |

---

## Design Direction

The visual identity of Sidra is warm, welcoming, professional, and inclusive.

| Token | Hex | Usage |
|---|---|---|
| Cream | `#FCF8F1` | Page and section backgrounds |
| Terracotta | `#D9755E` | Primary buttons, links, active states |
| Terracotta hover | `#C5634D` | Hover and pressed states |
| Sage green | `#A8B6A0` | Tags, badges, accents |
| White | `#FFFFFF` | Cards, modals, inputs |
| Charcoal | `#303033` | Primary text, headings |
| Warm gray | `#77716C` | Secondary text, captions |
| Border | `#E8DED3` | Borders, dividers |

**Branding:** The Sidra logo (`client/src/assets/logo.jpg`) is displayed in the navbar alongside the bilingual text name "Sidra / ስድራ".

---

## Documentation

Detailed documentation lives in the [`docs/`](./docs) folder.

| Document | Description |
|---|---|
| [Project Specification](./docs/PROJECT_SPECIFICATION.md) | Purpose, user roles, planned features, functional and non-functional requirements, security, accessibility, and acceptance criteria |
| [UI/UX Design](./docs/UI_UX_DESIGN.md) | Color palette, typography, layout direction, page designs, responsive behavior, and accessibility guidelines |
| [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) | Planned PERN stack architecture, layer responsibilities, folder structure, authentication, validation, error handling, and testing strategy |

---

## Development Roadmap

| Phase | Focus | Status |
|---|---|---|
| 1 | Repository setup, folder structure, tooling | ✅ Complete |
| 2 | Frontend foundation — React, Vite, Tailwind, React Router | ✅ Complete |
| 3 | Homepage implementation | ✅ Complete |
| 4 | Courses page — catalog, filtering, detail pages | ✅ Complete |
| 5 | Backend foundation — Express server scaffold | ✅ Complete |
| 6 | Auth UI — Login, Register, Profile pages, role-based avatars | ✅ Complete (frontend simulation) |
| 7 | Database schema design and PostgreSQL setup | 🔲 Next |
| 8 | Backend API — real authentication and user management | 🔲 Planned |
| 9 | Connect frontend to real API (replace static data and auth simulation) | 🔲 Planned |
| 10 | Professional directory | 🔲 Planned |
| 11 | Admin dashboard | 🔲 Planned |
| 12 | Payment integration (Telebirr, Chapa) | 🔲 Planned |
| 13 | Testing, accessibility review, and production deployment | 🔲 Planned |

---

## Contributing

Contribution guidelines have not yet been established. This section will be updated as the project matures and opens to collaboration.

---

## License

A license has not yet been selected for this project. This section will be updated before the first public release.
