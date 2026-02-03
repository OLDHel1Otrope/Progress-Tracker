ALTER TABLE day_goals
ADD CONSTRAINT unique_day_position
UNIQUE (day_id, position);
