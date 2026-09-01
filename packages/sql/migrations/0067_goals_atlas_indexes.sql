CREATE INDEX IF NOT EXISTS Goals_atlas_season_date_idx
  ON Goals (season, match_date DESC);

CREATE INDEX IF NOT EXISTS Goals_atlas_competition_date_idx
  ON Goals (competition, match_date DESC);

CREATE INDEX IF NOT EXISTS Goals_atlas_type_date_idx
  ON Goals (goal_type, match_date DESC);
