CREATE TABLE user_settings (
    user_id UUID REFERENCES users(id),
    key TEXT NOT NULL,
    value BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, key)
);

CREATE TABLE widget_state (
    user_widget_id UUID REFERENCES user_widgets(id),
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);