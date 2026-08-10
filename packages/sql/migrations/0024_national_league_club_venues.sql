-- Venue periods for National League opposition. The club selection follows the
-- National League's current club list; historic periods remain date-specific.
INSERT OR IGNORE INTO ClubVenues (club_name, venue, start_date, end_date) VALUES
  ('Aldershot', 'Recreation Ground', '1927-01-01', NULL),
  ('Altrincham', 'Moss Lane', '1910-01-01', NULL),
  ('Boreham Wood', 'Meadow Park', '1963-01-01', NULL),
  ('Braintree Town', 'Cressing Road', '1923-01-01', NULL),
  ('Chester', 'Sealand Road', '1906-01-01', '1990-03-31'),
  ('Chester', 'Deva Stadium', '1992-08-01', NULL),
  ('Darlington', 'Feethams', '1883-01-01', '2003-05-31'),
  ('Darlington', 'Darlington Arena', '2003-06-01', '2012-05-31'),
  ('Eastleigh', 'Ten Acres', '1957-01-01', NULL),
  ('FC Halifax Town', 'The Shay', '2008-01-01', NULL),
  ('Forest Green Rovers', 'The Lawn', '1989-01-01', '2006-05-31'),
  ('Forest Green Rovers', 'The New Lawn', '2006-06-01', NULL),
  ('Gateshead', 'Redheugh Park', '1911-01-01', '1955-05-31'),
  ('Gateshead', 'Gateshead International Stadium', '1955-06-01', NULL),
  ('Hereford United', 'Edgar Street', '1924-01-01', NULL),
  ('Macclesfield', 'Moss Rose', '1891-01-01', NULL),
  ('Morecambe', 'Christie Park', '1920-01-01', '2010-07-31'),
  ('Morecambe', 'Globe Arena', '2010-08-01', NULL),
  ('Sutton United', 'Gander Green Lane', '1919-01-01', NULL),
  ('Woking', 'Kingfield Stadium', '1922-01-01', NULL),
  ('Yeovil', 'Huish Park', '1990-01-01', NULL),
  ('Yeovil Town', 'Huish Park', '1990-01-01', NULL);

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
