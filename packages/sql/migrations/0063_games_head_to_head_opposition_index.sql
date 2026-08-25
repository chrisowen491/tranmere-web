CREATE INDEX IF NOT EXISTS Games_head_to_head_opposition_idx
  ON Games(opposition COLLATE NOCASE)
  WHERE LOWER(TRIM(competition)) <> 'friendly';
