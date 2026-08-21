const rebuildArchiveCompletenessSql = `
  WITH
  game_totals AS (
    SELECT
      season,
      COUNT(*) AS total_games,
      SUM(CASE WHEN attendance IS NOT NULL AND attendance > 0 THEN 1 ELSE 0 END) AS attendances,
      SUM(CASE WHEN formation IS NOT NULL AND TRIM(formation) <> '' THEN 1 ELSE 0 END) AS formations,
      SUM(CASE WHEN no_programme_issued = 1 OR (programme_path IS NOT NULL AND TRIM(programme_path) <> '' AND programme_path <> '#N/A') THEN 1 ELSE 0 END) AS programmes,
      SUM(CASE WHEN kit IS NOT NULL AND TRIM(kit) <> '' THEN 1 ELSE 0 END) AS kits
    FROM Games
    GROUP BY season
  ),
  app_counts AS (
    SELECT season, match_date, COUNT(*) AS starters
    FROM Apps
    GROUP BY season, match_date
  ),
  lineup_totals AS (
    SELECT Games.season, SUM(CASE WHEN COALESCE(app_counts.starters, 0) >= 11 THEN 1 ELSE 0 END) AS complete_count
    FROM Games
    LEFT JOIN app_counts ON app_counts.season = Games.season AND app_counts.match_date = Games.match_date
    GROUP BY Games.season
  ),
  goal_counts AS (
    SELECT season, match_date, COUNT(*) AS recorded_goals
    FROM Goals
    GROUP BY season, match_date
  ),
  match_goal_totals AS (
    SELECT
      Games.season,
      SUM(
        CASE WHEN COALESCE(goal_counts.recorded_goals, 0) >=
          CASE
            WHEN Games.home_team = 'Tranmere Rovers' THEN
              CASE WHEN Games.home_goals GLOB '[0-9]*' THEN CAST(Games.home_goals AS INTEGER)
                   ELSE CAST(TRIM(SUBSTR(Games.full_time_score, 1, INSTR(Games.full_time_score, '-') - 1)) AS INTEGER) END
            ELSE
              CASE WHEN Games.away_goals GLOB '[0-9]*' THEN CAST(Games.away_goals AS INTEGER)
                   ELSE CAST(TRIM(SUBSTR(Games.full_time_score, INSTR(Games.full_time_score, '-') + 1)) AS INTEGER) END
          END
        THEN 1 ELSE 0 END
      ) AS complete_count
    FROM Games
    LEFT JOIN goal_counts ON goal_counts.season = Games.season AND goal_counts.match_date = Games.match_date
    GROUP BY Games.season
  ),
  goal_detail_totals AS (
    SELECT
      season,
      SUM(CASE WHEN goal_type IS NOT NULL AND TRIM(goal_type) <> '' THEN 1 ELSE 0 END) AS complete_count,
      COUNT(*) AS total_count
    FROM Goals
    GROUP BY season
  ),
  report_totals AS (
    SELECT Games.season, COUNT(MatchReports.match_date) AS complete_count
    FROM Games
    LEFT JOIN MatchReports ON MatchReports.match_date = Games.match_date
    GROUP BY Games.season
  ),
  season_players AS (
    SELECT season, player_name AS name FROM Apps WHERE TRIM(player_name) <> ''
    UNION
    SELECT season, substituted_by AS name FROM Apps
    WHERE substituted_by IS NOT NULL AND TRIM(substituted_by) <> ''
  ),
  profile_totals AS (
    SELECT
      season_players.season,
      SUM(CASE WHEN Players.id IS NOT NULL AND Players.biography_markdown IS NOT NULL AND TRIM(Players.biography_markdown) <> '' THEN 1 ELSE 0 END) AS complete_count,
      COUNT(*) AS total_count
    FROM season_players
    LEFT JOIN Players ON Players.name = season_players.name
    WHERE season_players.name <> 'Own Goal'
    GROUP BY season_players.season
  ),
  categories(category) AS (
    VALUES
      ('lineups'), ('goals'), ('goal-details'), ('attendances'),
      ('formations'), ('programmes'), ('player-profiles'), ('kits'),
      ('match-reports')
  )
  INSERT INTO ArchiveCompleteness (
    season, category, complete_count, total_count, updated_at
  )
  SELECT
    game_totals.season,
    categories.category,
    CASE categories.category
      WHEN 'lineups' THEN COALESCE(lineup_totals.complete_count, 0)
      WHEN 'goals' THEN COALESCE(match_goal_totals.complete_count, 0)
      WHEN 'goal-details' THEN COALESCE(goal_detail_totals.complete_count, 0)
      WHEN 'attendances' THEN game_totals.attendances
      WHEN 'formations' THEN game_totals.formations
      WHEN 'programmes' THEN game_totals.programmes
      WHEN 'player-profiles' THEN COALESCE(profile_totals.complete_count, 0)
      WHEN 'kits' THEN game_totals.kits
      WHEN 'match-reports' THEN COALESCE(report_totals.complete_count, 0)
    END,
    CASE categories.category
      WHEN 'goal-details' THEN COALESCE(goal_detail_totals.total_count, 0)
      WHEN 'player-profiles' THEN COALESCE(profile_totals.total_count, 0)
      ELSE game_totals.total_games
    END,
    CURRENT_TIMESTAMP
  FROM game_totals
  CROSS JOIN categories
  LEFT JOIN lineup_totals ON lineup_totals.season = game_totals.season
  LEFT JOIN match_goal_totals ON match_goal_totals.season = game_totals.season
  LEFT JOIN goal_detail_totals ON goal_detail_totals.season = game_totals.season
  LEFT JOIN profile_totals ON profile_totals.season = game_totals.season
  LEFT JOIN report_totals ON report_totals.season = game_totals.season;
`;

/** Rebuilds the public, aggregate-only view of archive coverage. */
export async function rebuildArchiveCompleteness(db: D1Database) {
  await db.batch([
    db.prepare('DELETE FROM ArchiveCompleteness'),
    db.prepare(rebuildArchiveCompletenessSql)
  ]);

  const count = await db
    .prepare('SELECT COUNT(*) AS count FROM ArchiveCompleteness')
    .first<{ count: number }>();

  return count?.count ?? 0;
}
