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
  transfer_date TEXT,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (cost >= 0),
  CHECK (
    transfer_date IS NULL
    OR transfer_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  )
);

CREATE INDEX IF NOT EXISTS Transfers_player_idx
  ON Transfers (player_name, season);

CREATE INDEX IF NOT EXISTS Transfers_season_idx
  ON Transfers (season);

CREATE INDEX IF NOT EXISTS Transfers_from_club_idx
  ON Transfers (from_club, season);

CREATE INDEX IF NOT EXISTS Transfers_to_club_idx
  ON Transfers (to_club, season);

CREATE INDEX IF NOT EXISTS Transfers_date_idx
  ON Transfers (transfer_date);

CREATE TABLE IF NOT EXISTS Managers (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  date_joined TEXT NOT NULL,
  date_left TEXT NOT NULL,
  image_path TEXT,
  favourite_formation TEXT
);

CREATE INDEX IF NOT EXISTS Managers_date_joined_idx
  ON Managers (date_joined);

CREATE INDEX IF NOT EXISTS Managers_name_idx
  ON Managers (name);

CREATE TABLE IF NOT EXISTS Clubs (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  three_letter_name TEXT,
  nicknames TEXT,
  primary_colour TEXT,
  secondary_colour TEXT,
  highest_division INTEGER,
  latitude REAL,
  longitude REAL,
  CHECK (highest_division IS NULL OR highest_division BETWEEN 1 AND 20)
);

CREATE UNIQUE INDEX IF NOT EXISTS Clubs_name_idx
  ON Clubs (name);

CREATE INDEX IF NOT EXISTS Clubs_short_name_idx
  ON Clubs (short_name);

CREATE TABLE IF NOT EXISTS Players (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  date_of_birth TEXT,
  biography_markdown TEXT,
  pic_link TEXT,
  foot TEXT,
  height TEXT,
  place_of_birth TEXT,
  position TEXT,
  secondary_position TEXT,
  links_json TEXT NOT NULL DEFAULT '[]',
  CHECK (
    date_of_birth IS NULL
    OR date_of_birth GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (foot IS NULL OR foot IN ('Left', 'Right')),
  CHECK (
    position IS NULL
    OR position IN (
      'Goalkeeper',
      'Striker',
      'Winger',
      'Central Defender',
      'Central Midfielder',
      'Full Back'
    )
  ),
  CHECK (
    secondary_position IS NULL
    OR secondary_position IN (
      'Goalkeeper',
      'Striker',
      'Winger',
      'Central Defender',
      'Central Midfielder',
      'Full Back'
    )
  ),
  CHECK (json_valid(links_json))
);

CREATE INDEX IF NOT EXISTS Players_name_idx
  ON Players (name);

CREATE INDEX IF NOT EXISTS Players_position_idx
  ON Players (position, name);

CREATE TABLE IF NOT EXISTS Programmes (
  url TEXT NOT NULL PRIMARY KEY,
  match_name TEXT NOT NULL,
  match_date TEXT NOT NULL,
  pages INTEGER NOT NULL,
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (pages > 0)
);

CREATE INDEX IF NOT EXISTS Programmes_match_date_idx
  ON Programmes (match_date DESC);

CREATE TABLE IF NOT EXISTS Games (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  competition TEXT NOT NULL,
  round TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  opposition TEXT NOT NULL,
  venue TEXT NOT NULL,
  attendance INTEGER,
  full_time_score TEXT NOT NULL,
  home_goals TEXT,
  away_goals TEXT,
  division TEXT,
  tier TEXT,
  leg TEXT,
  tie TEXT,
  neutral TEXT,
  after_extra_time TEXT,
  penalties TEXT,
  programme_path TEXT,
  formation TEXT,
  kit TEXT,
  referee TEXT,
  ticket TEXT,
  CHECK (season BETWEEN 1800 AND 2200)
);

CREATE INDEX IF NOT EXISTS Games_season_date_idx
  ON Games (season, match_date);

CREATE INDEX IF NOT EXISTS Games_opposition_date_idx
  ON Games (opposition, match_date);

CREATE INDEX IF NOT EXISTS Games_competition_date_idx
  ON Games (competition, match_date);

CREATE INDEX IF NOT EXISTS Games_home_team_date_idx
  ON Games (home_team, match_date);

CREATE TABLE IF NOT EXISTS MatchReports (
  match_date TEXT NOT NULL PRIMARY KEY,
  report TEXT NOT NULL
);
