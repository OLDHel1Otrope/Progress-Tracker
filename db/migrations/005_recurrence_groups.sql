CREATE TABLE recurrence_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    group_description TEXT
)

ALTER TABLE recurrence_groups
ADD CONSTRAINT unique_recurrence_group_per_user
UNIQUE (group_name, user_id);


ALTER TABLE goals
ADD COLUMN recurr_id UUID;

ALTER TABLE goals
ADD CONSTRAINT fk_goals_recurrence_group
FOREIGN KEY (recurr_id)
REFERENCES recurrence_groups(id)
ON DELETE SET NULL
ON UPDATE CASCADE;