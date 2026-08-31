CREATE INDEX IF NOT EXISTS Games_kit_date_idx
  ON Games (kit, match_date DESC);
