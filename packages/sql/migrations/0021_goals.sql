CREATE TABLE IF NOT EXISTS Goals (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  scorer TEXT NOT NULL,
  opposition TEXT NOT NULL,
  competition TEXT,
  minute TEXT,
  goal_type TEXT,
  assist TEXT,
  assist_type TEXT,
  foot TEXT,
  six_yard_box INTEGER NOT NULL DEFAULT 0,
  eighteen_yard_box INTEGER NOT NULL DEFAULT 0,
  cross_side TEXT,
  long_range INTEGER NOT NULL DEFAULT 0,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (six_yard_box IN (0, 1)),
  CHECK (eighteen_yard_box IN (0, 1)),
  CHECK (long_range IN (0, 1))
);

CREATE INDEX IF NOT EXISTS Goals_scorer_date_idx
  ON Goals (scorer, match_date DESC);

CREATE INDEX IF NOT EXISTS Goals_season_scorer_idx
  ON Goals (season, scorer, match_date);

CREATE INDEX IF NOT EXISTS Goals_match_idx
  ON Goals (season, match_date, scorer);
