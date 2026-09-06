CREATE TABLE IF NOT EXISTS MatchEvents (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  player_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  minute TEXT,
  notes TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (TRIM(player_name) <> ''),
  CHECK (TRIM(event_type) <> '')
);

CREATE INDEX IF NOT EXISTS idx_match_events_match
  ON MatchEvents(season, match_date, event_type, player_name, id);

CREATE INDEX IF NOT EXISTS idx_match_events_player_date
  ON MatchEvents(player_name, match_date DESC, event_type);

CREATE INDEX IF NOT EXISTS idx_match_events_type_date
  ON MatchEvents(event_type, match_date DESC);
