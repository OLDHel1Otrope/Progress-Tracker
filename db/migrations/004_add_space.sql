CREATE TYPE celestial_type AS ENUM (
  'star',
  'planet',
  'moon',
  'comet',
  'nebula'
);

CREATE TYPE rarity_type AS ENUM (
  'common',
  'rare',
  'epic',
  'legendary'
);

CREATE TYPE visibility_type AS ENUM (
  'private',
  'friends',
  'public'
);


CREATE TABLE celestial_bodies (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL,

  type celestial_type NOT NULL,

  name TEXT,

  parent_id UUID REFERENCES celestial_bodies(id)
    ON DELETE CASCADE,

  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  z DOUBLE PRECISION NOT NULL DEFAULT 0,

  orbit_radius DOUBLE PRECISION,
  orbit_speed DOUBLE PRECISION,
  orbit_phase DOUBLE PRECISION,
  orbit_inclination DOUBLE PRECISION,

  size DOUBLE PRECISION NOT NULL,
  color VARCHAR(32) NOT NULL,
  emissive_color VARCHAR(32),
  model_key TEXT,

  unlocked BOOLEAN NOT NULL DEFAULT false,
  placed BOOLEAN NOT NULL DEFAULT false,

  rarity rarity_type NOT NULL DEFAULT 'common',

  description TEXT,

  earned_from JSONB,

  visit_count INTEGER NOT NULL DEFAULT 0,
  last_interacted_at TIMESTAMP,

  visibility visibility_type NOT NULL DEFAULT 'private',

  meta JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
