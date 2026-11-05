# Sidra (ስድራ)

> A parenting education and family-support platform designed to help parents and caregivers access educational courses, trusted professional guidance, and inclusive resources to support their children's development.

**"ቤተሰብ ማለት ሀገር ነው፤ ቤተሰብን ማስተማር ሀገርን ማስተማር ነው።"**


Members
Name                        ID
1. Amanuel Yimer           CTC-2183-26
2. Beimenet Sisay          CTC-2274-26
---
Video Description: https://drive.google.com/drive/folders/15439X1_a2pcbOexqLozEMAJn2tqmBIS-?usp=drive_link
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
| PostgreSQL connection (pg) | ✅ Connected to sidra_db |
| Database schema (6 tables) | ✅ Applied to sidra_db |
| Authentication (JWT) — real backend | ✅ Pending |
| Real API endpoints | ✅ Stubs only (501) |
| Payment integration | ✅ Pending |
| Professional directory page | ✅ Placeholder |
| Admin dashboard | ✅ Pending |

---

## Technology Stack

Sidra is being built on the **PERN** stack.

| Layer | Technology | Version | Status |
|---|---|---|---|
| Database | PostgreSQL | 18.x | ✅ Connected — sidra_db |
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
│   │   │   ├── db.js                # PostgreSQL connection pool (pg) ✅ connected
│   │   │   └── env.js               # Centralised environment variables
│   │   ├── db/
│   │   │   ├── schema.sql           # ✅ Full schema — 6 tables
│   │   │   └── migrate.js           # ✅ Idempotent migration script
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Centralised error handling
│   │   │   └── notFound.js          # 404 handler
│   │   ├── models/                  # Database query functions (one per table)
│   │   │   ├── userModel.js
│   │   │   ├── professionalProfileModel.js
│   │   │   ├── courseModel.js
│   │   │   ├── lessonModel.js
│   │   │   ├── enrollmentModel.js
│   │   │   └── lessonProgressModel.js
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes (stubs — 501)
│   │   │   ├── courses.js           # Course routes (stubs — 501)
│   │   │   ├── health.js            # GET /api/health ✅ works + DB ping
│   │   │   └── professionals.js     # Professional routes (stubs — 501)
│   │   └── app.js                   # Server entry point
│   ├── .env                         # Local credentials — never committed
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
| `/professionals` | Professional directory | ✅ Placeholder |
| `/about` | About page | ✅ Placeholder |

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
# Then open .env and fill in your PostgreSQL credentials

# 4. Apply the database schema (first time, or after schema changes)
npm run migrate

# 5. Start the development server (with file watching)
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
  "database": { "status": "connected", "name": "sidra_db" }
}
```

**Other backend commands:**

```bash
# Apply the database schema (idempotent — safe to run multiple times)
npm run migrate

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
| `DB_HOST` | PostgreSQL host (default: `localhost`) | No — has default |
| `DB_PORT` | PostgreSQL port (default: `5432`) | No — has default |
| `DB_NAME` | Database name (e.g. `sidra_db`) | **Yes** |
| `DB_USER` | PostgreSQL username (e.g. `postgres`) | **Yes** |
| `DB_PASSWORD` | PostgreSQL password — leave blank if none set | No — optional |
| `SESSION_SECRET` | Secret for signing session cookies | No — pending auth |

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
| Real backend authentication | Replace `AuthContext` simulation with server-managed sessions (`POST /api/auth/register`, `POST /api/auth/login`) |
| Persistent profile data | Currently session-only; requires backend `GET /api/auth/me` and `PUT /api/auth/me` |
| Course enrolment | Requires authentication |
| Learning progress tracking | Database tables exist; requires authenticated API endpoints |
| Professional directory | Frontend placeholder exists at `/professionals` |
| Professional profiles | Database table exists; requires admin verification flow |
| Admin dashboard | Requires auth + role-based access control |
| Payment integration (Telebirr, Chapa) | Requires backend + official provider APIs |
| Real course data from API | Currently served from static `client/src/data/courses.js` |
| Sidra social media accounts | Add real profile URLs to `SOCIAL_LINKS` in `Footer.jsx` when accounts are created |

---

## Database Schema

The PostgreSQL schema lives in `server/src/db/schema.sql` and has been applied to `sidra_db`.

### Tables

| Table | Purpose |
|---|---|
| `users` | Every account — parents, professionals, and admins |
| `professional_profiles` | Directory entry for professionals; visible only when `verification_status = 'approved'` |
| `courses` | Course catalog; visible to the public only when `published = TRUE` |
| `lessons` | Individual lessons within a course, ordered by `position` |
| `enrollments` | User–course enrollment records; `UNIQUE (user_id, course_id)` prevents duplicates |
| `lesson_progress` | Per-user lesson completion; `UNIQUE (user_id, lesson_id)` prevents duplicates |

### Applying the schema

```bash
cd server
npm run migrate
```

The migration script is **idempotent** — it uses `CREATE TABLE IF NOT EXISTS` throughout, so running it again on a database that already has the tables does nothing and loses no data.

Expected output:

```
╔══════════════════════════════════════════╗
║       Sidra — Database Migration         ║
╚══════════════════════════════════════════╝
  Database : sidra_db
  Applying schema…
  ✅  Schema applied successfully.

  Tables found in sidra_db:
    ✅ courses
    ✅ enrollments
    ✅ lesson_progress
    ✅ lessons
    ✅ professional_profiles
    ✅ users

  All 6 tables are present. Migration complete.
```

### Verifying tables in pgAdmin

1. Open **pgAdmin 4** and connect to your server
2. In the left panel expand: **sidra_db → Schemas → public → Tables**
3. You should see all six tables listed

Alternatively, open the **Query Tool** on `sidra_db` and run:

```sql
SELECT table_name
FROM   information_schema.tables
WHERE  table_schema = 'public'
  AND  table_type   = 'BASE TABLE'
ORDER  BY table_name;
```

### Security notes

- `password_hash` stores a bcrypt hash only — plaintext passwords are never stored
- The `role` column is enforced server-side; public registration must never be allowed to set `role = 'admin'`
- Payment card details are never stored — the `enrollments.payment_status` column holds only a lifecycle status string
- Raw credentials (PINs, card numbers, wallet secrets) must never be written to the database

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
| 7 | PostgreSQL connection + database schema (6 tables) | ✅ Complete |
| 8 | Backend API — real authentication and session management | ✅ Complete  |
| 9 | Connect frontend to real API (replace static data and auth simulation) | ✅ Complete  |
| 10 | Professional directory | ✅ Complete  |
| 11 | Admin dashboard | ✅ Complete  |
| 12 | Payment integration (Telebirr, Chapa) | 🔲 Planned |
| 13 | Testing, accessibility review, and production deployment | ✅ Complete  |

---

## Contributing
## 👥 Team Members and Task Division

The development of **Sidra (ስድራ) — Parenting Education Platform** is carried out collaboratively by two developers: **Beimenet** and **Amanuel**.

Tasks are divided across project setup, frontend development, backend development, database management, and testing to ensure efficient teamwork and clear responsibilities.

### 👩‍💻 Developer 1: Beimenet
**Role: Project Setup, Frontend & Backend Developer**

**Project Setup and Configuration**
- Initialize and configure the project structure and development environment.
- Set up the React frontend and Node.js/Express backend.
- Configure the PostgreSQL database and database connection.
- Set up the GitHub repository and version control.
- Manage database schemas, migrations, and environment configurations.
- Coordinate overall project structure and integration.

**Frontend Development**
- Design and develop the Home page.
- Develop the Courses page and course browsing interface.
- Design and implement the Admin Dashboard.
- Work on frontend authentication integration and user-related interfaces.
- Ensure responsive layouts and consistent UI styling across assigned pages.

**Backend Development**
- Implement user registration, login, and logout.
- Develop authentication and session management.
- Implement password hashing and role-based authorization.
- Develop user profile management functionality.
- Implement admin APIs for user and account management.
- Develop admin dashboard statistics and reporting endpoints.
- Test authentication, user management, and admin-related APIs.

### 👨‍💻 Developer 2: Amanuel
**Role: Frontend & Backend Developer**

**Frontend Development**
- Design and develop the Professionals page.
- Develop the About Us page.
- Implement other assigned informational and supporting pages.
- Ensure responsive design and consistent styling.
- Connect assigned frontend components to backend APIs.

**Backend Development**
- Implement course management APIs (CRUD operations).
- Develop lesson management functionality.
- Implement course enrollment and progress tracking.
- Develop professional profile and directory APIs.
- Implement professional application and verification-related functionality.
- Integrate assigned backend modules with PostgreSQL.
- Test course, lesson, enrollment, and professional-related APIs.

### 🤝 Shared Responsibilities

Both developers collaborate on:
- Frontend and backend integration.
- API design and database relationships.
- Debugging and resolving technical issues.
- Code testing and quality assurance.
- Maintaining consistent UI/UX design.
- GitHub collaboration and version control.
- Project documentation and deployment preparation.

### 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | Database-backed sessions, HttpOnly cookies, bcrypt |
| Version Control | Git, GitHub |
| Development Tools | VS Code |
| Cloudinary for uploaded media |

### 📋 Task Distribution Summary

| Task / Module | Assigned Developer |
|---|---|
| Project initialization and configuration | Beimenet |
| Database setup and migrations | Beimenet |
| Home page | Beimenet |
| Courses page (frontend) | Beimenet |
| Admin Dashboard (frontend) | Beimenet |
| Authentication and user management | Beimenet |
| Admin backend APIs | Beimenet |
| Professionals page | Amanuel |
| About Us page | Amanuel |
| Other assigned informational pages | Amanuel |
| Course and lesson backend APIs | Amanuel |
| Enrollment and progress tracking | Amanuel |
| Professional services backend APIs | Amanuel |
| Testing and integration | Both |
| Documentation and deployment | Both |

### 🔄 Collaboration Workflow

Both developers work collaboratively using the project's GitHub repository. Tasks are assigned based on specific frontend pages and backend modules to minimize overlapping changes.

Development work is coordinated through the shared `main` branch, with regular synchronization, testing, and integration to maintain a stable and functional application.

---

## License

A license has not yet been selected for this project. This section will be updated before the first public release.
