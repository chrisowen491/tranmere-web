CREATE TABLE IF NOT EXISTS Games (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  competition TEXT NOT NULL,
  round TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  opposition TEXT NOT NULL,
  venue TEXT NOT NULL,
  attendance INTEGER,
  full_time_score TEXT NOT NULL,
  home_goals TEXT,
  away_goals TEXT,
  division TEXT,
  tier TEXT,
  leg TEXT,
  tie TEXT,
  neutral TEXT,
  after_extra_time TEXT,
  penalties TEXT,
  programme_path TEXT,
  formation TEXT,
  referee TEXT,
  ticket TEXT,
  CHECK (season BETWEEN 1800 AND 2200)
);

CREATE INDEX IF NOT EXISTS Games_season_date_idx
  ON Games (season, match_date);

CREATE INDEX IF NOT EXISTS Games_opposition_date_idx
  ON Games (opposition, match_date);

CREATE INDEX IF NOT EXISTS Games_competition_date_idx
  ON Games (competition, match_date);

CREATE INDEX IF NOT EXISTS Games_home_team_date_idx
  ON Games (home_team, match_date);
