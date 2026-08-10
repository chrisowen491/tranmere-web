INSERT OR REPLACE INTO ClubVenues (club_name, venue, start_date, end_date) VALUES
  ('AFC Wimbledon', 'Kingsmeadow', '2002-01-01', '2020-11-02'),
  ('AFC Wimbledon', 'Plough Lane', '2020-11-03', NULL),
  ('Burton Albion', 'Eton Park', '1958-01-01', '2005-01-31'),
  ('Burton Albion', 'Pirelli Stadium', '2005-02-01', NULL),
  ('Cheltenham', 'Whaddon Road', '1932-01-01', NULL),
  ('Cheltenham Town', 'Whaddon Road', '1932-01-01', NULL),
  ('Fleetwood Town', 'Highbury Stadium', '1939-01-01', NULL),
  ('Harrogate Town', 'Wetherby Road', '1920-01-01', NULL),
  ('Salford City', 'Moor Lane', '1978-01-01', NULL);

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
