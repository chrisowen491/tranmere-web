CREATE INDEX IF NOT EXISTS Apps_match_date_player_id_idx
  ON Apps (match_date DESC, player_name ASC, id ASC);
