DROP TRIGGER IF EXISTS SearchDocuments_ai;
DROP TRIGGER IF EXISTS SearchDocuments_ad;
DROP TRIGGER IF EXISTS SearchDocuments_au;

ALTER TABLE SearchDocuments RENAME TO SearchDocuments_old;

CREATE TABLE SearchDocuments (
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
  CHECK (entity_type IN ('player', 'club', 'season', 'blog', 'page'))
);

INSERT INTO SearchDocuments (
  row_id, object_id, entity_type, entity_id, title, normalized_title, aliases,
  description, href, image_url, ranking_weight, sync_token, updated_at
)
SELECT
  row_id, object_id, entity_type, entity_id, title, normalized_title, aliases,
  description, href, image_url, ranking_weight, sync_token, updated_at
FROM SearchDocuments_old;

DROP TABLE SearchDocuments_old;

CREATE INDEX SearchDocuments_type_idx
  ON SearchDocuments (entity_type, title);

CREATE INDEX SearchDocuments_normalized_title_idx
  ON SearchDocuments (normalized_title, ranking_weight DESC);

CREATE INDEX SearchDocuments_sync_token_idx
  ON SearchDocuments (sync_token);

CREATE TRIGGER SearchDocuments_ai
AFTER INSERT ON SearchDocuments BEGIN
  INSERT INTO SearchDocumentsFts (object_id, title, aliases, description)
  VALUES (new.object_id, new.title, new.aliases, new.description);
END;

CREATE TRIGGER SearchDocuments_ad
AFTER DELETE ON SearchDocuments BEGIN
  DELETE FROM SearchDocumentsFts WHERE object_id = old.object_id;
END;

CREATE TRIGGER SearchDocuments_au
AFTER UPDATE ON SearchDocuments BEGIN
  DELETE FROM SearchDocumentsFts WHERE object_id = old.object_id;
  INSERT INTO SearchDocumentsFts (object_id, title, aliases, description)
  VALUES (new.object_id, new.title, new.aliases, new.description);
END;

DELETE FROM SearchDocumentsFts;

INSERT INTO SearchDocumentsFts (object_id, title, aliases, description)
SELECT object_id, title, aliases, description
FROM SearchDocuments;
