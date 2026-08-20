CREATE TABLE IF NOT EXISTS MatchFormationCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  current_formation TEXT,
  proposed_formation TEXT NOT NULL,
  explanation TEXT,
  submitted_by_sub TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS MatchFormationCorrections_status_idx
  ON MatchFormationCorrections (status, submitted_at);

CREATE TABLE IF NOT EXISTS MatchKitCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  current_kit TEXT,
  proposed_kit TEXT NOT NULL,
  explanation TEXT,
  submitted_by_sub TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS MatchKitCorrections_status_idx
  ON MatchKitCorrections (status, submitted_at);

ALTER TABLE UserProfiles
  ADD COLUMN correction_recognition_visible INTEGER NOT NULL DEFAULT 0
    CHECK (correction_recognition_visible IN (0, 1));

CREATE INDEX IF NOT EXISTS MatchAttendanceCorrections_submitter_idx
  ON MatchAttendanceCorrections (submitted_by_sub, submitted_at DESC);

CREATE INDEX IF NOT EXISTS PlayerProfileCorrections_submitter_idx
  ON PlayerProfileCorrections (submitted_by_sub, submitted_at DESC);

CREATE INDEX IF NOT EXISTS GoalCorrections_submitter_idx
  ON GoalCorrections (submitted_by_sub, submitted_at DESC);

CREATE INDEX IF NOT EXISTS AppearanceCorrections_submitter_idx
  ON AppearanceCorrections (submitted_by_sub, submitted_at DESC);

CREATE INDEX IF NOT EXISTS MatchFormationCorrections_submitter_idx
  ON MatchFormationCorrections (submitted_by_sub, submitted_at DESC);

CREATE INDEX IF NOT EXISTS MatchKitCorrections_submitter_idx
  ON MatchKitCorrections (submitted_by_sub, submitted_at DESC);
