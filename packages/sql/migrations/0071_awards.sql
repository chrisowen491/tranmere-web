CREATE TABLE IF NOT EXISTS Awards (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (TRIM(name) <> '')
);

CREATE INDEX IF NOT EXISTS idx_awards_sort
  ON Awards(sort_order, name, id);

CREATE TABLE IF NOT EXISTS PlayerAwards (
  id TEXT NOT NULL PRIMARY KEY,
  award_id TEXT NOT NULL,
  season INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (award_id, season, player_name),
  FOREIGN KEY (award_id) REFERENCES Awards(id) ON DELETE CASCADE,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (TRIM(player_name) <> '')
);

CREATE INDEX IF NOT EXISTS idx_player_awards_season
  ON PlayerAwards(season DESC, award_id, player_name, id);

CREATE INDEX IF NOT EXISTS idx_player_awards_player
  ON PlayerAwards(player_name, season DESC, award_id, id);
