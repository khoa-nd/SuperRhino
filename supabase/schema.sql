-- SuperRhino Database Schema
-- Run this in the Supabase SQL Editor

-- Families
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (users)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  family_id TEXT REFERENCES families(id) ON DELETE SET NULL,
  password_hash TEXT NOT NULL,
  is_family_creator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '💪',
  credits INTEGER DEFAULT 3 CHECK (credits >= 1 AND credits <= 10),
  category TEXT DEFAULT 'home' CHECK (category IN ('home', 'personal', 'family', 'work')),
  requires_verification BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
  color TEXT DEFAULT '#4a9eff',
  family_id TEXT REFERENCES families(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Assignments
CREATE TABLE IF NOT EXISTS task_assignments (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  assigner_id TEXT NOT NULL,
  assignee_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified', 'cancelled')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Logs (completions)
CREATE TABLE IF NOT EXISTS task_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  assigner_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'verified')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  task_log_id TEXT REFERENCES task_logs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  streak_type TEXT DEFAULT 'daily',
  current_count INTEGER DEFAULT 0,
  longest_count INTEGER DEFAULT 0,
  last_activity_date TEXT NOT NULL,
  freeze_used INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_family ON profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_tasks_family ON tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assignee ON task_assignments(assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigner ON task_assignments(assigner_id, status);
CREATE INDEX IF NOT EXISTS idx_task_logs_user ON task_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_created ON task_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);

-- RLS: Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- We use service role key on server, so no RLS policies needed
-- (access is gated by the API route)
