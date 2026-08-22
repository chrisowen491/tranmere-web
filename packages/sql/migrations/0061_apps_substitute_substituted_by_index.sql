CREATE INDEX IF NOT EXISTS Apps_substitute_substituted_by_idx
  ON Apps (substitute_substituted_by, match_date DESC);
