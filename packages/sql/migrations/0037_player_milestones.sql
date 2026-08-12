CREATE TABLE IF NOT EXISTS PlayerMilestones (
  id TEXT NOT NULL PRIMARY KEY,
  player_name TEXT NOT NULL,
  milestone_type TEXT NOT NULL,
  match_date TEXT NOT NULL,
  season INTEGER NOT NULL,
  opposition TEXT NOT NULL,
  milestone_value INTEGER,
  CHECK (
    milestone_type IN (
      'debut',
      'latest-appearance',
      'first-goal',
      'appearance-landmark'
    )
  ),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (milestone_value IS NULL OR milestone_value > 0)
);

CREATE INDEX IF NOT EXISTS PlayerMilestones_match_date_idx
  ON PlayerMilestones (match_date, player_name, milestone_type);

CREATE INDEX IF NOT EXISTS PlayerMilestones_player_idx
  ON PlayerMilestones (player_name, match_date);
