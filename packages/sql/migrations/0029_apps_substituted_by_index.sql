CREATE INDEX IF NOT EXISTS Apps_substituted_by_idx
  ON Apps (substituted_by, match_date DESC);
