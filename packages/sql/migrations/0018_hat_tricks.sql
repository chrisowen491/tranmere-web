CREATE TABLE IF NOT EXISTS HatTricks (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  opposition TEXT NOT NULL,
  player_name TEXT NOT NULL,
  goals INTEGER NOT NULL,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (goals >= 3)
);

CREATE INDEX IF NOT EXISTS HatTricks_date_idx
  ON HatTricks (match_date DESC);

CREATE INDEX IF NOT EXISTS HatTricks_player_idx
  ON HatTricks (player_name, match_date DESC);

CREATE INDEX IF NOT EXISTS HatTricks_season_idx
  ON HatTricks (season, match_date DESC);
