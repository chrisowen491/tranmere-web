CREATE TABLE IF NOT EXISTS PlayerSeasonSummaries (
  season TEXT NOT NULL,
  player_name TEXT NOT NULL,
  appearances INTEGER NOT NULL,
  starts INTEGER NOT NULL,
  substitute_appearances INTEGER NOT NULL,
  goals INTEGER NOT NULL,
  assists INTEGER NOT NULL,
  yellow_cards INTEGER NOT NULL,
  red_cards INTEGER NOT NULL,
  free_kicks INTEGER NOT NULL,
  penalties INTEGER NOT NULL,
  headers INTEGER NOT NULL,
  PRIMARY KEY (season, player_name),
  CHECK (season = 'TOTAL' OR season GLOB '[0-9][0-9][0-9][0-9]'),
  CHECK (appearances >= 0),
  CHECK (starts >= 0),
  CHECK (substitute_appearances >= 0),
  CHECK (goals >= 0),
  CHECK (assists >= 0),
  CHECK (yellow_cards >= 0),
  CHECK (red_cards >= 0),
  CHECK (free_kicks >= 0),
  CHECK (penalties >= 0),
  CHECK (headers >= 0)
);

CREATE INDEX IF NOT EXISTS PlayerSeasonSummaries_player_idx
  ON PlayerSeasonSummaries (player_name, season DESC);

CREATE INDEX IF NOT EXISTS PlayerSeasonSummaries_season_apps_idx
  ON PlayerSeasonSummaries (season, appearances DESC, player_name ASC);
