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
| Responsive design | ✅ Implemented |
| Express backend foundation | ✅ Scaffolded (not yet functional) |
| API health-check endpoint | ✅ Ready to test |
| PostgreSQL database | 🔲 Pending |
| Authentication (JWT) | 🔲 Pending |
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
│   │   ├── assets/                  # Images and static files
│   │   │   └── Capture.PNG          # Hero image
│   │   ├── components/
│   │   │   ├── common/              # Shared UI components (reserved)
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
│   │   │   └── layout/              # Shared layout components
│   │   │       ├── Footer.jsx
│   │   │       └── Navbar.jsx
│   │   ├── context/                 # React Context providers (reserved)
│   │   ├── data/
│   │   │   └── courses.js           # 8 demo courses — edit here
│   │   ├── hooks/                   # Custom React hooks (reserved)
│   │   ├── pages/
│   │   │   ├── CourseDetailPage.jsx # ✅ Implemented
│   │   │   ├── CoursesPage.jsx      # ✅ Implemented
│   │   │   ├── HomePage.jsx         # ✅ Implemented
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── PlaceholderPage.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx        # React Router configuration
│   │   ├── services/                # API call functions (reserved)
│   │   ├── styles/
│   │   │   └── index.css            # Tailwind directives + global styles
│   │   ├── App.jsx
│   │   └── main.jsx
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
| `/professionals` | Professional directory | 🔲 Placeholder |
| `/about` | About page | 🔲 Placeholder |
| `/login` | Login | 🔲 Placeholder |
| `/register` | Register | 🔲 Placeholder |

> The frontend runs independently of the backend. No server or database is needed to view the homepage and Courses pages.

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
# In your browser or with curl:
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
- Responsive navigation bar with mobile hamburger menu
- Hero section with Amharic slogan and family image
- "How Sidra Supports Families" section (4 feature highlights)
- Featured courses preview (3 cards)
- Professional directory preview (3 sample cards)
- Call-to-action section
- Footer with navigation and legal links

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
- Learning objectives
- Intended audience
- Accordion curriculum (modules and lessons)
- External learning resources (links to WHO, CDC, AAP, UNICEF, NHS, etc.)
- Payment modal (demonstration UI — no real payment processed)

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
| User registration and login | Requires JWT auth + PostgreSQL |
| Course enrolment | Requires authentication |
| Learning progress tracking | Requires database |
| Professional directory | Frontend placeholder exists |
| Professional profiles | Requires database + admin verification |
| Admin dashboard | Requires auth + role-based access control |
| Payment integration (Telebirr, Chapa) | Requires backend + provider APIs |
| Real course data from API | Currently served from static `client/src/data/courses.js` |

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

Temporary branding: **Sidra | ስድራ** (logo not yet finalised)

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
| 6 | Database schema design and PostgreSQL setup | 🔲 Next |
| 7 | Backend API — authentication and user management | 🔲 Planned |
| 8 | Connect frontend to real API (replace static data) | 🔲 Planned |
| 9 | Professional directory | 🔲 Planned |
| 10 | Admin dashboard | 🔲 Planned |
| 11 | Payment integration (Telebirr, Chapa) | 🔲 Planned |
| 12 | Testing, accessibility review, and production deployment | 🔲 Planned |

---

## Contributing

Contribution guidelines have not yet been established. This section will be updated as the project matures and opens to collaboration.

---

## License

A license has not yet been selected for this project. This section will be updated before the first public release.
