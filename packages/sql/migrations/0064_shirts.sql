CREATE TABLE IF NOT EXISTS Shirts (
  id TEXT NOT NULL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price TEXT,
  manufacturer TEXT,
  description_json TEXT,
  usage TEXT NOT NULL,
  color TEXT NOT NULL,
  decade TEXT NOT NULL,
  avatar_image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (description_json IS NULL OR json_valid(description_json))
);

CREATE INDEX IF NOT EXISTS Shirts_decade_usage_name_idx
  ON Shirts(decade, usage, name);

CREATE TABLE IF NOT EXISTS ShirtImages (
  id TEXT NOT NULL PRIMARY KEY,
  shirt_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (shirt_id, url),
  UNIQUE (shirt_id, sort_order),
  FOREIGN KEY (shirt_id) REFERENCES Shirts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ShirtImages_shirt_order_idx
  ON ShirtImages(shirt_id, sort_order);

CREATE TABLE IF NOT EXISTS ShirtSeasons (
  shirt_id TEXT NOT NULL,
  season TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (shirt_id, season),
  UNIQUE (shirt_id, sort_order),
  FOREIGN KEY (shirt_id) REFERENCES Shirts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ShirtSeasons_season_shirt_idx
  ON ShirtSeasons(season, shirt_id);

CREATE TABLE IF NOT EXISTS ShirtVariants (
  shirt_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (shirt_id, variant),
  UNIQUE (shirt_id, sort_order),
  FOREIGN KEY (shirt_id) REFERENCES Shirts(id) ON DELETE CASCADE
);
