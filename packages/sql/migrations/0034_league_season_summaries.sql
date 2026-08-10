CREATE TABLE IF NOT EXISTS LeagueSeasonSummaries (
  season INTEGER NOT NULL PRIMARY KEY,
  final_league_position INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  draws INTEGER NOT NULL,
  losses INTEGER NOT NULL,
  goals_for INTEGER NOT NULL,
  goals_against INTEGER NOT NULL,
  points INTEGER NOT NULL,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (final_league_position > 0),
  CHECK (wins >= 0),
  CHECK (draws >= 0),
  CHECK (losses >= 0),
  CHECK (goals_for >= 0),
  CHECK (goals_against >= 0),
  CHECK (points >= 0)
);
