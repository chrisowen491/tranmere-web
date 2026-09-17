CREATE TABLE IF NOT EXISTS SeasonNewsSnippets (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  news_date TEXT NOT NULL,
  placement TEXT NOT NULL DEFAULT 'timeline',
  title TEXT,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (news_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  CHECK (placement IN ('pre-season', 'timeline')),
  CHECK (TRIM(body) <> '')
);

CREATE INDEX IF NOT EXISTS SeasonNewsSnippets_season_date_idx
  ON SeasonNewsSnippets (season, placement, news_date, id);

CREATE TABLE IF NOT EXISTS SeasonNewsSnippetTags (
  snippet_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (snippet_id, tag),
  FOREIGN KEY (snippet_id) REFERENCES SeasonNewsSnippets(id) ON DELETE CASCADE,
  CHECK (TRIM(tag) <> '')
);

CREATE INDEX IF NOT EXISTS SeasonNewsSnippetTags_tag_idx
  ON SeasonNewsSnippetTags (tag COLLATE NOCASE, snippet_id);
