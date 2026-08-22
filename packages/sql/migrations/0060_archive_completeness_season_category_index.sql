CREATE INDEX IF NOT EXISTS ArchiveCompleteness_season_category_idx
  ON ArchiveCompleteness (season DESC, category ASC);
