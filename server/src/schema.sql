-- Schema for the Hamrahan Omid charity platform.
-- Every statement is idempotent so the API can run this on each boot.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'مدیر',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles: admin (full), editor (content + media), viewer (read-only).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'heart',
  image_url TEXT,
  sort INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  target_amount BIGINT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_sample BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_description TEXT;

CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_sample BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'خبر';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS reading_minutes INTEGER;

CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  donor_name TEXT,
  donor_phone TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway TEXT,
  gateway_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- A simulated donation never represents real money. It is labelled as such everywhere.
ALTER TABLE donations ADD COLUMN IF NOT EXISTS simulated BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS donations_project_idx ON donations(project_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations(status);

CREATE TABLE IF NOT EXISTS volunteers (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  skills TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  note TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_reports (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  period TEXT,
  summary TEXT NOT NULL DEFAULT '',
  amount_spent BIGINT,
  file_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE financial_reports ADD COLUMN IF NOT EXISTS is_sample BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT,
  mime TEXT,
  size_bytes BIGINT,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_created_idx ON media(created_at DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  detail TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_log(created_at DESC);

-- Shared, durable request counters (see server/src/rate-limit.js). Living in the
-- database means every API process shares the same window and a restart does not
-- reset an attacker's quota.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits(window_start);

-- Bumped whenever a password changes, so older session tokens stop being valid.
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0;
