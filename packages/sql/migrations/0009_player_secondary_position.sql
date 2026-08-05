ALTER TABLE Players ADD COLUMN secondary_position TEXT
  CHECK (
    secondary_position IS NULL
    OR secondary_position IN (
      'Goalkeeper',
      'Striker',
      'Winger',
      'Central Defender',
      'Central Midfielder',
      'Full Back'
    )
  );
