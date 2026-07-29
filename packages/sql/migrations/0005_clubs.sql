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
