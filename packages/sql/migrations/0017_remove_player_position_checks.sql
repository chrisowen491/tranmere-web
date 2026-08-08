-- Position labels are managed by the shared application constant rather than
-- a database check, so historic or more specialised roles can be added without
-- rebuilding this schema again.
CREATE TABLE Players_new (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  date_of_birth TEXT,
  biography_markdown TEXT,
  pic_link TEXT,
  foot TEXT,
  height TEXT,
  place_of_birth TEXT,
  position TEXT,
  secondary_position TEXT,
  links_json TEXT NOT NULL DEFAULT '[]',
  CHECK (
    date_of_birth IS NULL
    OR date_of_birth GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (foot IS NULL OR foot IN ('Left', 'Right')),
  CHECK (json_valid(links_json))
);

INSERT INTO Players_new (
  id, name, date_of_birth, biography_markdown, pic_link, foot, height,
  place_of_birth, position, secondary_position, links_json
)
SELECT
  id, name, date_of_birth, biography_markdown, pic_link, foot, height,
  place_of_birth, position, secondary_position, links_json
FROM Players;

DROP TABLE Players;
ALTER TABLE Players_new RENAME TO Players;

CREATE INDEX IF NOT EXISTS Players_name_idx ON Players (name);
CREATE INDEX IF NOT EXISTS Players_position_idx ON Players (position, name);
