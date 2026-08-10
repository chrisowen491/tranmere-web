CREATE INDEX IF NOT EXISTS Goals_opposition_date_scorer_id_idx
  ON Goals (opposition, match_date DESC, scorer ASC, id ASC);
