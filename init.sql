-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Admin Users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
                                           id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR NOT NULL,
    email           VARCHAR NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- ── Teachers ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
                                        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR,
    full_name       VARCHAR NOT NULL,
    email           VARCHAR UNIQUE,
    gender          VARCHAR,
    date_of_birth   DATE,
    phone           VARCHAR,
    photo_url       TEXT,
    bio             TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- ── Classes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
                                       id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR NOT NULL,
    grade_level         VARCHAR,
    homeroom_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- ── Students ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
                                        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_number  VARCHAR NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    email           VARCHAR UNIQUE,
    gender          VARCHAR,
    date_of_birth   DATE,
    phone           VARCHAR,
    photo_url       TEXT,
    class_id        UUID REFERENCES classes(id) ON DELETE SET NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- ── Subjects ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
                                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- ── Teacher Assignments ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_assignments (
                                                   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id  UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (teacher_id, class_id, subject_id)
    );

-- ── Class Schedules ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_schedules (
                                               id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id  UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );