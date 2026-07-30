CREATE TABLE IF NOT EXISTS Players (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  date_of_birth TEXT,
  biography_markdown TEXT,
  pic_link TEXT,
  foot TEXT,
  height TEXT,
  place_of_birth TEXT,
  position TEXT,
  links_json TEXT NOT NULL DEFAULT '[]',
  CHECK (
    date_of_birth IS NULL
    OR date_of_birth GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (foot IS NULL OR foot IN ('Left', 'Right')),
  CHECK (
    position IS NULL
    OR position IN (
      'Goalkeeper',
      'Striker',
      'Winger',
      'Central Defender',
      'Central Midfielder',
      'Full Back'
    )
  ),
  CHECK (json_valid(links_json))
);

CREATE INDEX IF NOT EXISTS Players_name_idx
  ON Players (name);

CREATE INDEX IF NOT EXISTS Players_position_idx
  ON Players (position, name);
