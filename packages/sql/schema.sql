DROP TABLE IF EXISTS Ratings;

CREATE TABLE Ratings (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  page_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created TEXT NOT NULL,
  sub TEXT NOT NULL,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER int NOT NULL,
  comment  TEXT NULL
);

CREATE TABLE IF NOT EXISTS MatchAttendanceCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  current_attendance INTEGER,
  proposed_attendance INTEGER NOT NULL,
  source TEXT NOT NULL,
  explanation TEXT,
  submitted_by_sub TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS MatchAttendanceCorrections_status_idx
  ON MatchAttendanceCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS MatchAttendanceCorrections_match_idx
  ON MatchAttendanceCorrections (season, match_date, status, reviewed_at);

CREATE TABLE IF NOT EXISTS PlayerProfileCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  player_name TEXT NOT NULL,
  current_json TEXT NOT NULL,
  changes_json TEXT NOT NULL,
  source TEXT NOT NULL,
  explanation TEXT,
  submitted_by_sub TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS PlayerProfileCorrections_status_idx
  ON PlayerProfileCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS PlayerProfileCorrections_player_idx
  ON PlayerProfileCorrections (player_name, status, reviewed_at);

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

CREATE TABLE IF NOT EXISTS Managers (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  date_joined TEXT NOT NULL,
  date_left TEXT NOT NULL,
  programme_path TEXT
);

CREATE INDEX IF NOT EXISTS Managers_date_joined_idx
  ON Managers (date_joined);

CREATE INDEX IF NOT EXISTS Managers_name_idx
  ON Managers (name);
