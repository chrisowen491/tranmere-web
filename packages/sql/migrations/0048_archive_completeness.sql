CREATE TABLE IF NOT EXISTS ArchiveCompleteness (
  season INTEGER NOT NULL,
  category TEXT NOT NULL,
  complete_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (season, category),
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    category IN (
      'lineups',
      'goals',
      'goal-details',
      'attendances',
      'formations',
      'programmes',
      'player-profiles',
      'kits',
      'match-reports'
    )
  ),
  CHECK (complete_count >= 0),
  CHECK (total_count >= 0),
  CHECK (complete_count <= total_count)
);

CREATE INDEX IF NOT EXISTS ArchiveCompleteness_category_season_idx
  ON ArchiveCompleteness (category, season DESC);
