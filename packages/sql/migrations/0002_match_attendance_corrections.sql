DROP TABLE IF EXISTS MatchAttendanceCorrections;

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
