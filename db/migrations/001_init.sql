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
  created_at TIMESTAMP DEFAULT now(),
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  position INT NOT NULL,
  goal_date DATE NOT NULL,
  archived_at TIMESTAMP,
  equadrant INTEGER,
  eposition INTEGER
);

CREATE UNIQUE INDEX unique_day_position_active
ON goals(user_id, goal_date, position)
WHERE archived_at IS NULL;

CREATE INDEX idx_goals_date ON goals(goal_date) WHERE archived_at IS NULL;


COMMIT;
