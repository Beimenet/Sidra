# Project Specification — Sidra (ስድራ)

> This document defines the purpose, goals, user roles, feature set, and requirements for the Sidra platform. All features described here are **planned** unless explicitly stated otherwise. See also [System Architecture](./SYSTEM_ARCHITECTURE.md) and [UI/UX Design](./UI_UX_DESIGN.md).

---

## Table of Contents

1. [Project Purpose](#project-purpose)
2. [Mission and Vision](#mission-and-vision)
3. [Problems Sidra Addresses](#problems-sidra-addresses)
4. [Target Audience](#target-audience)
5. [User Roles](#user-roles)
6. [Planned MVP Features](#planned-mvp-features)
7. [Future Considerations](#future-considerations)
8. [Functional Requirements](#functional-requirements)
9. [Non-Functional Requirements](#non-functional-requirements)
10. [Security and Privacy Considerations](#security-and-privacy-considerations)
11. [Accessibility Requirements](#accessibility-requirements)
12. [Acceptance Criteria](#acceptance-criteria)

---

## Project Purpose

Sidra (ስድራ) is a full-stack parenting education and family-support web platform. It is designed to give parents and caregivers reliable, structured access to educational content, verified professional guidance, and inclusive resources that support children's development across a wide range of needs and backgrounds.

The name Sidra comes from Amharic and carries meaning rooted in family, home, and community — values that are central to the platform's identity.

---

## Mission and Vision

**Mission**
Empower families with reliable knowledge, practical guidance, and inclusive resources to support their children's development and well-being.

**Vision**
A future where every family feels informed, supported, and included throughout their parenting journey.

---

## Problems Sidra Addresses

Parents and caregivers commonly face the following challenges that Sidra aims to help with:

- **Information overload and unreliability** — The internet contains vast amounts of parenting content, much of it unverified, contradictory, or not evidence-based. Sidra aims to curate structured, trustworthy educational material.
- **Limited access to professional guidance** — Many families do not know how to find qualified child-development professionals or cannot easily assess their credentials. A searchable professional directory helps close this gap.
- **Lack of inclusive resources** — Families supporting children with different developmental needs (including developmental delays, learning differences, or disabilities) often struggle to find relevant, practical guidance. Sidra will include inclusive resources as a core part of its offering.
- **Fragmented learning** — Parenting education is often scattered across blogs, social media, and short articles without structure or progression. Sidra offers course-based learning with lessons and progress tracking.

---

## Target Audience

Sidra is designed primarily for:

- **Parents and caregivers** of children across a range of ages and developmental stages, regardless of background or experience level.
- **Families supporting children with different developmental needs**, including children with developmental delays, learning differences, or disabilities.
- Visitors who are researching the platform before registering.

The platform aims to be welcoming and accessible to users with varying levels of digital literacy, from first-time parents to experienced caregivers.

---

## User Roles

Three user roles are planned for the initial MVP.

### 1. Visitor

A visitor is any person who accesses the platform without an account. Visitors can:
- Browse the homepage and public-facing pages
- View the course catalog (titles and descriptions)
- Browse the professional directory (public profiles)
- Access the registration and login pages

Visitors cannot enroll in courses, track progress, or access any dashboard functionality.

### 2. Parent / Caregiver

An authenticated user with a registered account. Parents and caregivers can:
- Register and log in securely
- Browse and enroll in courses
- Access course lessons
- Track their learning progress
- View their personal dashboard

### 3. Administrator

A privileged user responsible for managing platform content and maintaining data integrity. Administrators can:
- Access the admin dashboard
- Manage users (view, deactivate)
- Create, update, and remove courses and lessons
- Review and verify professional profiles

---

## Planned MVP Features

The following features define the minimum viable product. None of these features have been implemented yet.

### 1. User Registration and Secure Login

- New users can create an account with their name, email address, and a secure password.
- Existing users can log in with their email and password.
- Passwords will be hashed before storage.
- Authentication will be token-based (JWT).
- Users will be able to log out and invalidate their session.

### 2. Parenting Education Course Catalog

- A browsable catalog of parenting education courses.
- Each course will have a title, description, category, and estimated duration.
- The catalog will be accessible to both visitors (read-only) and registered users.

### 3. Course Details, Lessons, and Enrollment

- Each course will contain an ordered list of lessons.
- Registered users can enroll in a course.
- Enrolled users can access individual lessons within a course.

### 4. Learning Progress Tracking

- The platform will track which lessons an enrolled user has completed.
- A user's dashboard will display their enrolled courses and progress for each.

### 5. Professional Directory

- A directory of child-development professionals (e.g., pediatricians, therapists, psychologists, speech-language pathologists).
- Each professional profile will include name, specialty, qualifications, and a short biography.
- Visitors and registered users can browse and search the directory.
- Professionals will be verified by an administrator before their profiles are made public.

### 6. Admin Dashboard

- A secure, role-protected interface accessible only to administrators.
- Admins can manage users: view accounts and deactivate users.
- Admins can manage courses and lessons: create, edit, and delete content.
- Admins can review and approve or reject professional profiles.

---

## Future Considerations

The following ideas are under consideration for future development beyond the MVP. They are not commitments and have not been designed or scoped.

### Professional Accounts

Allowing professionals to self-register, submit their own profiles for review, and potentially contribute content is a natural extension of the platform. This would require an additional user role, a profile submission workflow, and admin review tooling. This feature is deliberately excluded from the MVP to keep the initial scope manageable.

### Additional Possibilities

- Multilingual content to serve diverse communities
- Parent discussion forums or community spaces
- Push or email notifications for course updates
- Saved resources and personal reading lists
- Search and filtering across the course catalog
- Content ratings or feedback from enrolled users

---

## Functional Requirements

The following requirements describe what the system must be able to do.

| ID | Requirement |
|---|---|
| FR-01 | A visitor must be able to view the public homepage without logging in. |
| FR-02 | A visitor must be able to browse the course catalog without an account. |
| FR-03 | A visitor must be able to browse the professional directory without an account. |
| FR-04 | A user must be able to register with a name, email address, and password. |
| FR-05 | A user must be able to log in with their email address and password. |
| FR-06 | A user must be able to log out. |
| FR-07 | An authenticated user must be able to enroll in a course. |
| FR-08 | An enrolled user must be able to access individual lessons within their enrolled courses. |
| FR-09 | The system must track lesson completion for enrolled users. |
| FR-10 | An authenticated user must be able to view their progress for each enrolled course. |
| FR-11 | An administrator must be able to log in to a protected admin dashboard. |
| FR-12 | An administrator must be able to create, update, and delete courses and lessons. |
| FR-13 | An administrator must be able to view and deactivate user accounts. |
| FR-14 | An administrator must be able to review and verify professional profiles. |
| FR-15 | Unverified professional profiles must not be visible to the public. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | The application must be responsive and usable on mobile, tablet, and desktop screen sizes. |
| NFR-02 | Pages must load within an acceptable time on a standard broadband connection. |
| NFR-03 | The system must validate all user input on both the client and server. |
| NFR-04 | Error messages shown to users must be clear and non-technical. |
| NFR-05 | The codebase must follow consistent structure and naming conventions to support maintainability. |
| NFR-06 | The application must meet WCAG 2.1 Level AA accessibility guidelines where feasible. |
| NFR-07 | Sensitive data (passwords, tokens) must never be logged or exposed in API responses. |
| NFR-08 | The platform must be deployable from environment variables without hardcoded credentials. |

---

## Security and Privacy Considerations

- **Password storage:** User passwords must be hashed using a strong one-way algorithm (e.g., bcrypt) before being stored. Plaintext passwords must never be saved.
- **Authentication tokens:** JWT tokens will be used for session management. Token signing keys must be stored as environment variables and rotated if compromised.
- **Authorization:** Server-side checks must enforce that users can only access resources they are permitted to access. Role-based authorization must be applied to admin routes.
- **Input validation:** All data submitted by users must be validated and sanitized on the server before use, regardless of client-side validation.
- **HTTPS:** The application should be served over HTTPS in any production or staging environment.
- **Sensitive data in responses:** API responses must not return password hashes, internal IDs that expose system structure, or other sensitive internal data unnecessarily.
- **Environment variables:** Secrets such as database credentials and JWT signing keys must be stored in environment variables and never committed to version control.
- **Privacy:** User data must be handled with care. The platform should collect only the data it needs, and users should be informed about how their data is used.

---

## Accessibility Requirements

- All pages must use semantic HTML elements (e.g., `<nav>`, `<main>`, `<header>`, `<section>`, `<article>`) to support assistive technologies.
- All images must include descriptive `alt` attributes.
- Interactive elements (buttons, links, form fields) must be keyboard-navigable.
- Focus states must be clearly visible and not suppressed.
- Color contrast between text and background must meet WCAG 2.1 Level AA minimum ratios (4.5:1 for normal text, 3:1 for large text).
- Forms must include associated `<label>` elements for all inputs.
- Error messages in forms must be programmatically associated with their fields.
- The application must not rely solely on color to convey meaning.

> Full accessibility validation requires manual testing with assistive technologies and expert review. Meeting these requirements is a goal, not a guarantee at this stage.

---

## Acceptance Criteria

The following criteria define a baseline for considering the MVP feature set complete.

| Feature | Acceptance Criteria |
|---|---|
| Registration | A new user can create an account and is redirected to their dashboard on success. |
| Login | A registered user can log in and receive an authenticated session. |
| Logout | A logged-in user can log out and their session is invalidated. |
| Course catalog | The course catalog is visible to visitors without login. |
| Course enrollment | An authenticated user can enroll in a course they are not already enrolled in. |
| Lesson access | An enrolled user can access lessons within their enrolled course. |
| Progress tracking | The dashboard shows accurate lesson completion status for enrolled courses. |
| Professional directory | A visitor can browse verified professional profiles. |
| Admin — courses | An admin can create, edit, and delete a course from the dashboard. |
| Admin — users | An admin can view user accounts and deactivate an account. |
| Admin — professionals | An admin can approve or reject a professional profile submission. |
| Unauthorized access | Accessing a protected page without authentication redirects to the login page. |
| Admin access | Accessing an admin-only route as a non-admin user is rejected with an appropriate error. |
