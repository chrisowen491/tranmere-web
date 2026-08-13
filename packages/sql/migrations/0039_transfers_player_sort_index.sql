CREATE INDEX IF NOT EXISTS Transfers_player_sort_idx
  ON Transfers (
    player_name,
    season DESC,
    transfer_date DESC,
    cost DESC
  );
