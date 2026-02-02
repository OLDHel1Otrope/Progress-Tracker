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

-- days
CREATE TABLE days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, date)
);

-- day_goals
CREATE TABLE day_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_id UUID REFERENCES days(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,

  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  position INT,

  created_at TIMESTAMP DEFAULT now(),

  UNIQUE(day_id, goal_id)
);

-- subtasks
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_goal_id UUID REFERENCES day_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  position INT
);

COMMIT;
