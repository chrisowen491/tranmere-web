CREATE TABLE PlayerMilestones_new (
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
      'appearance-landmark',
      'longest-absence'
    )
  ),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (milestone_value IS NULL OR milestone_value > 0)
);

INSERT INTO PlayerMilestones_new (
  id, player_name, milestone_type, match_date, season, opposition,
  milestone_value
)
SELECT
  id, player_name, milestone_type, match_date, season, opposition,
  milestone_value
FROM PlayerMilestones;

DROP TABLE PlayerMilestones;
ALTER TABLE PlayerMilestones_new RENAME TO PlayerMilestones;

CREATE INDEX PlayerMilestones_match_date_idx
  ON PlayerMilestones (match_date, player_name, milestone_type);

CREATE INDEX PlayerMilestones_player_idx
  ON PlayerMilestones (player_name, match_date);

CREATE INDEX PlayerMilestones_type_value_idx
  ON PlayerMilestones (milestone_type, milestone_value DESC, player_name ASC);
