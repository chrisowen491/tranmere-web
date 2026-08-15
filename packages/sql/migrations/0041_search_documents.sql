CREATE TABLE IF NOT EXISTS SearchDocuments (
  row_id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  aliases TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  href TEXT NOT NULL,
  image_url TEXT,
  ranking_weight INTEGER NOT NULL DEFAULT 0,
  sync_token TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (entity_type IN ('player', 'club', 'season'))
);

CREATE INDEX IF NOT EXISTS SearchDocuments_type_idx
  ON SearchDocuments (entity_type, title);

CREATE INDEX IF NOT EXISTS SearchDocuments_normalized_title_idx
  ON SearchDocuments (normalized_title, ranking_weight DESC);

CREATE INDEX IF NOT EXISTS SearchDocuments_sync_token_idx
  ON SearchDocuments (sync_token);

CREATE VIRTUAL TABLE IF NOT EXISTS SearchDocumentsFts USING fts5(
  object_id UNINDEXED,
  title,
  aliases,
  description,
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS SearchDocuments_ai
AFTER INSERT ON SearchDocuments BEGIN
  INSERT INTO SearchDocumentsFts (object_id, title, aliases, description)
  VALUES (new.object_id, new.title, new.aliases, new.description);
END;

CREATE TRIGGER IF NOT EXISTS SearchDocuments_ad
AFTER DELETE ON SearchDocuments BEGIN
  DELETE FROM SearchDocumentsFts WHERE object_id = old.object_id;
END;

CREATE TRIGGER IF NOT EXISTS SearchDocuments_au
AFTER UPDATE ON SearchDocuments BEGIN
  DELETE FROM SearchDocumentsFts WHERE object_id = old.object_id;
  INSERT INTO SearchDocumentsFts (object_id, title, aliases, description)
  VALUES (new.object_id, new.title, new.aliases, new.description);
END;

INSERT OR IGNORE INTO SearchDocuments (
  object_id, entity_type, entity_id, title, normalized_title, aliases,
  description, href, image_url, ranking_weight, sync_token
)
SELECT
  'player:' || id,
  'player',
  id,
  name,
  lower(replace(name, '-', ' ')),
  '',
  'Player Profile',
  '/page/player/' || replace(name, ' ', '%20'),
  coalesce(pic_link, '/assets/images/square_v1.png'),
  30,
  'migration'
FROM Players;

INSERT OR IGNORE INTO SearchDocuments (
  object_id, entity_type, entity_id, title, normalized_title, aliases,
  description, href, image_url, ranking_weight, sync_token
)
SELECT
  'club:' || id,
  'club',
  id,
  name,
  lower(replace(name, '-', ' ')),
  trim(coalesce(short_name, '') || ' ' || coalesce(three_letter_name, '') || ' ' || coalesce(nicknames, '')),
  'Club Overview',
  '/opponents/' || replace(name, ' ', '%20'),
  '/assets/images/square_v1.png',
  20,
  'migration'
FROM Clubs;

INSERT OR IGNORE INTO SearchDocuments (
  object_id, entity_type, entity_id, title, normalized_title, aliases,
  description, href, image_url, ranking_weight, sync_token
)
SELECT
  'season:' || season,
  'season',
  cast(season AS TEXT),
  cast(season AS TEXT) || '-' || substr(cast(season + 1 AS TEXT), 3, 2) || ' Season',
  cast(season AS TEXT) || ' ' || substr(cast(season + 1 AS TEXT), 3, 2) || ' season',
  cast(season AS TEXT) || '/' || substr(cast(season + 1 AS TEXT), 3, 2),
  'Season Overview',
  '/season/' || season,
  '/assets/images/square_v1.png',
  10,
  'migration'
FROM (SELECT DISTINCT season FROM Games);
