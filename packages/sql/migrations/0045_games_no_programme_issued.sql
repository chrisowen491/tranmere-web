ALTER TABLE Games
ADD COLUMN no_programme_issued INTEGER NOT NULL DEFAULT 0
CHECK (no_programme_issued IN (0, 1));
