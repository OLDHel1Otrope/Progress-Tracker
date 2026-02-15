CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  base_description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- day_goals
CREATE TABLE day_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  goal_date DATE NOT NULL,
  archived_at TIMESTAMP,
  UNIQUE(goal_date, goal_id)
);

-- subtasks
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  position INT
);

COMMIT;
