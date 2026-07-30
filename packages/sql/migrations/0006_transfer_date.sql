ALTER TABLE Transfers
  ADD COLUMN transfer_date TEXT
  CHECK (
    transfer_date IS NULL
    OR transfer_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  );

CREATE INDEX IF NOT EXISTS Transfers_date_idx
  ON Transfers (transfer_date);
