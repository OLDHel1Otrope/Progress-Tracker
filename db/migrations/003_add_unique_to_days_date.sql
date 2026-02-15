CREATE UNIQUE INDEX unique_day_position_active
ON day_goals(goal_date, position)
WHERE archived_at = null;
