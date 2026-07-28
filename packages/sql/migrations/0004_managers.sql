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
