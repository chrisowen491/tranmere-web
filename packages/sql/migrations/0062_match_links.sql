CREATE TABLE IF NOT EXISTS MatchLinks (
  id TEXT PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'other',
  publisher TEXT,
  published_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (season, match_date, url)
);

CREATE INDEX IF NOT EXISTS idx_match_links_match_sort
  ON MatchLinks(season, match_date, sort_order, label, id);

CREATE TABLE IF NOT EXISTS MatchLinkSuggestions (
  id TEXT PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'other',
  publisher TEXT,
  published_at TEXT,
  notes TEXT,
  submitted_by_account_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_match_link_suggestions_status_submitted
  ON MatchLinkSuggestions(status, submitted_at);
