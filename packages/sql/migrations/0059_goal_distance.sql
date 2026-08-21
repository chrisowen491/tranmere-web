CREATE TABLE Goals_new (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  scorer TEXT NOT NULL,
  opposition TEXT NOT NULL,
  competition TEXT,
  minute TEXT,
  goal_type TEXT,
  assist TEXT,
  assist_type TEXT,
  foot TEXT,
  distance TEXT,
  cross_side TEXT,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  CHECK (distance IS NULL OR distance IN ('6YardBox', '18YardBox', 'LongRange'))
);

INSERT INTO Goals_new (
  id, season, match_date, scorer, opposition, competition, minute, goal_type,
  assist, assist_type, foot, distance, cross_side
)
SELECT
  id, season, match_date, scorer, opposition, competition, minute, goal_type,
  assist, assist_type, foot,
  CASE
    WHEN long_range = 1 THEN 'LongRange'
    WHEN eighteen_yard_box = 1 THEN '18YardBox'
    WHEN six_yard_box = 1 THEN '6YardBox'
    ELSE NULL
  END,
  cross_side
FROM Goals;

DROP TABLE Goals;
ALTER TABLE Goals_new RENAME TO Goals;

CREATE INDEX Goals_scorer_date_idx ON Goals (scorer, match_date DESC);
CREATE INDEX Goals_season_scorer_idx ON Goals (season, scorer, match_date);
CREATE INDEX Goals_match_idx ON Goals (season, match_date, scorer);
CREATE INDEX Goals_opposition_date_scorer_id_idx
  ON Goals (opposition, match_date DESC, scorer ASC, id ASC);
