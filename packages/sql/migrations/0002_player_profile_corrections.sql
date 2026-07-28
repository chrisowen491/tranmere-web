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
