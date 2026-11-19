// Keep dates and destinations tied to the same archive record.
export const timeMachineEventsSql = `
  SELECT 'Manager appointment' AS kind, date_joined AS date,
         name || ' takes charge' AS title, '/managers/' AS base, id AS target, NULL AS image
  FROM Managers
  UNION ALL
  SELECT 'Player debut', match_date, player_name || ' makes his debut against ' || opposition,
         '/page/player/', player_name, NULL
  FROM PlayerMilestones WHERE milestone_type = 'debut'
  UNION ALL
  SELECT 'Programme cover', match_date, home_team || ' v ' || away_team,
         '/match/' || season || '/', match_date, 'https://img.tranmere-web.com/' || programme_path
  FROM Games WHERE trim(programme_path) NOT IN ('', '#N/A')
  UNION ALL
  SELECT 'Cup tie', match_date, competition || ' · ' || home_team || ' ' || full_time_score || ' ' || away_team,
         '/match/' || season || '/', match_date, NULL
  FROM Games WHERE competition IN ('FA Cup', 'League Cup')
  UNION ALL
  SELECT 'Match shirt', MIN(g.match_date), 'Opening fixture of this home shirt’s first archived season',
         '/shirts/', s.slug, i.url
  FROM Shirts s
  JOIN ShirtImages i ON i.id = (
    SELECT id FROM ShirtImages WHERE shirt_id = s.id AND trim(url) != ''
    ORDER BY sort_order LIMIT 1
  )
  JOIN (SELECT shirt_id, MIN(CAST(season AS INTEGER)) AS first_season
        FROM ShirtSeasons GROUP BY shirt_id) seasons ON seasons.shirt_id = s.id
  JOIN Games g ON g.season = seasons.first_season
  WHERE s.usage = 'Home'
  GROUP BY s.id
  ORDER BY kind, date, target, title, image
`;
