CREATE TABLE IF NOT EXISTS GoalSubmissions (
  id TEXT NOT NULL PRIMARY KEY,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  opposition TEXT NOT NULL,
  competition TEXT,
  goal_json TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS GoalSubmissions_status_idx
  ON GoalSubmissions (status, submitted_at);

CREATE INDEX IF NOT EXISTS GoalSubmissions_submitter_idx
  ON GoalSubmissions (submitted_by_sub, submitted_at DESC);
