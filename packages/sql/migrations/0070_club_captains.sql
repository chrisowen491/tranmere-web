CREATE TABLE IF NOT EXISTS ClubCaptains (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (season, player_name),
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (TRIM(player_name) <> '')
);

CREATE INDEX IF NOT EXISTS idx_club_captains_season_sort
  ON ClubCaptains(season DESC, sort_order, player_name, id);

INSERT INTO ClubCaptains (
  id, season, player_name, notes, sort_order, created_at, updated_at
) VALUES (
  'captain-2026-will-vaulks', 2026, 'Will Vaulks', NULL, 0,
  '2026-09-09T00:00:00.000Z', '2026-09-09T00:00:00.000Z'
)
ON CONFLICT(season, player_name) DO NOTHING;
