CREATE TABLE IF NOT EXISTS Apps (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  player_name TEXT NOT NULL,
  competition TEXT,
  opposition TEXT NOT NULL,
  shirt_number INTEGER,
  yellow_card INTEGER NOT NULL DEFAULT 0,
  red_card INTEGER NOT NULL DEFAULT 0,
  substitute_yellow_card INTEGER NOT NULL DEFAULT 0,
  substitute_red_card INTEGER NOT NULL DEFAULT 0,
  substitute_time TEXT,
  substituted_by TEXT,
  substitute_substituted_by TEXT,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (shirt_number IS NULL OR shirt_number >= 0),
  CHECK (yellow_card IN (0, 1)),
  CHECK (red_card IN (0, 1)),
  CHECK (substitute_yellow_card IN (0, 1)),
  CHECK (substitute_red_card IN (0, 1))
);

CREATE INDEX IF NOT EXISTS Apps_player_date_idx
  ON Apps (player_name, match_date DESC);

CREATE INDEX IF NOT EXISTS Apps_season_player_idx
  ON Apps (season, player_name, match_date);

CREATE INDEX IF NOT EXISTS Apps_match_idx
  ON Apps (season, match_date, player_name);
