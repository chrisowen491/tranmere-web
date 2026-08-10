CREATE INDEX IF NOT EXISTS Apps_player_date_id_idx
  ON Apps (player_name, match_date DESC, id ASC);
