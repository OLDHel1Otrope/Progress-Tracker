CREATE TABLE
    strints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        goal_id UUID REFERENCES goals (id) ON DELETE SET NULL,
        -- FALSE = stint (count-up), TRUE = sprint (Pomodoro countdown)
        is_sprint BOOLEAN NOT NULL DEFAULT FALSE,
        start_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        end_at TIMESTAMPTZ,
        archived_at TIMESTAMPTZ,
        description TEXT,
        CHECK (
            end_at IS NULL
            OR end_at >= start_at
        )
    );

ALTER TABLE users
ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC';