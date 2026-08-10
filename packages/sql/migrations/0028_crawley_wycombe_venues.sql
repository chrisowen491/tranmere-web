INSERT OR REPLACE INTO ClubVenues (club_name, venue, start_date, end_date) VALUES
  ('Crawley Town', 'Broadfield Stadium', '1997-01-01', NULL),
  ('Wycombe Wanderers', 'Loakes Park', '1895-01-01', '1990-01-01'),
  ('Wycombe Wanderers', 'Adams Park', '1990-01-02', NULL);

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
