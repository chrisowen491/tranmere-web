-- Historic homes for the 20 opposition clubs with the largest remaining
-- number of unknown away-match venues.
INSERT OR REPLACE INTO ClubVenues (club_name, venue, start_date, end_date) VALUES
  ('Accrington Stanley', 'Peel Park', '1893-01-01', '1966-12-31'),
  ('Accrington Stanley', 'Crown Ground', '1968-01-01', NULL),
  ('Bristol Rovers', 'Eastville Stadium', '1897-01-01', '1986-06-30'),
  ('Bristol Rovers', 'Twerton Park', '1986-07-01', '1996-06-30'),
  ('Bristol Rovers', 'Memorial Stadium', '1996-07-01', NULL),
  ('Cambridge United', 'Abbey Stadium', '1932-01-01', NULL),
  ('Chesterfield', 'Saltergate', '1872-01-01', '2010-06-30'),
  ('Chesterfield', 'SMH Group Stadium', '2010-07-01', NULL),
  ('Colchester United', 'Layer Road', '1937-01-01', '2008-07-31'),
  ('Colchester United', 'Colchester Community Stadium', '2008-08-01', NULL),
  ('Gillingham', 'Priestfield Stadium', '1893-01-01', NULL),
  ('Huddersfield Town', 'Leeds Road', '1908-01-01', '1994-01-01'),
  ('Huddersfield Town', 'John Smith''s Stadium', '1994-01-02', NULL),
  ('Leyton Orient', 'Brisbane Road', '1937-01-01', NULL),
  ('Luton Town', 'Kenilworth Road', '1905-01-01', NULL),
  ('Milton Keynes Dons', 'National Hockey Stadium', '2003-01-01', '2007-01-01'),
  ('Milton Keynes Dons', 'Stadium MK', '2007-01-02', NULL),
  ('Nelson', 'Seedhill', '1903-01-01', NULL),
  ('New Brighton', 'Sandheys Park', '1921-01-01', '1945-12-31'),
  ('New Brighton', 'Tower Athletic Ground', '1946-01-01', '1951-12-31'),
  ('Newport County', 'Somerton Park', '1912-01-01', '1989-12-31'),
  ('Newport County', 'Newport Stadium', '1994-01-01', '2012-06-30'),
  ('Newport County', 'Rodney Parade', '2012-07-01', NULL),
  ('Oxford United', 'Manor Ground', '1925-01-01', '2001-07-31'),
  ('Oxford United', 'Kassam Stadium', '2001-08-01', NULL),
  ('Port Vale', 'Old Recreation Ground', '1913-01-01', '1950-07-31'),
  ('Port Vale', 'Vale Park', '1950-08-01', NULL),
  ('Shrewsbury Town', 'Gay Meadow', '1910-01-01', '2007-06-30'),
  ('Shrewsbury Town', 'New Meadow', '2007-07-01', NULL),
  ('Stevenage', 'Broadhall Way', '1980-01-01', NULL),
  ('Swindon Town', 'County Ground', '1896-01-01', NULL),
  ('Wigan Borough', 'Springfield Park', '1897-01-01', '1932-12-31'),
  ('Workington', 'Borough Park', '1888-01-01', NULL);

UPDATE Games
SET venue = (
  SELECT ClubVenues.venue
  FROM ClubVenues
  WHERE ClubVenues.club_name = Games.home_team
    AND Games.match_date >= ClubVenues.start_date
    AND (ClubVenues.end_date IS NULL OR Games.match_date <= ClubVenues.end_date)
)
WHERE Games.away_team = 'Tranmere Rovers'
  AND lower(trim(COALESCE(Games.venue, ''))) IN ('', 'unknown')
  AND lower(trim(COALESCE(Games.neutral, ''))) NOT IN ('yes', 'true', '1')
  AND EXISTS (
    SELECT 1
    FROM ClubVenues
    WHERE ClubVenues.club_name = Games.home_team
      AND Games.match_date >= ClubVenues.start_date
      AND (ClubVenues.end_date IS NULL OR Games.match_date <= ClubVenues.end_date)
  );
