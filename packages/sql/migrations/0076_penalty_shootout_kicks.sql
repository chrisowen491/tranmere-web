CREATE TABLE IF NOT EXISTS PenaltyShootoutKicks (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  kick_order INTEGER NOT NULL,
  team_side TEXT NOT NULL,
  player_name TEXT NOT NULL,
  outcome TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (season, match_date, kick_order),
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  CHECK (kick_order > 0),
  CHECK (team_side IN ('tranmere', 'opposition')),
  CHECK (outcome IN ('scored', 'missed', 'saved'))
);

CREATE INDEX IF NOT EXISTS PenaltyShootoutKicks_match_idx
  ON PenaltyShootoutKicks (season, match_date, kick_order);

CREATE INDEX IF NOT EXISTS PenaltyShootoutKicks_player_idx
  ON PenaltyShootoutKicks (player_name, match_date DESC);
