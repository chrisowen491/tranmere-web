CREATE TABLE IF NOT EXISTS ClubAliases (
  alias TEXT NOT NULL PRIMARY KEY,
  canonical_name TEXT NOT NULL
);

INSERT OR REPLACE INTO ClubAliases (alias, canonical_name) VALUES
  ('Bradford', 'Bradford City'),
  ('Bristol R', 'Bristol Rovers'),
  ('Carlisle', 'Carlisle United'),
  ('Colchester', 'Colchester United'),
  ('Crawley', 'Crawley Town'),
  ('Forest Green', 'Forest Green Rovers'),
  ('Newport Co', 'Newport County'),
  ('Northampton', 'Northampton Town'),
  ('Oldham', 'Oldham Athletic'),
  ('Oxford', 'Oxford United'),
  ('Scunthorpe', 'Scunthorpe United'),
  ('Southend', 'Southend United'),
  ('Stevege Borough', 'Stevenage');

UPDATE Clubs
SET name = 'Stevenage'
WHERE name = 'Stevege Borough';

UPDATE Games
SET home_team = COALESCE((
  SELECT canonical_name FROM ClubAliases WHERE alias = Games.home_team
), home_team),
away_team = COALESCE((
  SELECT canonical_name FROM ClubAliases WHERE alias = Games.away_team
), away_team),
opposition = COALESCE((
  SELECT canonical_name FROM ClubAliases WHERE alias = Games.opposition
), opposition);

UPDATE Apps
SET opposition = COALESCE((
  SELECT canonical_name FROM ClubAliases WHERE alias = Apps.opposition
), opposition);

UPDATE Goals
SET opposition = COALESCE((
  SELECT canonical_name FROM ClubAliases WHERE alias = Goals.opposition
), opposition);

UPDATE HatTricks
SET opposition = COALESCE((
  SELECT canonical_name FROM ClubAliases WHERE alias = HatTricks.opposition
), opposition);

UPDATE Transfers
SET from_club = COALESCE((
  SELECT canonical_name FROM ClubAliases WHERE alias = Transfers.from_club
), from_club),
to_club = COALESCE((
  SELECT canonical_name FROM ClubAliases WHERE alias = Transfers.to_club
), to_club);
