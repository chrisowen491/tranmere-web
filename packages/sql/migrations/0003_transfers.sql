CREATE TABLE IF NOT EXISTS Transfers (
  id TEXT NOT NULL PRIMARY KEY,
  player_name TEXT NOT NULL,
  season INTEGER NOT NULL,
  from_club TEXT NOT NULL,
  to_club TEXT NOT NULL,
  fee_description TEXT NOT NULL,
  cost INTEGER NOT NULL DEFAULT 0,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (cost >= 0)
);

CREATE INDEX IF NOT EXISTS Transfers_player_idx
  ON Transfers (player_name, season);

CREATE INDEX IF NOT EXISTS Transfers_season_idx
  ON Transfers (season);

CREATE INDEX IF NOT EXISTS Transfers_from_club_idx
  ON Transfers (from_club, season);

CREATE INDEX IF NOT EXISTS Transfers_to_club_idx
  ON Transfers (to_club, season);
