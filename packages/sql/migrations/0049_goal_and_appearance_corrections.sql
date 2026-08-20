CREATE TABLE IF NOT EXISTS GoalCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  goal_id TEXT NOT NULL,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  opposition TEXT NOT NULL,
  current_json TEXT NOT NULL,
  changes_json TEXT NOT NULL,
  source TEXT,
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

CREATE INDEX IF NOT EXISTS GoalCorrections_status_idx
  ON GoalCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS GoalCorrections_goal_idx
  ON GoalCorrections (goal_id, status);

CREATE TABLE IF NOT EXISTS AppearanceCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  appearance_id TEXT NOT NULL,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  opposition TEXT NOT NULL,
  current_json TEXT NOT NULL,
  changes_json TEXT NOT NULL,
  source TEXT,
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

CREATE INDEX IF NOT EXISTS AppearanceCorrections_status_idx
  ON AppearanceCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS AppearanceCorrections_appearance_idx
  ON AppearanceCorrections (appearance_id, status);
