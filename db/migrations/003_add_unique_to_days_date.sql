CREATE UNIQUE INDEX unique_day_position_active
ON day_goals(day_id, position)
WHERE archived = false;
