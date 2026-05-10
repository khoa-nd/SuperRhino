-- SuperRhino: Add task enhancements (v2)
-- Run this in Supabase SQL Editor or via migration

-- Add new columns to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('important', 'medium', 'optional'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cancelled_by TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cancelled_at TEXT;

-- Drop old category constraint, add new values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_category_check CHECK (category IN ('home', 'personal', 'family', 'work'));

-- Drop old visibility constraint, add new values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_visibility_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_visibility_check CHECK (visibility IN ('private', 'shared'));

-- Add cancel fields to task_assignments
ALTER TABLE task_assignments ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE task_assignments ADD COLUMN IF NOT EXISTS cancelled_by TEXT;

-- Index for overdue tasks
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
