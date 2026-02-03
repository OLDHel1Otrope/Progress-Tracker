CREATE OR REPLACE FUNCTION reorder_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE day_goals
  SET position = position - 1
  WHERE day_id = OLD.day_id
    AND position > OLD.position;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER after_day_goal_delete
AFTER DELETE ON day_goals
FOR EACH ROW
EXECUTE FUNCTION reorder_after_delete();
