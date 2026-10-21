CREATE TABLE
    strints (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        goal_id UUID REFERENCES goals (id) ON DELETE SET NULL,
        -- FALSE = stint (count-up), TRUE = sprint (pomodoro countdown)
        is_sprint BOOLEAN NOT NULL DEFAULT FALSE,
        start_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        end_at TIMESTAMPTZ,
        archived_at TIMESTAMP,
        description TEXT,
        CHECK (
            end_at IS NULL
            OR end_at >= start_at
        )
    );

ALTER TABLE users
ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC';