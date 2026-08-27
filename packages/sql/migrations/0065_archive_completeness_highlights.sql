CREATE TABLE ArchiveCompleteness_new (
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
      'match-reports',
      'highlights'
    )
  ),
  CHECK (complete_count >= 0),
  CHECK (total_count >= 0),
  CHECK (complete_count <= total_count)
);

INSERT INTO ArchiveCompleteness_new (
  season, category, complete_count, total_count, updated_at
)
SELECT season, category, complete_count, total_count, updated_at
FROM ArchiveCompleteness;

DROP TABLE ArchiveCompleteness;
ALTER TABLE ArchiveCompleteness_new RENAME TO ArchiveCompleteness;

CREATE INDEX IF NOT EXISTS ArchiveCompleteness_category_season_idx
  ON ArchiveCompleteness (category, season DESC);

CREATE INDEX IF NOT EXISTS ArchiveCompleteness_season_category_idx
  ON ArchiveCompleteness (season DESC, category ASC);
