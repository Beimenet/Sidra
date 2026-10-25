# Sidra (ስድራ) — Parenting and Family Support Platform
## Full-Stack Web Application — Project Documentation

---

**Project Name:** Sidra (ስድራ)  
**Platform Type:** Full-Stack Web Application (PERN Stack)  
**Development Team:** Beimenet & Amanuel  
**Academic Year:** 2025–2026  
**Version:** 1.0  
**Repository:** GitHub (main branch)

---

## ACKNOWLEDGMENT

We would like to express our sincere gratitude to everyone who supported and contributed to the development of Sidra.

To our instructors and supervisors, thank you for your guidance, constructive feedback, and encouragement throughout the development process. Your expertise helped shape a more robust and thoughtful application.

To our peers who participated in user testing and provided feedback on the interface and user experience, your insights were invaluable.

To the open-source community — the maintainers of React, Express, PostgreSQL, Tailwind CSS, and Vite — whose tools made this project possible.

Finally, to every parent and caregiver who shared their challenges and aspirations, your stories gave this project its purpose. Sidra was built for you.

*"ቤተሰብ ማለት ሀገር ነው፤ ቤተሰብን ማስተማር ሀገርን ማስተማር ነው።"*  
*"Family is the nation; to educate the family is to educate the nation."*

---

## ABSTRACT

Sidra (ስድራ) is a full-stack parenting education and family-support web platform built using the PERN stack (PostgreSQL, Express.js, React.js, and Node.js). The platform is designed to address the information gap faced by parents and caregivers in Ethiopia and the diaspora by providing structured educational courses, access to verified child-development professionals, curated learning resources, and community support features.

The system implements a role-based access control model with three primary account types: parents and caregivers, professionals, and administrators. Authentication is handled through server-managed sessions with HttpOnly cookies and bcrypt password hashing, providing security without the vulnerabilities associated with client-side token storage.

The frontend, built with React 18.3 and Vite 5.4, delivers a fully responsive, accessible, and bilingual (English/Amharic) user interface styled with Tailwind CSS. The backend, built with Node.js and Express.js, exposes a RESTful API connected to a PostgreSQL database containing seven normalized tables.

At the time of this documentation, the frontend foundation is complete with all major user-facing pages implemented. The backend authentication system, database schema, and admin dashboard APIs are fully operational. Course management, professional directory, and enrollment APIs are partially implemented, with the remaining modules under active development.

This document provides a comprehensive technical reference of the system's architecture, implementation, testing, and current status, suitable for academic evaluation and project handover.

**Keywords:** Parenting platform, PERN stack, React.js, Node.js, PostgreSQL, authentication, role-based access, family support, educational technology, Ethiopia.

---

## TABLE OF CONTENTS

- Chapter 1: Introduction
- Chapter 2: System Requirements
- Chapter 3: System Analysis and Design
- Chapter 4: User Interface Design
- Chapter 5: System Implementation
- Chapter 6: Testing and Debugging
- Chapter 7: Deployment
- Chapter 8: Team Collaboration
- Chapter 9: Challenges and Solutions
- Chapter 10: Conclusion and Future Enhancements
- References
- Appendices

---

## LIST OF TABLES

| Table | Title |
|---|---|
| Table 2.1 | Functional Requirements |
| Table 2.2 | Non-Functional Requirements |
| Table 2.3 | User Roles and Permissions |
| Table 2.4 | Software Requirements |
| Table 3.1 | Database Tables Summary |
| Table 3.2 | API Endpoint Reference |
| Table 5.1 | Frontend Pages and Routes |
| Table 5.2 | Backend Dependencies |
| Table 6.1 | Authentication Test Cases |
| Table 6.2 | Profile Management Test Cases |
| Table 6.3 | Admin API Test Cases |
| Table 7.1 | Environment Variables |

---

## LIST OF FIGURES

| Figure | Title |
|---|---|
| Figure 3.1 | PERN Stack Architecture Diagram |
| Figure 3.2 | Entity-Relationship Diagram |
| Figure 3.3 | Authentication Flow Diagram |
| Figure 3.4 | Frontend Component Tree |
| Figure 5.1 | Project Folder Structure |

---

---

# CHAPTER 1: INTRODUCTION

## 1.1 Project Background

Raising children is one of the most demanding responsibilities a person can undertake. Yet in Ethiopia and across the Ethiopian diaspora, parents and caregivers often navigate this journey without access to reliable, structured, or culturally relevant educational resources. The existing landscape of parenting support is fragmented: general-purpose internet searches yield contradictory advice; formal consultations with child-development professionals are expensive and geographically inaccessible; and community knowledge, while valuable, is rarely organized or verified.

Sidra (ስድራ) was conceived in response to this gap. The name comes from Amharic and carries meaning rooted in family, home, and community — a foundation that reflects the platform's purpose. The project set out to create a digital platform that combines structured learning, verified professional guidance, inclusive resources, and community connection in a single, accessible environment.

## 1.2 Problem Statement

Parents and caregivers in Ethiopia and the diaspora face the following specific challenges:

1. **Information overload and unreliability.** Parenting advice on the internet is abundant but inconsistent and often not evidence-based. There is no curated, trustworthy central source of parenting education relevant to Ethiopian family contexts.

2. **Limited access to professionals.** Finding qualified child-development professionals — pediatricians, therapists, speech-language pathologists, psychologists — is difficult. Parents have no structured way to verify credentials or discover specialists appropriate for their child's needs.

3. **Lack of inclusive resources.** Families supporting children with developmental differences, learning disabilities, or neurodivergent conditions face particular difficulties. Resources tailored to these families in an Ethiopian context are almost nonexistent.

4. **Fragmented learning.** Educational content for parents is scattered across blogs, social media posts, and short articles without structure or progression. There is no pathway for a parent to learn systematically.

## 1.3 Proposed Solution

Sidra addresses these problems by building a unified digital platform offering:

- **Structured educational courses** organized into topics, levels, and lesson sequences, with support for video, reading, and downloadable content.
- **A verified professional directory** where administrators review and approve child-development professionals before their profiles become publicly visible.
- **Curated learning resources** including external articles, guides, and tools from reputable organizations.
- **Community and communication features** including parent circles and direct messaging (partially implemented).
- **An administrator dashboard** for platform management, content governance, user management, and professional verification.

## 1.4 Project Motivation

The project was motivated by the conviction that parenting education should be affordable, accessible, and culturally grounded. Ethiopia has one of the youngest populations in the world, yet parenting support infrastructure lags significantly behind global standards. Sidra represents an attempt to close this gap using modern web technology.

The choice of the PERN stack reflects a commitment to using free, open-source, and widely supported technologies that can be maintained, extended, and deployed at low cost — making the platform viable for a non-profit or social-impact context.

## 1.5 Objectives

### General Objective
To design and develop a full-stack parenting education and family-support web platform that provides structured courses, professional guidance, and community features for parents and caregivers.

### Specific Objectives
1. Design and implement a normalized PostgreSQL relational database capable of supporting users, courses, lessons, enrollments, professional profiles, and session management.
2. Build a secure authentication system using bcrypt password hashing and server-managed HttpOnly session cookies.
3. Implement role-based access control distinguishing between parents, professionals, and administrators at both the frontend route level and backend API level.
4. Develop a responsive, accessible, bilingual (English/Amharic) React frontend covering all core user journeys.
5. Build an administrative backend API supporting user management, professional approval, course management, and platform statistics.
6. Create a community features module including circles and direct messaging.
7. Establish a test suite covering authentication, profile management, and admin operations.

## 1.6 Scope and Limitations

### In Scope
- User registration, login, logout, and profile management
- Course catalog browsing, course detail pages, and lesson display
- Professional directory with admin-controlled verification
- Admin dashboard with user management, professional approval, and platform statistics
- Community circles and clinical chat interface (frontend prototype)
- Backend authentication, session management, and admin APIs
- Database schema design and migration

### Out of Scope (as of this documentation)
- Payment gateway integration (Telebirr, Chapa) — designed but not connected
- Email delivery and password reset
- Real-time chat using WebSockets (current implementation uses static demo data)
- Mobile native applications
- Video hosting infrastructure
- Deployment to a production server

## 1.7 Target Users

| User Type | Description |
|---|---|
| **Parents and Caregivers** | Mothers, fathers, legal guardians, and other caregivers seeking structured parenting education and professional guidance. Primary users. |
| **Child-Development Professionals** | Pediatricians, therapists, psychologists, speech-language pathologists, and other specialists who apply to list their services on the platform. |
| **Platform Administrators** | Staff responsible for content management, user oversight, professional verification, and platform governance. |
| **Visitors** | Unauthenticated users who can browse public course listings and the professional directory. |

---

# CHAPTER 2: SYSTEM REQUIREMENTS

## 2.1 Functional Requirements

**Table 2.1 — Functional Requirements**

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Visitors can browse the public homepage, course catalog, and professional directory without creating an account. | High |
| FR-02 | Users can register with their full name, email, password, and family role. | High |
| FR-03 | Users can log in with email and password and receive a server-managed session cookie. | High |
| FR-04 | Users can log out, which destroys the server-side session and clears the cookie. | High |
| FR-05 | Users can view and edit their profile, including their name and family role. | High |
| FR-06 | Authenticated users can change their password after verifying the current password. | High |
| FR-07 | Authenticated users can browse and enroll in courses. | High |
| FR-08 | Enrolled users can track their lesson completion progress. | High |
| FR-09 | Professionals can register and submit profile applications for admin review. | Medium |
| FR-10 | Visitors and registered users can browse the verified professional directory. | Medium |
| FR-11 | Administrators can view, search, filter, and paginate all registered users. | High |
| FR-12 | Administrators can activate or deactivate user accounts. | High |
| FR-13 | Administrators can change user roles. | High |
| FR-14 | Administrators can approve or reject professional applications, with an optional rejection reason. | High |
| FR-15 | Administrators can view platform statistics including total users, professionals, courses, and enrollments. | High |
| FR-16 | Administrators can view recent user registrations and platform activity. | Medium |
| FR-17 | Public registration must never allow the `admin` role to be assigned. | Critical |
| FR-18 | Inactive accounts must be unable to log in and must have all active sessions immediately invalidated. | Critical |

## 2.2 Non-Functional Requirements

**Table 2.2 — Non-Functional Requirements**

| ID | Requirement | Category |
|---|---|---|
| NFR-01 | The application must be responsive and usable on mobile, tablet, and desktop. | Usability |
| NFR-02 | All forms must validate input on the client and server side. | Reliability |
| NFR-03 | Password hashes must use bcrypt with a work factor of 12. | Security |
| NFR-04 | Session cookies must be HttpOnly, SameSite=Lax, and Secure in production. | Security |
| NFR-05 | Password hashes and session tokens must never be included in API responses. | Security |
| NFR-06 | All database queries must use parameterized values to prevent SQL injection. | Security |
| NFR-07 | The platform must meet WCAG 2.1 Level AA accessibility guidelines where feasible. | Accessibility |
| NFR-08 | All pages must use semantic HTML and visible keyboard-focus states. | Accessibility |
| NFR-09 | The system must handle API errors gracefully with user-friendly messages. | Reliability |
| NFR-10 | The production build must complete without errors (verified by `vite build`). | Reliability |
| NFR-11 | Sensitive credentials must be stored in environment variables and never committed to version control. | Security |

## 2.3 User Roles and Permissions

**Table 2.3 — User Roles and Permissions**

| Permission | Visitor | Parent/Caregiver | Professional | Admin |
|---|---|---|---|---|
| Browse public courses | ✅ | ✅ | ✅ | ✅ |
| Browse professional directory | ✅ | ✅ | ✅ | ✅ |
| Register and log in | ✅ | ✅ | ✅ | — |
| Enroll in courses | ❌ | ✅ | ✅ | ✅ |
| Track lesson progress | ❌ | ✅ | ✅ | ✅ |
| Edit own profile | ❌ | ✅ | ✅ | ✅ |
| Submit professional application | ❌ | ❌ | ✅ | — |
| Access admin dashboard | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| Approve/reject professionals | ❌ | ❌ | ❌ | ✅ |
| Manage courses and content | ❌ | ❌ | ❌ | ✅ |

> Note: The `admin` role can only be assigned directly in the database or through the admin role-management endpoint. It is permanently blocked via public registration.

## 2.4 Account Role vs. Family Role

The system distinguishes two separate role systems:

- **Account Role** (`users.role`): Controls platform permissions. Values: `mother`, `father`, `legal_guardian`, `professional`, `admin`.
- **Family Role**: A user-preference field identifying the user's relationship to the child they care for. Values overlap with account role but serve display and avatar purposes, not authorization.

This separation ensures that displaying a "Mother" avatar does not grant or imply any specific platform permissions.

## 2.5 Hardware and Software Requirements

**Development Environment**
- Operating System: Windows 11 / macOS / Linux
- RAM: 4 GB minimum, 8 GB recommended
- Disk: 1 GB for project files and dependencies
- Internet connection for npm package installation

**Software Requirements Table 2.4**

| Software | Version | Purpose |
|---|---|---|
| Node.js | v18 LTS or later | Backend runtime and build tools |
| npm | v9 or later | Package management |
| PostgreSQL | v16 / v18 | Database server |
| pgAdmin 4 | Any current | Database GUI administration |
| Git | 2.x | Version control |
| A modern browser | Chrome, Firefox, Edge | Frontend testing |

---

# CHAPTER 3: SYSTEM ANALYSIS AND DESIGN

## 3.1 Overall System Architecture

Sidra follows a standard three-tier client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                            │
│                                                             │
│   React 18 SPA (Vite)   ←── Tailwind CSS styling           │
│   React Router v6       ←── Client-side navigation          │
│   AuthContext           ←── Session state management        │
│   api.js (fetch)        ←── HTTP requests with cookies      │
└──────────────────┬──────────────────────────────────────────┘
                   │  HTTP/REST (JSON)  credentials: 'include'
                   │  Vite dev proxy → localhost:5000
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS API SERVER                     │
│                    (Node.js v18+, port 5000)                 │
│                                                             │
│   CORS + cookieParser + express.json                        │
│   Routes: /api/auth, /api/courses, /api/enrollments,        │
│           /api/professionals, /api/admin, /api/health        │
│   Middleware: authenticate.js, requireRole.js               │
│   Models: userModel, courseModel, professionalModel, etc.   │
│   Utils: password.js (bcrypt), session.js (crypto)          │
└──────────────────┬──────────────────────────────────────────┘
                   │  pg Pool — parameterized queries
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                       │
│                    (sidra_db, port 5432)                     │
│                                                             │
│   Tables: users, sessions, courses, lessons,                │
│           enrollments, lesson_progress,                      │
│           professional_profiles                             │
└─────────────────────────────────────────────────────────────┘
```

**Figure 3.1 — PERN Stack Architecture Diagram**

## 3.2 PERN Stack Component Responsibilities

| Layer | Technology | Responsibility |
|---|---|---|
| **P** | PostgreSQL 18 | Persistent relational data storage; enforces constraints, foreign keys, and uniqueness at the database level |
| **E** | Express.js 4.19 | REST API routing, middleware orchestration, authentication enforcement, error handling |
| **R** | React.js 18.3 | Single-page application UI, client-side routing, component state management |
| **N** | Node.js 18+ | Server runtime for Express; used for the build system (via Vite) on the frontend |

## 3.3 Frontend–Backend Communication

The frontend communicates with the backend exclusively through HTTP REST API calls handled by `client/src/services/api.js`. All requests include `credentials: 'include'` so the browser automatically attaches the `sid` session cookie.

During development, a Vite proxy (`vite.config.js`) forwards all `/api/*` requests from `http://localhost:5173` to `http://localhost:5000`, eliminating CORS complexity and ensuring the session cookie operates on the same origin.

```javascript
// vite.config.js — proxy configuration
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

## 3.4 Database Architecture

The database contains seven tables in the `public` schema of the `sidra_db` PostgreSQL database. All primary keys are UUIDs generated by `gen_random_uuid()` from the `pgcrypto` extension, preventing ID enumeration.

**Table 3.1 — Database Tables Summary**

| Table | Rows Purpose | Key Relationships |
|---|---|---|
| `users` | All account holders | Referenced by all user-owned tables |
| `sessions` | Server-managed auth sessions | FK → users (CASCADE delete) |
| `professional_profiles` | Professional directory entries | FK → users (CASCADE delete); UNIQUE user_id |
| `courses` | Course catalog | Referenced by lessons, enrollments |
| `lessons` | Individual lessons per course | FK → courses (CASCADE delete); UNIQUE (course_id, position) |
| `enrollments` | User course enrollments | FK → users + courses; UNIQUE (user_id, course_id) |
| `lesson_progress` | Per-user lesson completion | FK → users + lessons; UNIQUE (user_id, lesson_id) |

## 3.5 Entity-Relationship Diagram

```
USERS ──────────────── SESSIONS
  │    1              0..*    (server-managed auth sessions)
  │
  ├──────────────── PROFESSIONAL_PROFILES
  │    1              0..1    (one profile per professional)
  │
  ├──────────────── ENROLLMENTS
  │    1              0..*    ──── COURSES
  │                                  │    1
  │                                  ├──── LESSONS
  │                                  │       │    1
  └──────────────── LESSON_PROGRESS  └───────┘    0..*
       1              0..*
```

**Figure 3.2 — Entity-Relationship Diagram (simplified)**

Key integrity rules enforced at the database level:
- `UNIQUE (user_id, course_id)` on `enrollments` — prevents duplicate enrollment
- `UNIQUE (user_id, lesson_id)` on `lesson_progress` — prevents duplicate progress records
- `UNIQUE (course_id, position)` on `lessons` — enforces ordered positioning within a course
- `CHECK (role IN (...))` on `users` — restricts role values to the defined set
- `ON DELETE CASCADE` propagates user and course deletions to all dependent records

## 3.6 Authentication and Authorization Flow

The authentication system uses server-managed sessions rather than stateless JWTs:

```
REGISTRATION FLOW
─────────────────
Client                    Server                    Database
  │                          │                         │
  ├─ POST /api/auth/register ─►                        │
  │   { full_name, email,     │                        │
  │     password, role }      ├─ Validate input        │
  │                           ├─ Block admin role       │
  │                           ├─ Check email unique ───►
  │                           │                 ◄─ OK   │
  │                           ├─ bcrypt.hash(pw, 12)    │
  │                           ├─ INSERT users ─────────►
  │                           ├─ crypto.randomBytes(32) │
  │                           ├─ INSERT sessions ──────►
  │                           ├─ Set-Cookie: sid=...    │
  │◄─ 201 { user } (safe) ───┤                         │
  │   (no password_hash)      │                         │
```

**Figure 3.3 — Authentication Flow Diagram**

**Session validation on every protected request:**

```
authenticate middleware:
  1. Read sid cookie from request
  2. If absent → 401
  3. SELECT * FROM sessions WHERE id = sid AND expires_at > NOW()
  4. If not found → 401, clear stale cookie
  5. SELECT * FROM users WHERE id = session.user_id AND is_active = TRUE
  6. If not found or inactive → 401, delete session, clear cookie
  7. Attach user to req.user
  8. Call next()
```

This design ensures that deactivated accounts are immediately locked out without waiting for token expiry.

## 3.7 System Security Considerations

| Concern | Implementation |
|---|---|
| Password storage | bcrypt with work factor 12 via `bcryptjs` |
| Session storage | HttpOnly, SameSite=Lax, Secure (production) cookies |
| SQL injection | All queries use `pg` parameterized values (`$1, $2, …`) |
| Admin role escalation | `REGISTRATION_ROLES` whitelist blocks `admin` at registration; `PUBLIC_ROLES` in `updateUser()` blocks self-promotion |
| Sensitive API fields | `password_hash` never returned in any response; uses `SAFE_COLS` constant |
| Last-admin protection | `countActiveAdmins()` prevents demotion of the last active administrator |
| Session invalidation | Logout deletes the session row — cookie deletion alone is insufficient |
| CORS | `credentials: true` with exact origin (`CLIENT_ORIGIN`), never wildcard `*` |

---

# CHAPTER 4: USER INTERFACE DESIGN

## 4.1 Design System

Sidra uses a consistent design system implemented in Tailwind CSS. The palette is warm and professional, appropriate for a family-support platform.

**Color Palette**

| Token | Hex Value | Usage |
|---|---|---|
| `cream` | `#FCF8F1` | Page and section backgrounds |
| `terracotta` | `#D9755E` | Primary buttons, links, active states |
| `terracotta-hover` | `#C5634D` | Hover/pressed states |
| `sage` | `#A8B6A0` | Tags, badges, secondary accents |
| `charcoal` | `#303033` | Primary text and headings |
| `warm-gray` | `#77716C` | Secondary text, captions |
| `border` | `#E8DED3` | Borders and dividers |
| White | `#FFFFFF` | Cards, modals, inputs |

**Typography:** Inter (Google Fonts) — clean, readable, and accessible across age groups.

**Reusable CSS classes defined in `index.css`:**
- `.btn-primary` — terracotta fill button
- `.btn-secondary` — terracotta outline button
- `.card` — white rounded card with border and shadow
- `.tag` — sage green category pill
- `.section-container` — max-width centered content area

## 4.2 Homepage (`/`)

The homepage serves as the primary entry point for all users. It is composed of seven sections arranged vertically:

1. **Sticky Navbar** — Logo (logo.jpg), bilingual brand name "Sidra | ስድራ", navigation links (Home, Courses, Professionals, Resources, Circles & Chat, About Us), auth-aware controls (Login/Register for guests, avatar + Log Out for authenticated users).
2. **Hero Section** — Headline in Amharic, supporting text, two CTAs (Explore Courses, Browse Professionals), and a hero image (Capture.PNG).
3. **How Sidra Supports Families** — Four feature highlight cards with icons: Trusted Courses, Expert Professionals, Inclusive Resources, Track Your Progress.
4. **Featured Courses** — Grid of three demo course cards with category, level, price, and a "View Course" link.
5. **Professional Directory Preview** — Three sample professional cards with avatar, specialty, and a "View Profile" link.
6. **Call-to-Action** — Full-width terracotta section with registration prompt.
7. **Footer** — Three-column layout with brand, navigation links, legal links, and social media icons (Instagram, Facebook, TikTok, YouTube, Telegram — currently linked to platform homepages as placeholders).

## 4.3 Courses Page (`/courses`)

The Courses page provides a fully functional catalog browser with:
- **Search** by title, description, and category (live filtering)
- **Filters** by category (7 options), level (Beginner/Intermediate/Advanced), price (All/Free/Paid), and format
- **Sort** options: Recommended, Price Low→High, Price High→Low, Newest
- **Active filter chips** with individual remove buttons and Reset All
- **Results count** with `aria-live` announcement
- **Desktop sidebar + mobile drawer** for filter controls
- **Course card grid** (1→2→3 columns responsive)
- **Empty state** when no results match

Current data source: `client/src/data/courses.js` — 8 demo courses. Real API integration is planned.

## 4.4 Course Detail Page (`/courses/:id`)

Each course detail page includes:
- Breadcrumb navigation (Home → Courses → Course Title)
- Course header with category/level/format/duration metadata
- Enrollment card (right sidebar) with price in ETB, enroll button, course highlights
- Video lesson placeholder
- Learning objectives (bulleted list)
- Intended audience description
- Accordion curriculum (modules/lessons with type indicators)
- External learning resources (links to WHO, CDC, AAP, UNICEF, NHS, etc.)
- Payment modal (demo — no real payment processed)

**Enrollment button behavior:**
- Unauthenticated users → redirected to `/login` with `state.from` set to return after login
- Authenticated users → "Enrollment coming soon" notice (API pending)

## 4.5 Login Page (`/login`)

Centered card layout with:
- Email and password fields with validation
- Generic error message on failure (does not reveal which field failed)
- Redirect to the originally requested page after login (`location.state.from`)
- Link to registration

## 4.6 Registration Page (`/register`)

- Full name, email, password (min 8 chars, requires letter + number), confirm password
- **Family role selector** — four illustrated selectable cards: Mother, Father, Legal Guardian, Other Caregiver
- Role cards use radio semantics with visible selected-tick indicator
- Client-side and server-side validation aligned
- Field-level error surfacing from backend (e.g., duplicate email)

## 4.7 Profile Page (`/profile`)

Protected route (requires authentication).

**View mode:** Displays role-based circular avatar, full name, email, family role badge, and Edit Profile button.

**Edit mode:** Editable name field, read-only email (with explanation), four-card role selector, Save/Cancel buttons, success banner on save.

**Role-based avatars:** The `RoleAvatar` component (`components/common/RoleAvatar.jsx`) renders a distinct inline SVG illustration for each role (Mother, Father, Legal Guardian, Other Caregiver) with fallback. Used in the navbar (42px) and profile page (80px).

## 4.8 Professional Directory (`/professionals`)

Displays a grid of cards for verified professionals. Each card shows name, specialty, qualifications excerpt, and a "View Profile" link. Individual profile pages are accessible at `/professionals/:id`.

## 4.9 Admin Dashboard (`/admin/*`)

The admin dashboard uses a separate full-page layout (`DashboardLayout`) that bypasses the public Navbar and Footer. It consists of:

**Sidebar:** Charcoal background with 8 navigation items (Overview, User Management, Professional Approvals, Course Management, Categories, Resource Management, Reports, Settings), active-page highlighting, and profile/logout in the footer.

**Header:** Current page title, breadcrumb, admin avatar.

**Admin Overview (`/admin`):**
- 9 stat cards (Total Users, Active Users, Professionals, Approved Pros, Pending Reviews, Courses, Mothers, Fathers, Legal Guardians) — populated from real database
- Pending professional applications panel (live data)
- Recent activity feed (registrations, enrollments, applications)
- Quick action cards (Manage Users, Review Professionals, Manage Courses, Manage Resources)

**Admin Users (`/admin/users`):**
- Paginated user table (15 per page)
- Search by name/email, filter by role and status, sort by date
- Activate/Deactivate buttons with confirmation dialogs
- Role change dialog with dropdown
- Self-modification disabled (cannot deactivate own account or change own role)
- Toast notifications on success/failure

**Admin Professionals (`/admin/professionals`):**
- List of pending professional applications
- Expandable profile cards (qualifications, bio, submission date)
- Approve and Reject buttons with confirmation dialogs
- Rejection reason textarea
- Toast notifications

## 4.10 Community and Chat (`/circles`)

The Circles & Chat page provides a three-column messaging interface:
- **Left sidebar:** Tab toggle (1-on-1 Care / Parent Circles), search, clinical contact list, community circles list
- **Center:** Chat messages view, attachments, message input with file attach and voice record buttons
- **Right panel:** Doctor information, upcoming session card, care plan checklist, specialist memo — collapsible
- **Bottom banner:** Live audio circle announcement — dismissible

Currently uses demo/mock data. Real-time functionality (WebSockets, live chat) is planned for a future phase.

## 4.11 Responsive Design

The application uses a mobile-first responsive approach via Tailwind CSS breakpoints:

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Mobile default | < 640px | Single column; hamburger nav |
| `sm` | ≥ 640px | Two-column grids begin; filters visible |
| `md` | ≥ 768px | Full desktop navbar; sidebar filters |
| `lg` | ≥ 1024px | Three-column course grid |
| `xl` | ≥ 1280px | Admin dashboard shows right panel |

---

# CHAPTER 5: SYSTEM IMPLEMENTATION

## 5.1 Project Folder Structure

```
Sidra/
├── client/                          ← React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/                  ← logo.jpg, Capture.PNG
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── RoleAvatar.jsx   ← Role-based SVG avatar
│   │   │   ├── courses/             ← CourseCard, SearchBar, filters, etc.
│   │   │   ├── dashboard/           ← DashboardLayout, Sidebar, Header, etc.
│   │   │   ├── home/                ← Hero, HowItWorks, FeaturedCourses, etc.
│   │   │   └── layout/              ← Navbar.jsx, Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      ← Auth state + API calls
│   │   ├── data/
│   │   │   └── courses.js           ← 8 demo courses
│   │   ├── pages/                   ← All page components
│   │   │   ├── admin/               ← 8 admin pages
│   │   │   └── (13 other pages)
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx        ← All routes + guards
│   │   ├── services/
│   │   │   └── api.js               ← Fetch wrapper + all API calls
│   │   └── styles/
│   │       └── index.css            ← Tailwind + global styles
│   ├── vite.config.js               ← Dev proxy + asset config
│   ├── tailwind.config.js           ← Custom colors/fonts
│   └── package.json
│
├── server/                          ← Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                ← pg Pool connection
│   │   │   └── env.js               ← Centralized env vars
│   │   ├── db/
│   │   │   ├── schema.sql           ← 7-table schema
│   │   │   └── migrate.js           ← Idempotent migration runner
│   │   ├── middleware/
│   │   │   ├── authenticate.js      ← Session validation
│   │   │   ├── requireRole.js       ← Role-based access control
│   │   │   ├── errorHandler.js      ← Centralized error handling
│   │   │   └── notFound.js          ← 404 handler
│   │   ├── models/                  ← DB query functions (6 models)
│   │   ├── routes/                  ← Route handlers (5 routes)
│   │   └── utils/
│   │       ├── password.js          ← bcrypt helpers
│   │       └── session.js           ← Session CRUD helpers
│   ├── tests/                       ← 4 integration test suites
│   ├── .env                         ← Local credentials (not committed)
│   ├── .env.example                 ← Safe-to-commit template
│   └── package.json
│
└── docs/                            ← Project documentation
```

**Figure 5.1 — Project Folder Structure**

## 5.2 Frontend Architecture

The frontend is a React 18 single-page application built with Vite.

**Entry point:** `main.jsx` wraps the entire application in `<BrowserRouter>` (React Router v6) then `<AuthProvider>` (authentication context), then `<App>`.

**`App.jsx`** detects whether the current route starts with `/admin` and conditionally omits the public Navbar and Footer — admin pages use their own full-page layout.

**`AuthContext.jsx`** is the central state management layer for authentication:
- On mount, calls `GET /api/auth/me` to restore session from the HttpOnly cookie
- Exposes `user`, `loading`, `register()`, `login()`, `updateProfile()`, `logout()`
- Normalizes the backend field `full_name` to `name` via `normaliseUser()`
- All functions make real API calls to the backend via `api.js`

**`api.js`** is the centralized fetch wrapper:
- All requests include `credentials: 'include'`
- Throws normalized `Error` objects with `err.status` and `err.fields` for form error surfacing
- Exports two groups: `authApi` (5 endpoints) and `adminApi` (10 endpoints)

**Figure 3.4 — Frontend Component Tree (key components)**
```
App
├── Navbar (public layout)
├── AppRoutes
│   ├── Public routes → [HomePage, CoursesPage, CourseDetailPage, ...]
│   ├── ProtectedRoute → ProfilePage
│   └── AdminRoute → [AdminOverviewPage, AdminUsersPage, ...]
│       └── DashboardLayout
│           ├── DashboardSidebar
│           ├── DashboardHeader
│           └── page content
└── Footer (public layout)
```

## 5.3 Backend Structure

The backend follows a layered architecture:

```
Request → CORS + cookieParser + express.json
       → authenticate.js (reads sid cookie, validates session, attaches req.user)
       → requireRole.js (checks req.user.role against allowed roles)
       → Route Handler
       → Model function (parameterized SQL via pg Pool)
       → Response
       → errorHandler.js (catches any thrown errors)
```

**Models** provide the only database access layer. Each model file corresponds to a database table and exports pure async functions that accept plain objects and return plain objects. The `SAFE_COLS` constant in `userModel.js` ensures `password_hash` is never included in standard queries.

## 5.4 REST API Endpoints

**Table 3.2 — API Endpoint Reference**

| Method | Endpoint | Auth Required | Admin Only | Description |
|---|---|---|---|---|
| GET | `/api/health` | No | No | Server + DB health check |
| POST | `/api/auth/register` | No | No | Create new account |
| POST | `/api/auth/login` | No | No | Authenticate and set session cookie |
| POST | `/api/auth/logout` | No | No | Delete session and clear cookie |
| GET | `/api/auth/me` | Yes | No | Get authenticated user profile |
| PUT | `/api/auth/me` | Yes | No | Update name and family role |
| POST | `/api/auth/change-password` | Yes | No | Change password, invalidate other sessions |
| GET | `/api/courses` | No | No | List published courses |
| GET | `/api/courses/:id` | No | No | Get course detail with lessons |
| POST | `/api/courses` | Yes | Yes | Create course |
| PUT | `/api/courses/:id` | Yes | Yes | Update course |
| DELETE | `/api/courses/:id` | Yes | Yes | Delete course |
| POST | `/api/enrollments` | Yes | No | Enroll in a course |
| GET | `/api/enrollments/my` | Yes | No | Get user's enrollments |
| POST | `/api/enrollments/:id/progress` | Yes | No | Update lesson progress |
| GET | `/api/professionals` | No | No | List approved professionals |
| GET | `/api/professionals/:id` | No | No | Get professional profile |
| POST | `/api/professionals/apply` | Yes | No | Submit professional application |
| GET | `/api/admin/users` | Yes | Yes | Paginated user list with filters |
| GET | `/api/admin/users/:id` | Yes | Yes | Single user detail |
| PATCH | `/api/admin/users/:id/status` | Yes | Yes | Activate/deactivate account |
| PATCH | `/api/admin/users/:id/role` | Yes | Yes | Change user role |
| GET | `/api/admin/professionals/pending` | Yes | Yes | Pending applications |
| PATCH | `/api/admin/professionals/:id/approve` | Yes | Yes | Approve application |
| PATCH | `/api/admin/professionals/:id/reject` | Yes | Yes | Reject with optional reason |
| GET | `/api/admin/dashboard/stats` | Yes | Yes | Platform statistics |
| GET | `/api/admin/dashboard/recent-users` | Yes | Yes | Recent registrations |
| GET | `/api/admin/dashboard/recent-activity` | Yes | Yes | Combined activity feed |

*Note: Some course, enrollment, and professional endpoints listed above are implemented — refer to the actual routes files for confirmed implementation status.*

## 5.5 Authentication Implementation

The authentication system uses two utilities:

**`utils/password.js`** — bcrypt wrapper:
```javascript
import bcrypt from 'bcryptjs'
const SALT_ROUNDS = 12

export async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS)
}

export async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash)
}

// Dummy hash prevents timing attacks during login for non-existent users
export const DUMMY_HASH = '$2a$12$dummyhashfortimingprotectionXXXXXXXXXXXXXXXXXXX'
```

**`utils/session.js`** — session management:
```javascript
import { randomBytes } from 'crypto'

export async function createSession(userId, { ip, userAgent } = {}) {
  const id = randomBytes(32).toString('hex')  // 256-bit entropy
  const expiresAt = new Date(Date.now() + DURATION_MS)
  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, userId, expiresAt, ip, userAgent]
  )
  return id
}
```

## 5.6 Admin Dashboard Statistics

The `getDashboardStats()` function in `userModel.js` runs four parallel database queries to gather live statistics:

```sql
-- User counts in a single pass
SELECT
  COUNT(*)                                      AS total_users,
  COUNT(*) FILTER (WHERE is_active = TRUE)      AS active_users,
  COUNT(*) FILTER (WHERE role = 'mother')       AS total_mothers,
  -- ... all role counts
FROM users
```

This aggregates all counts in a single SQL pass, avoiding multiple round-trips.

## 5.7 Role-Based Avatar System

The `RoleAvatar` component renders a distinct inline SVG illustration for each family role:

| Role | Illustration | Colour Palette |
|---|---|---|
| Mother | Adult figure + child at hip | Terracotta tones |
| Father | Broader-shouldered figure + collar detail | Sage green tones |
| Legal Guardian | Figure with shield motif | Muted purple |
| Other Caregiver | Figure with heart + flanking smaller figures | Warm amber |
| Fallback (null) | Simple silhouette | Warm grey |

The component accepts a `size` prop (default 40px) and is used in both the navbar (42px) and the profile page (80px). The role→avatar mapping lives in one file, making updates consistent across the application.

## 5.8 Database Connection

The PostgreSQL connection uses `pg`'s connection pool for efficient connection reuse:

```javascript
export const pool = new Pool({
  host:     env.DB_HOST,      // default: localhost
  port:     Number(env.DB_PORT),  // default: 5432
  database: env.DB_NAME,
  user:     env.DB_USER,
  password: env.DB_PASSWORD || undefined,
  max: 10,                    // max simultaneous connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})
```

The server tests the connection on startup via `testConnection()` and logs a status banner. Pool errors are forwarded to `console.error` to prevent silent failure.

---

# CHAPTER 6: TESTING AND DEBUGGING

## 6.1 Testing Methodology

The project uses integration testing against a live Express server instance. Tests are written as plain Node.js ESM scripts using the `node-fetch` library to make HTTP requests. No additional test framework (Jest, Mocha) is required. This approach keeps the testing infrastructure lightweight while allowing full end-to-end verification of the API behavior.

Tests are run with: `npm run test:all` (from `server/`), which executes four test suites in sequence.

## 6.2 Authentication Test Suite (`auth.test.js`)

32 test assertions covering:

**Table 6.1 — Authentication Test Cases**

| ID | Test Case | Expected Result |
|---|---|---|
| R-01 | Valid registration with name, email, password, role | 201; user returned; no password_hash; cookie set |
| R-02 | Duplicate email registration | 409 Conflict |
| R-03 | Registration with empty name | 400 Bad Request with field error |
| R-04 | Registration with weak password (< 8 chars) | 400 Bad Request |
| R-05 | Registration with `role: "admin"` in body | 201; role silently defaulted (not admin) |
| L-01 | Login with correct credentials | 200; user object; sid cookie set |
| L-02 | Login with wrong password | 401; generic error message |
| L-03 | Login with unregistered email | 401; same timing as L-02 (timing attack prevention) |
| M-01 | GET /me with valid session | 200; correct profile; no password_hash |
| M-02 | GET /me with no cookie | 401 |
| M-03 | GET /me with fake session ID | 401 |
| U-01 | PUT /me — update full name | 200; name updated |
| U-03 | PUT /me with `role: "admin"` | 200; role NOT changed |
| U-04 | PUT /me without cookie | 401 |
| Log-01 | POST /logout | 200; cookie cleared |
| Log-02 | GET /me after logout | 401 (session invalidated) |

**Result: 32/32 PASSED** (verified by running `npm run test`)

## 6.3 Profile Management Test Suite (`profile.test.js`)

38 test assertions covering profile retrieval, name/role updates, role escalation prevention, and the change-password flow including:

**Table 6.2 — Profile Management Test Cases (selected)**

| ID | Test Case | Expected Result |
|---|---|---|
| PR-01 | GET /me returns all required fields | 200; email, full_name, role, is_active, created_at present |
| PR-02 | Response never exposes password_hash | Confirmed absent in all profile responses |
| PU-03 | PUT /me with name shorter than 2 chars | 400 |
| RE-01 | PUT /me with `role: "admin"` | 200; role unchanged |
| CP-02 | Change password with wrong current password | 401 |
| CP-04 | Change password with same new password | 400 |
| CP-08 | Second session invalidated after password change | 401 (session deleted server-side) |
| CP-10 | Old password rejected after change | 401 |
| CP-11 | New password accepted for login | 200 |

**Result: 38/38 PASSED**

## 6.4 Admin API Test Suite (`admin.test.js`)

87 test assertions covering:

**Table 6.3 — Admin API Test Cases (selected)**

| ID | Test Case | Expected Result |
|---|---|---|
| UL-01 | GET /admin/users (authenticated admin) | 200; paginated list; no password_hash |
| UL-07 | GET /admin/users with invalid role filter | 400 |
| UL-09 | GET /admin/users as non-admin | 403 |
| UL-10 | GET /admin/users without auth | 401 |
| US-02 | Deactivated user attempts login | 403 |
| US-05 | Admin attempts to deactivate own account | 403 (self-deactivation blocked) |
| RM-04 | Admin attempts to change own role | 403 (self-role-change blocked) |
| RM-05 | Demoting the last active admin | Blocked if only 1 admin remains |
| PA-03 | Approving an already-approved profile | 200 (idempotent) |
| PA-04 | Rejecting with a reason | 200; rejection_reason stored |
| DB-01 | GET /admin/dashboard/stats | 200; all count fields present and numeric |
| DB-02 | active + inactive = total | Verified mathematically |

**Result: 87/87 PASSED**

## 6.5 Bugs Encountered and Resolved

| Bug | Root Cause | Resolution |
|---|---|---|
| `deactivateUser()` runtime crash | Missing `[id]` parameter array in SQL query call | Added the parameter array: `pool.query(SQL, [id])` |
| Double-fetch on filter change in AdminUsersPage | Two `useEffect` hooks both triggered on filter state change | Merged logic so `fetchUsers()` is called once with the correct page |
| `user.familyRole` undefined in DashboardHeader | Backend returns `role`, not `familyRole`; unmapped field | Changed all references to `user.role` |
| Password validation mismatch | Frontend checked only `length >= 8`; backend also required letter + number | Added `/[A-Za-z]/` and `/[0-9]/` checks to frontend validation |
| `getRoleLabel()` showing raw "admin" string | `FAMILY_ROLES` array only covered caregiver roles | Added fallback map `{ professional, admin }` to `getRoleLabel()` |
| `bcrypt` native binding failure on Node 26 | `bcrypt@5` requires C++ native build not available on Node 26 | Replaced with `bcryptjs@2` (pure JavaScript, identical API) |

---

# CHAPTER 7: DEPLOYMENT

## 7.1 Current Deployment Status

**The application has not been deployed to production at the time of this documentation.** Both the frontend and backend run locally on a developer's machine. This chapter describes the configuration required for production deployment and documents the local development setup.

## 7.2 Local Development Configuration

**Frontend (from `client/`):**
```bash
npm install          # Install dependencies (first time only)
npm run dev          # Start Vite dev server on http://localhost:5173
npm run build        # Create production build in client/dist/
```

**Backend (from `server/`):**
```bash
npm install          # Install dependencies (first time only)
cp .env.example .env # Create local environment file
npm run migrate      # Apply database schema to sidra_db
npm run dev          # Start Express server on http://localhost:5000
```

## 7.3 Environment Variables

**Table 7.1 — Environment Variables (`server/.env`)**

| Variable | Default | Required | Description |
|---|---|---|---|
| `PORT` | 5000 | No | Express server port |
| `NODE_ENV` | development | No | Environment mode |
| `CLIENT_ORIGIN` | http://localhost:5173 | No | Allowed CORS origin |
| `DB_HOST` | localhost | No | PostgreSQL host |
| `DB_PORT` | 5432 | No | PostgreSQL port |
| `DB_NAME` | — | **Yes** | Database name (e.g., sidra_db) |
| `DB_USER` | — | **Yes** | PostgreSQL username |
| `DB_PASSWORD` | — | No | PostgreSQL password (empty = no password) |
| `SESSION_SECRET` | — | **Yes** | Secret for session management |
| `SESSION_DURATION_DAYS` | 7 | No | Session lifetime in days |

> **Security note:** The `.env` file is listed in `.gitignore` and must never be committed to version control. The `.env.example` file contains placeholder values only and is safe to commit.

## 7.4 Production Deployment Plan (Planned)

For production deployment, the following configuration changes are required:

| Setting | Development | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| Cookie `Secure` flag | Off | On (requires HTTPS) |
| Cookie `SameSite` | `Lax` | `Lax` (confirm if same-site or cross-subdomain) |
| CORS origin | `http://localhost:5173` | Production frontend URL |
| Database | Local PostgreSQL | Hosted PostgreSQL (e.g., Supabase, Neon, Render) |
| Backend hosting | Local Node.js | Render, Railway, or VPS |
| Frontend hosting | Vite dev server | Vercel, Netlify, or static host |

The production build command (`npm run build`) has been verified to complete without errors, producing a `client/dist/` directory ready for static hosting.

---

# CHAPTER 8: TEAM COLLABORATION

## 8.1 Team Structure

The project was developed by two team members with divided responsibilities:

**Beimenet (Developer 1):**
- Homepage and Courses frontend (pages, components, filtering, search)
- Authentication system (frontend and backend)
- User profile management (frontend and backend)
- Admin Dashboard (all 8 admin pages, admin API routes)
- Database schema design and migration infrastructure
- Backend foundation (Express setup, CORS, middleware, error handling)
- PostgreSQL connection and model layer
- Project documentation

**Amanuel (Developer 2):**
- Professionals page and Professional Profile page
- About Us page
- Resources page
- Course, lesson, and enrollment backend modules
- Professional directory API
- Community/Circles features

## 8.2 Git Workflow

The project uses a single `main` branch with direct commits. Key milestones visible in the commit history include:

- Initial repository setup and README
- Frontend foundation (Vite + Tailwind + React Router)
- Homepage implementation
- Courses page and course detail implementation
- Backend scaffold (Express + CORS + health check)
- Database schema and PostgreSQL connection
- Authentication system (bcrypt + session cookies)
- Admin dashboard and APIs
- Bug fixes and integration work
- Documentation

## 8.3 Collaboration Practices

- Changes affecting shared infrastructure (database schema, middleware, API shape) were coordinated before implementation
- A clear module boundary was maintained: Beimenet owned auth/user/admin routes; Amanuel owned course/professional/enrollment routes
- The `main` branch was kept working at all times; breaking changes were identified and fixed promptly
- One merge conflict was encountered in `README.md` (documented in Git history) and resolved by combining both versions

---

# CHAPTER 9: CHALLENGES AND SOLUTIONS

## 9.1 PostgreSQL Password Authentication

**Challenge:** The PostgreSQL installation had authentication configured as `scram-sha-256`, but the initial password was not set. Connecting the Node.js `pg` pool returned "password authentication failed" even with an empty password field.

**Solution:** The `ALTER USER postgres WITH PASSWORD '...'` command was executed via pgAdmin's Query Tool to set an explicit password. The `pg` Pool was also updated to use `...(password ? { password } : {})` spread to omit the key entirely when no password is configured, matching PostgreSQL's trust behavior.

## 9.2 bcrypt Native Build Failure

**Challenge:** The `bcrypt` npm package (v5) requires native C++ bindings compiled at install time using `node-pre-gyp`. On Node.js v26, the pre-built binary was unavailable and compilation failed.

**Solution:** Replaced `bcrypt` with `bcryptjs`, a pure JavaScript implementation with an identical API. No code changes were required beyond changing the import; performance is slightly slower but perfectly acceptable for authentication workloads.

## 9.3 Session Persistence After Page Refresh

**Challenge:** The original frontend simulation used `sessionStorage`, which is cleared when a browser tab is closed. Integrating real backend sessions required changing the restoration mechanism entirely.

**Solution:** On application mount, `AuthContext` calls `GET /api/auth/me`. The server reads the HttpOnly cookie, validates the session against the `sessions` table, and returns the user profile. If the cookie is absent or the session is expired, the server returns 401 and the frontend sets `user = null`. No client-side storage is involved.

## 9.4 Git Merge Conflict in README.md

**Challenge:** Both developers made changes to `README.md` simultaneously in separate commits. The file contained conflict markers (`<<<<<<`, `=======`, `>>>>>>>`) that prevented it from rendering correctly.

**Solution:** The conflict was resolved by reading both versions of the conflicting section, combining their content, and writing a clean unified version. All conflict markers were removed and the file was committed.

## 9.5 Frontend–Backend Field Name Mismatch

**Challenge:** The backend returns user objects with the field `full_name`, but the frontend components referenced `user.name`. This caused silent `undefined` rendering on profile pages and the navbar.

**Solution:** A `normaliseUser()` function was added to `AuthContext.jsx` that maps `full_name → name` on every user object received from the API:
```javascript
function normaliseUser(backendUser) {
  if (!backendUser) return null
  return { ...backendUser, name: backendUser.full_name }
}
```

## 9.6 Double-Fetch on Filter Change

**Challenge:** The Admin Users page had two `useEffect` hooks: one listening to filter state to reset the page to 1, and one calling `fetchUsers()` when the page changed. When a filter changed, both effects fired, causing two API calls: one with the old page number and one with page 1.

**Solution:** The `fetchUsers` function was refactored to accept an optional `overridePage` parameter. The filter-change effect now calls `fetchUsers(1)` directly if the page is already 1, or sets the page to 1 (which triggers a single fetch via the page-dependency effect).

## 9.7 `EADDRINUSE` Port Conflict

**Challenge:** When using `node --watch`, if the process was killed uncleanly, the old process continued holding port 5000. Restarting would fail with `Error: listen EADDRINUSE: address already in use :::5000`.

**Solution:** Running `Get-Process -Name "node" | Stop-Process -Force` in PowerShell before restarting clears all Node.js processes. This is a known limitation of `node --watch` and a production process manager (PM2, systemd) would handle this automatically.

---

# CHAPTER 10: CONCLUSION AND FUTURE ENHANCEMENTS

## 10.1 Project Achievements

Sidra has achieved significant progress across all layers of its intended architecture:

**Frontend (Complete):**
- Responsive, accessible, bilingual UI across 13+ pages
- Full authentication flow (login, register, profile, logout)
- Complete course browsing with search, filtering, and sorting
- Role-based avatar system with distinct SVG illustrations
- Fully connected admin dashboard with real-time data from PostgreSQL
- Community and chat prototype interface

**Backend (Largely Complete):**
- Secure authentication system with bcrypt and server-managed sessions
- Complete admin API (user management, professional approvals, statistics)
- Database schema with 7 normalized tables and proper constraints
- Integration test suite with 157 passing assertions

**Database:**
- 7 normalized PostgreSQL tables with foreign keys, indexes, and constraint enforcement
- Idempotent migration system

## 10.2 Objectives Accomplished

| Objective | Status |
|---|---|
| Normalized PostgreSQL database | ✅ Complete — 7 tables |
| Secure authentication | ✅ Complete — bcrypt + HttpOnly cookies |
| Role-based access control | ✅ Complete — frontend guards + backend middleware |
| Responsive bilingual UI | ✅ Complete |
| Admin dashboard APIs | ✅ Complete |
| Admin dashboard frontend | ✅ Complete |
| Community feature prototype | ✅ Frontend prototype complete |
| Test suite | ✅ 157 assertions passing |

## 10.3 Current Limitations

1. **Course enrollment API** — The backend enrollment endpoint exists but the frontend connection is pending. Authenticated users see a "coming soon" notice on course detail pages.
2. **Payment integration** — The PaymentModal component is present (demo only). Telebirr and Chapa integration requires backend provider APIs and a secure verification flow.
3. **Real-time chat** — The Circles & Chat page uses mock data. Live chat requires WebSocket infrastructure.
4. **Email delivery** — Password reset and email verification are designed but not implemented pending selection of an email provider.
5. **Production deployment** — The application has not been deployed to a live server.

## 10.4 Lessons Learned

- **Schema-first development** — Designing the database schema before writing API code prevented most data modeling mistakes and made the API shape predictable.
- **Security defaults** — Implementing security from the start (bcrypt, HttpOnly cookies, parameterized queries) was significantly easier than retrofitting it later.
- **Consistent field naming** — The `full_name`/`name` mismatch across the frontend and backend caused unnecessary debugging time. A shared naming convention defined at the start of the project would have prevented this.
- **Integration testing** — The plain-Node.js test approach proved highly effective. Tests are fast, self-contained, and catch regressions immediately without complex framework setup.

## 10.5 Future Enhancements

1. **Complete course enrollment API** — Connect the existing backend enrollment model to the frontend and enable lesson progress tracking.
2. **Payment integration** — Implement Telebirr and Chapa payment providers with backend verification and webhook handling.
3. **Real-time communication** — Migrate the Circles & Chat feature to a WebSocket implementation using Socket.io or a similar library.
4. **Email delivery** — Integrate an email provider (Resend, SendGrid) for password reset and email verification.
5. **Content management** — Build a full course authoring interface in the admin dashboard for creating and editing courses and lessons.
6. **Multilingual support** — Extend the bilingual Amharic/English branding into full content internationalization.
7. **Production deployment** — Deploy the frontend to a CDN-backed static host (Vercel, Netlify) and the backend to a managed Node.js host (Render, Railway), with a hosted PostgreSQL instance.
8. **Mobile application** — Consider a React Native port of the core features for offline-capable mobile access.
9. **Analytics and reporting** — Expand the admin reports section with time-series charts for user growth, enrollment trends, and content performance.
10. **Accessibility audit** — Commission a professional WCAG 2.1 Level AA audit with assistive technology testing before public launch.

## 10.6 Final Conclusion

Sidra represents a technically well-founded and socially meaningful piece of software. It demonstrates the effective application of the PERN stack in building a production-quality full-stack web application, with particular attention to security, data integrity, and user experience.

The project proves that a small development team can deliver a complex, multi-role platform with real database connectivity, server-side authentication, and a comprehensive admin system. The architecture is clean, extensible, and well-documented, providing a solid foundation for the remaining features and eventual production deployment.

The mission that inspired Sidra — to empower Ethiopian families with reliable parenting knowledge and professional support — remains the guiding principle for all future development.

---

# REFERENCES

1. React Documentation. (2024). *React 18 Reference*. https://react.dev
2. Vite Documentation. (2024). *Vite Guide*. https://vitejs.dev/guide/
3. Tailwind CSS Documentation. (2024). *Tailwind CSS v3*. https://tailwindcss.com/docs
4. React Router Documentation. (2024). *React Router v6*. https://reactrouter.com
5. Express.js Documentation. (2024). *Express 4.x API Reference*. https://expressjs.com/en/4x/api.html
6. node-postgres Documentation. (2024). *pg — PostgreSQL client for Node.js*. https://node-postgres.com
7. PostgreSQL Documentation. (2024). *PostgreSQL 16 Documentation*. https://www.postgresql.org/docs/
8. bcryptjs. (2024). *bcryptjs — bcrypt in plain JS*. https://github.com/dcodeIO/bcrypt.js
9. OWASP. (2024). *Authentication Cheat Sheet*. https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
10. MDN Web Docs. (2024). *HTTP cookies*. https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
11. W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.1*. https://www.w3.org/TR/WCAG21/

---

# APPENDIX A — API Endpoint Reference

See Table 3.2 in Chapter 3 for the full endpoint reference.

# APPENDIX B — Database Schema

See Chapter 3.4 and Chapter 3.5 for the complete database schema and entity-relationship diagram. The authoritative schema definition is located at:

`server/src/db/schema.sql`

Apply with: `cd server && npm run migrate`

# APPENDIX C — Project Setup Instructions

```bash
# Clone the repository
git clone <repository-url>
cd Sidra

# Backend setup
cd server
npm install
cp .env.example .env
# Edit .env: set DB_NAME, DB_USER, DB_PASSWORD, SESSION_SECRET
npm run migrate        # Apply schema to PostgreSQL
npm run dev            # Start backend on http://localhost:5000

# Frontend setup (in a new terminal)
cd client
npm install
npm run dev            # Start frontend on http://localhost:5173
```

**To access the Admin Dashboard:**
1. Register at `/register`
2. Open pgAdmin, run: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';`
3. Log out and log back in
4. Navigate to `/admin`

# APPENDIX D — Test Results Summary

| Test Suite | Tests | Result |
|---|---|---|
| `auth.test.js` | 32 | ✅ All passed |
| `profile.test.js` | 38 | ✅ All passed |
| `admin.test.js` | 87 | ✅ All passed |
| Frontend build | — | ✅ 0 errors, 0 warnings |
| **Total** | **157** | **✅ All passed** |

*Tests run with: `cd server && npm run test:all`*
*Build verified with: `cd client && npm run build`*
