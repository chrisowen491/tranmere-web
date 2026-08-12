DROP INDEX IF EXISTS PlayerMilestones_match_date_idx;

CREATE INDEX PlayerMilestones_match_date_idx
  ON PlayerMilestones (match_date, player_name, milestone_type);
