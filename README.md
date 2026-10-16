# Sidra (ስድራ)

> A parenting education and family-support platform designed to help parents and caregivers access educational courses, trusted professional guidance, and inclusive resources to support their children's development.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Mission and Vision](#mission-and-vision)
3. [Planned Features](#planned-features)
4. [Technology Stack](#technology-stack)
5. [Design Direction](#design-direction)
6. [Proposed Project Structure](#proposed-project-structure)
7. [Documentation](#documentation)
8. [Getting Started](#getting-started)
9. [Environment Variables](#environment-variables)
10. [Development Roadmap](#development-roadmap)
11. [Current Project Status](#current-project-status)
12. [Contributing](#contributing)
13. [License](#license)

---

## Project Overview

Sidra is a full-stack web platform built for parents and caregivers who want reliable, practical support throughout their parenting journey. The platform will offer structured educational courses, a directory of verified child-development professionals, and inclusive resources that address a wide range of developmental needs.

The name **Sidra (ስድራ)** comes from Amharic, reflecting a commitment to family, community, and belonging.

---

## Mission and Vision

**Mission**
Empower families with reliable knowledge, practical guidance, and inclusive resources to support their children's development and well-being.

**Vision**
A future where every family feels informed, supported, and included throughout their parenting journey.

---

## Planned Features

The following features are **planned** and have not yet been implemented.

1. **User Registration and Secure Login** — Account creation and authentication for parents, caregivers, and professionals.
2. **Parenting Education Courses and Lessons** — Structured, topic-based courses covering key areas of child development and parenting.
3. **Course Enrollment and Learning Progress Tracking** — Users will be able to enroll in courses and track their progress through lessons.
4. **Professional Directory** — A searchable directory of child-development professionals, including their specialties and qualifications.
5. **Admin Dashboard** — An interface for administrators to manage users, courses, lessons, and professional verification.
6. **Responsive Design** — A layout that works across desktop, tablet, and mobile devices.
7. **Inclusive Resources** — Educational content tailored to families supporting children with different developmental needs.

---

## Technology Stack

Sidra is being built on the **PERN** stack.

| Layer | Technology | Purpose |
|---|---|---|
| Database | PostgreSQL | Relational data storage |
| Backend | Node.js + Express.js | REST API and server-side logic |
| Frontend | React.js + Vite | UI library and build tooling |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Navigation | React Router | Client-side routing |
| Version Control | Git + GitHub | Source control and collaboration |

---

## Design Direction

The visual identity of Sidra is designed to feel warm, welcoming, and trustworthy.

- **Backgrounds:** Soft cream tones to create a calm, approachable feel
- **Accents:** Terracotta for warmth and energy
- **Supporting color:** Sage green for growth and balance
- **Cards and surfaces:** Clean white
- **Text:** Charcoal for readability and professionalism
- **Typography:** Clean, legible fonts that are easy to read across all ages

The logo has not yet been finalized. The project name is used as text in its place.

---

## Proposed Project Structure

The structure below is **proposed** and will evolve as development progresses.

```
sidra/
├── client/                     # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Images, icons, fonts
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page-level components
│   │   ├── routes/             # React Router configuration
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React context providers
│   │   ├── services/           # API call functions
│   │   └── styles/             # Global styles and Tailwind config
│   ├── index.html
│   └── vite.config.js
│
├── server/                     # Node.js + Express backend
│   ├── config/                 # Database and environment configuration
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Auth and error-handling middleware
│   ├── models/                 # Database query functions
│   ├── routes/                 # API route definitions
│   └── index.js                # Server entry point
│
├── .env                        # Environment variables (not committed)
├── .gitignore
└── README.md
```

---

## Documentation

Detailed documentation for the project lives in the [`docs/`](./docs) folder.

| Document | Description |
|---|---|
| [Project Specification](./docs/PROJECT_SPECIFICATION.md) | Purpose, user roles, planned features, functional and non-functional requirements, security, accessibility, and acceptance criteria |
| [UI/UX Design](./docs/UI_UX_DESIGN.md) | Color palette, typography, layout direction, page designs, responsive behavior, and accessibility guidelines |
| [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) | Planned PERN stack architecture, layer responsibilities, folder structure, authentication, validation, error handling, and testing strategy |

---

## Getting Started

> **Note:** Installation instructions are forthcoming. The application has not been set up yet. This section will be updated once the initial project scaffold is in place.

**Prerequisites (planned)**
- Node.js (v18 or later)
- npm or yarn
- PostgreSQL

**Setup steps will include:**
1. Cloning the repository
2. Installing dependencies for both the client and server
3. Configuring environment variables
4. Running database migrations
5. Starting the development servers

---

## Environment Variables

> **Note:** The `.env` file has not been defined yet. The variables below are illustrative of what will likely be required.

A `.env` file will be required at the project root. It will contain values such as:

```
# Server
PORT=
NODE_ENV=

# Database
DATABASE_URL=

# Authentication
JWT_SECRET=
JWT_EXPIRES_IN=
```

Never commit your `.env` file. It is listed in `.gitignore`.

---

## Development Roadmap

The roadmap below outlines the planned phases of development. No phase has been completed yet.

| Phase | Focus | Status |
|---|---|---|
| 1 | Project setup — repository, folder structure, tooling | Planned |
| 2 | Database schema design and PostgreSQL setup | Planned |
| 3 | Backend API — authentication and user management | Planned |
| 4 | Frontend foundation — routing, layout, and global styles | Planned |
| 5 | Courses and lessons — backend and frontend | Planned |
| 6 | Professional directory | Planned |
| 7 | Admin dashboard | Planned |
| 8 | Inclusive resources section | Planned |
| 9 | Responsive design polish and accessibility review | Planned |
| 10 | Testing, bug fixes, and final review | Planned |

---

## Current Project Status

**Status: Pre-development**

Sidra is currently in the planning and design phase. The repository has been initialized and the project concept, technology stack, and feature set have been defined. No application code has been written, no packages have been installed, and the application has not been deployed.

---

## Contributing

Contribution guidelines have not yet been established. This section will be updated as the project matures and opens to collaboration.

---

## License

A license has not yet been selected for this project. This section will be updated before the first public release.
