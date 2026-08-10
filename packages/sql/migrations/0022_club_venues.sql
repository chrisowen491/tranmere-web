-- Date-ranged home venues let historic away fixtures be populated without
-- applying a club's current ground to matches played before it moved.
CREATE TABLE IF NOT EXISTS ClubVenues (
  club_name TEXT NOT NULL,
  venue TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  PRIMARY KEY (club_name, start_date),
  CHECK (start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  CHECK (
    end_date IS NULL
    OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS ClubVenues_club_dates_idx
  ON ClubVenues (club_name, start_date, end_date);

-- Initial high-confidence grounds. More periods can be added as historic
-- research confirms them; existing rows are never overwritten by the update.
INSERT OR IGNORE INTO ClubVenues (club_name, venue, start_date, end_date) VALUES
  ('AFC Bournemouth', 'Dean Court', '1910-01-01', NULL),
  ('Barrow', 'Holker Street', '1909-01-01', NULL),
  ('Barnsley', 'Oakwell', '1888-01-01', NULL),
  ('Bradford City', 'Valley Parade', '1903-01-01', NULL),
  ('Bradford Park Avenue', 'Park Avenue', '1907-01-01', '1970-12-31'),
  ('Bristol City', 'Ashton Gate', '1904-01-01', NULL),
  ('Bury', 'Gigg Lane', '1885-01-01', '2019-08-27'),
  ('Carlisle United', 'Brunton Park', '1909-01-01', NULL),
  ('Crewe Alexandra', 'Gresty Road', '1906-01-01', NULL),
  ('Doncaster Rovers', 'Belle Vue', '1922-01-01', '2006-12-31'),
  ('Doncaster Rovers', 'Keepmoat Stadium', '2007-01-01', '2021-11-30'),
  ('Doncaster Rovers', 'Eco-Power Stadium', '2021-12-01', NULL),
  ('Exeter City', 'St James Park', '1904-01-01', NULL),
  ('Grimsby Town', 'Blundell Park', '1899-01-01', NULL),
  ('Halifax Town', 'The Shay', '1921-01-01', NULL),
  ('Hartlepool United', 'Victoria Park', '1886-01-01', NULL),
  ('Lincoln City', 'Sincil Bank', '1895-01-01', NULL),
  ('Mansfield Town', 'Field Mill', '1861-01-01', NULL),
  ('Northampton Town', 'Sixfields Stadium', '1994-01-01', NULL),
  ('Northampton Town', 'County Ground', '1897-01-01', '1993-12-31'),
  ('Notts County', 'Meadow Lane', '1910-01-01', NULL),
  ('Oldham Athletic', 'Boundary Park', '1896-01-01', NULL),
  ('Peterborough United', 'London Road', '1913-01-01', NULL),
  ('Plymouth Argyle', 'Home Park', '1901-01-01', NULL),
  ('Portsmouth', 'Fratton Park', '1898-01-01', NULL),
  ('Preston North End', 'Deepdale', '1878-01-01', NULL),
  ('Rochdale', 'Spotland', '1920-01-01', NULL),
  ('Rotherham United', 'Millmoor', '1907-01-01', '2008-12-31'),
  ('Rotherham United', 'New York Stadium', '2012-01-01', NULL),
  ('Scunthorpe United', 'Old Show Ground', '1899-01-01', '1988-12-31'),
  ('Scunthorpe United', 'Glanford Park', '1989-01-01', NULL),
  ('Southend United', 'Roots Hall', '1955-01-01', NULL),
  ('Southport', 'Haig Avenue', '1905-01-01', NULL),
  ('Stockport County', 'Edgeley Park', '1902-01-01', NULL),
  ('Torquay United', 'Plainmoor', '1921-01-01', NULL),
  ('Walsall', 'Fellows Park', '1896-01-01', '1990-08-01'),
  ('Walsall', 'Bescot Stadium', '1990-08-02', NULL),
  ('Wrexham', 'Racecourse Ground', '1807-01-01', NULL),
  ('York City', 'Fulfordgate', '1922-01-01', '1932-12-31'),
  ('York City', 'Bootham Crescent', '1932-01-01', '2021-12-31'),
  ('York City', 'LNER Community Stadium', '2022-01-01', NULL);

UPDATE Games
SET venue = (
  SELECT club_venue.venue
  FROM ClubVenues AS club_venue
  WHERE club_venue.club_name = Games.home_team
    AND Games.match_date >= club_venue.start_date
    AND (club_venue.end_date IS NULL OR Games.match_date <= club_venue.end_date)
  ORDER BY club_venue.start_date DESC
  LIMIT 1
)
WHERE away_team = 'Tranmere Rovers'
  AND lower(trim(venue)) IN ('unknown', '')
  AND COALESCE(lower(trim(neutral)), '') NOT IN ('yes', 'true', '1')
  AND EXISTS (
    SELECT 1
    FROM ClubVenues AS club_venue
    WHERE club_venue.club_name = Games.home_team
      AND Games.match_date >= club_venue.start_date
      AND (club_venue.end_date IS NULL OR Games.match_date <= club_venue.end_date)
  );
