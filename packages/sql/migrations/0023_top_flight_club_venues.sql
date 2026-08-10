-- Additional historic venues for clubs that have featured in the Premier
-- League or Championship. Periods intentionally retain the contemporary
-- stadium name shown to supporters at the time of the match.
INSERT OR IGNORE INTO ClubVenues (club_name, venue, start_date, end_date) VALUES
  ('Birmingham City', 'St Andrew''s', '1906-01-01', NULL),
  ('Blackburn Rovers', 'Ewood Park', '1890-01-01', NULL),
  ('Blackpool', 'Bloomfield Road', '1901-01-01', NULL),
  ('Bolton Wanderers', 'Burnden Park', '1895-01-01', '1997-12-31'),
  ('Bolton Wanderers', 'Reebok Stadium', '1998-01-01', '2014-06-30'),
  ('Bolton Wanderers', 'Macron Stadium', '2014-07-01', '2018-07-31'),
  ('Bolton Wanderers', 'University of Bolton Stadium', '2018-08-01', NULL),
  ('Brentford', 'Griffin Park', '1904-01-01', '2020-07-31'),
  ('Brentford', 'Brentford Community Stadium', '2020-08-01', NULL),
  ('Brighton & Hove Albion', 'Goldstone Ground', '1902-01-01', '1997-05-31'),
  ('Brighton & Hove Albion', 'Withdean Stadium', '1999-01-01', '2011-07-31'),
  ('Brighton & Hove Albion', 'Amex Stadium', '2011-08-01', NULL),
  ('Burnley', 'Turf Moor', '1883-01-01', NULL),
  ('Cardiff City', 'Ninian Park', '1910-01-01', '2009-05-31'),
  ('Cardiff City', 'Cardiff City Stadium', '2009-06-01', NULL),
  ('Charlton Athletic', 'The Valley', '1919-01-01', '1985-01-01'),
  ('Charlton Athletic', 'Selhurst Park', '1985-01-02', '1991-05-31'),
  ('Charlton Athletic', 'The Valley', '1992-01-01', NULL),
  ('Coventry City', 'Highfield Road', '1899-01-01', '2005-05-31'),
  ('Coventry City', 'Ricoh Arena', '2005-06-01', '2013-06-30'),
  ('Coventry City', 'Sixfields Stadium', '2013-07-01', '2014-08-31'),
  ('Coventry City', 'Ricoh Arena', '2014-09-01', '2019-08-31'),
  ('Coventry City', 'St Andrew''s', '2019-09-01', '2021-05-31'),
  ('Crystal Palace', 'Selhurst Park', '1924-01-01', NULL),
  ('Derby County', 'Baseball Ground', '1890-01-01', '1997-06-30'),
  ('Derby County', 'Pride Park Stadium', '1997-07-01', NULL),
  ('Fulham', 'Craven Cottage', '1896-01-01', NULL),
  ('Hull City', 'Anlaby Road', '1906-01-01', '1946-08-31'),
  ('Hull City', 'Boothferry Park', '1946-09-01', '2002-12-31'),
  ('Hull City', 'KC Stadium', '2003-01-01', '2016-06-30'),
  ('Hull City', 'KCOM Stadium', '2016-07-01', NULL),
  ('Ipswich Town', 'Portman Road', '1884-01-01', NULL),
  ('Leeds United', 'Elland Road', '1919-01-01', NULL),
  ('Middlesbrough', 'Ayresome Park', '1903-01-01', '1995-05-31'),
  ('Middlesbrough', 'Riverside Stadium', '1995-06-01', NULL),
  ('Millwall', 'The Old Den', '1910-01-01', '1993-05-31'),
  ('Millwall', 'The Den', '1993-06-01', NULL),
  ('Norwich City', 'Carrow Road', '1935-01-01', NULL),
  ('Nottingham Forest', 'City Ground', '1898-01-01', NULL),
  ('Queens Park Rangers', 'Loftus Road', '1917-01-01', NULL),
  ('Reading', 'Elm Park', '1896-01-01', '1998-05-31'),
  ('Reading', 'Madejski Stadium', '1998-06-01', '2019-07-31'),
  ('Reading', 'Select Car Leasing Stadium', '2019-08-01', NULL),
  ('Sheffield United', 'Bramall Lane', '1855-01-01', NULL),
  ('Sheffield Wednesday', 'Hillsborough', '1899-01-01', NULL),
  ('Southampton', 'The Dell', '1898-01-01', '2001-05-31'),
  ('Southampton', 'St Mary''s Stadium', '2001-06-01', NULL),
  ('Swansea City', 'Vetch Field', '1912-01-01', '2005-05-31'),
  ('Swansea City', 'Liberty Stadium', '2005-06-01', '2021-07-31'),
  ('Swansea City', 'Swansea.com Stadium', '2021-08-01', NULL),
  ('Watford', 'Vicarage Road', '1922-01-01', NULL),
  ('West Bromwich Albion', 'The Hawthorns', '1900-01-01', NULL),
  ('Wigan Athletic', 'Springfield Park', '1932-01-01', '1999-07-31'),
  ('Wigan Athletic', 'JJB Stadium', '1999-08-01', '2009-07-31'),
  ('Wigan Athletic', 'DW Stadium', '2009-08-01', NULL);

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
