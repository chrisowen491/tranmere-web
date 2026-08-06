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
