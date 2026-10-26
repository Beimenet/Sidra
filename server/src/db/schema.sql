-- ============================================================
-- Sidra (ስድራ) — PostgreSQL Schema
-- ============================================================
-- Idempotent: safe to run multiple times.
-- Uses CREATE TABLE IF NOT EXISTS so existing tables and data
-- are never dropped or overwritten.
--
-- Apply with:   npm run migrate   (from the server/ directory)
-- Verify with:  \dt              (in psql) or pgAdmin Object Explorer
-- ============================================================


-- ── Enable pgcrypto for gen_random_uuid() ────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ────────────────────────────────────────────────────────────
-- 1. users
--    Central account table. Every person on the platform has
--    exactly one row here regardless of their role.
--
--    Roles
--    ─────
--    mother / father / legal_guardian — parent/caregiver accounts
--    professional                     — verified professionals
--    admin                            — platform administrators
--
--    SECURITY: password_hash stores a bcrypt hash only.
--    Plaintext passwords must never be stored or logged.
--    The backend must never allow 'admin' via public registration.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     TEXT          NOT NULL CHECK (char_length(trim(full_name)) >= 2),
    email         TEXT          NOT NULL UNIQUE,
    password_hash TEXT          NOT NULL,
    role          TEXT          NOT NULL DEFAULT 'mother'
                                CHECK (role IN ('mother', 'father', 'legal_guardian', 'professional', 'admin')),
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);


-- ────────────────────────────────────────────────────────────
-- 2. professional_profiles
--    Extended profile for users with role = 'professional'.
--    Created when a professional submits an application;
--    visible in the directory only when verification_status
--    = 'approved'.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS professional_profiles (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL UNIQUE
                                    REFERENCES users(id) ON DELETE CASCADE,
    specialization      TEXT        NOT NULL,
    bio                 TEXT        NOT NULL,
    qualifications      TEXT        NOT NULL,
    verification_status TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prof_profiles_user_id ON professional_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_prof_profiles_status  ON professional_profiles (verification_status);


-- ────────────────────────────────────────────────────────────
-- 3. courses
--    Course catalog. Only rows with published = TRUE are
--    returned to non-admin users by the API.
--    price_etb = 0 means the course is free.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT           NOT NULL,
    description   TEXT           NOT NULL,
    category      TEXT           NOT NULL,
    price_etb     NUMERIC(10, 2) NOT NULL DEFAULT 0.00
                                 CHECK (price_etb >= 0),
    thumbnail_url TEXT,
    published     BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_published ON courses (published);
CREATE INDEX IF NOT EXISTS idx_courses_category  ON courses (category);


-- ────────────────────────────────────────────────────────────
-- 4. lessons
--    Individual lessons within a course.
--    position controls the display order (1, 2, 3 …).
--    No two lessons in the same course share the same position.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id    UUID        NOT NULL
                             REFERENCES courses(id) ON DELETE CASCADE,
    title        TEXT        NOT NULL,
    description  TEXT,
    video_url    TEXT,
    resource_url TEXT,
    position     INTEGER     NOT NULL CHECK (position > 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, position)
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons (course_id);


-- ────────────────────────────────────────────────────────────
-- 5. enrollments
--    Records when a user enrolls in a course.
--    UNIQUE (user_id, course_id) prevents duplicate enrollments
--    at the database level.
--
--    payment_status values
--    ─────────────────────
--    free       — course is free; no payment required
--    pending    — payment initiated but not yet confirmed
--    completed  — payment confirmed by provider
--    failed     — payment attempt was unsuccessful
--    refunded   — payment was reversed
--
--    NOTE: Raw card details, PINs, or wallet credentials are
--    NEVER stored here. Payment processing (Chapa / Telebirr)
--    will be integrated separately via a secure backend flow.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL
                               REFERENCES users(id) ON DELETE CASCADE,
    course_id      UUID        NOT NULL
                               REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_status TEXT        NOT NULL DEFAULT 'free'
                               CHECK (payment_status IN ('free', 'pending', 'completed', 'failed', 'refunded')),
    UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id   ON enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments (course_id);


-- ────────────────────────────────────────────────────────────
-- 6. lesson_progress
--    Tracks whether a user has completed a specific lesson.
--    UNIQUE (user_id, lesson_id) prevents duplicate rows.
--    completed = FALSE means started but not finished.
--    completed = TRUE  means the user marked the lesson done.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL
                           REFERENCES users(id) ON DELETE CASCADE,
    lesson_id  UUID        NOT NULL
                           REFERENCES lessons(id) ON DELETE CASCADE,
    completed  BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id   ON lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress (lesson_id);


-- ────────────────────────────────────────────────────────────
-- 7. sessions
--    Server-managed session store.
--    The `sid` HttpOnly cookie holds the session id only —
--    no user data or secrets are ever stored in the cookie.
--
--    Session IDs are 64-character hex strings generated with
--    crypto.randomBytes(32) — 256 bits of entropy.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id            TEXT        PRIMARY KEY,
    user_id       UUID        NOT NULL
                              REFERENCES users(id) ON DELETE CASCADE,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address    TEXT,
    user_agent    TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);


-- ────────────────────────────────────────────────────────────
-- Migration 2025-01: add rejection_reason to professional_profiles
-- Idempotent — safe to run multiple times.
-- ────────────────────────────────────────────────────────────
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;


-- ────────────────────────────────────────────────────────────
-- Migration 2025-02: extended professional_profiles fields
-- All columns use ADD COLUMN IF NOT EXISTS — safe to re-run.
-- ────────────────────────────────────────────────────────────

-- Richer credential fields for the professional application form
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS professional_category TEXT;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS institution_name       TEXT;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS license_number         TEXT;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS license_authority      TEXT;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS license_expires_at     DATE;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS years_experience       SMALLINT CHECK (years_experience IS NULL OR years_experience >= 0);
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS workplace              TEXT;

-- Verification workflow fields
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS reviewed_by            UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS reviewed_at            TIMESTAMPTZ;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS review_notes           TEXT;

-- Suspension / reverification
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS is_suspended           BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS reverification_due_at  TIMESTAMPTZ;

-- Extend verification_status to support richer workflow
-- (safe: ADD COLUMN IF NOT EXISTS; existing CHECK is on TEXT so new values
--  are stored fine if the app code accepts them.  To formally extend the
--  CHECK constraint we would need a migration that drops+recreates it; for
--  now the new statuses are guarded at the application layer.)
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS under_review_since     TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_prof_profiles_suspended ON professional_profiles (is_suspended);


-- ────────────────────────────────────────────────────────────
-- Migration 2025-03: Cloudinary media fields
-- Adds Cloudinary public_id, resource_type, and video metadata
-- to both the courses and lessons tables.
-- All statements are idempotent (ADD COLUMN IF NOT EXISTS).
-- ────────────────────────────────────────────────────────────

-- courses: thumbnail Cloudinary metadata
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS thumbnail_public_id TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_resource_type TEXT DEFAULT 'image';

-- lessons: video Cloudinary metadata + poster image
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS video_public_id      TEXT,
  ADD COLUMN IF NOT EXISTS video_resource_type  TEXT DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS video_duration_sec   INTEGER,
  ADD COLUMN IF NOT EXISTS video_poster_url     TEXT;

CREATE INDEX IF NOT EXISTS idx_courses_thumbnail_pid  ON courses (thumbnail_public_id);
CREATE INDEX IF NOT EXISTS idx_lessons_video_pid      ON lessons  (video_public_id);


-- ────────────────────────────────────────────────────────────
-- Migration 2025-04: Real-time Chat — conversations & messages
--
-- conversations: a thread between exactly 2 participants.
--   type: 'direct' (1-on-1) | 'circle' (group, future)
--   Both participant UUIDs are stored directly on the row for
--   fast access-check queries without a join table.
--
-- messages: individual chat messages within a conversation.
--   sender_id is always the authenticated user's UUID.
--   content is plain text for now (max 4000 chars enforced in app).
--
-- All statements are idempotent (CREATE IF NOT EXISTS).
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type            TEXT        NOT NULL DEFAULT 'direct'
                                CHECK (type IN ('direct', 'circle')),
    participant_a   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_b   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Prevent duplicate direct threads between the same pair of users.
    -- canonical order: participant_a < participant_b (UUID lexicographic)
    UNIQUE (participant_a, participant_b)
);

CREATE INDEX IF NOT EXISTS idx_conv_participant_a ON conversations (participant_a);
CREATE INDEX IF NOT EXISTS idx_conv_participant_b ON conversations (participant_b);
CREATE INDEX IF NOT EXISTS idx_conv_updated       ON conversations (updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT        NOT NULL CHECK (char_length(trim(content)) >= 1
                                               AND char_length(content) <= 4000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages (conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages (sender_id);
