import type { FantasyRankingRow } from '../d1-types';
import { all, type D1DatabaseReader, type D1Value } from './shared';

export interface FantasyRankingQueryOptions {
  season?: number;
}

const statisticalMatchCondition = (table: 'Apps' | 'Goals') => `
  LOWER(TRIM(COALESCE(${table}.competition, ''))) <> 'friendly'
  AND NOT EXISTS (
    SELECT 1
    FROM Games statistical_game
    WHERE statistical_game.season = ${table}.season
      AND statistical_game.match_date = ${table}.match_date
      AND LOWER(TRIM(COALESCE(statistical_game.competition, ''))) = 'friendly'
  )`;

export async function queryFantasyRankingRows(
  db: D1DatabaseReader,
  options: FantasyRankingQueryOptions = {}
) {
  const values: D1Value[] = [];
  const appSeason = options.season === undefined ? '' : 'AND Apps.season = ?';
  const goalSeason = options.season === undefined ? '' : 'AND Goals.season = ?';
  if (options.season !== undefined) values.push(options.season, options.season);

  const result = await all<FantasyRankingRow>(
    db,
    `WITH statistical_apps AS MATERIALIZED (
       SELECT player_name, substituted_by, substitute_substituted_by,
              substitute_time, yellow_card, red_card,
              substitute_yellow_card, substitute_red_card,
              CASE WHEN EXISTS (
                SELECT 1
                FROM Games clean_sheet_game
                WHERE clean_sheet_game.season = Apps.season
                  AND clean_sheet_game.match_date = Apps.match_date
                  AND (
                    (clean_sheet_game.home_team = 'Tranmere Rovers' AND CAST(clean_sheet_game.away_goals AS INTEGER) = 0)
                    OR (clean_sheet_game.away_team = 'Tranmere Rovers' AND CAST(clean_sheet_game.home_goals AS INTEGER) = 0)
                  )
              ) THEN 1 ELSE 0 END AS team_clean_sheet
       FROM Apps
       WHERE ${statisticalMatchCondition('Apps')}
         ${appSeason}
     ),
     statistical_goals AS MATERIALIZED (
       SELECT scorer, assist
       FROM Goals
       WHERE ${statisticalMatchCondition('Goals')}
         ${goalSeason}
     ),
     expanded_appearances AS (
       SELECT
         TRIM(player_name) AS player_name,
         CASE
           WHEN NULLIF(TRIM(COALESCE(substituted_by, '')), '') IS NULL THEN 2
           WHEN CASE
             WHEN TRIM(COALESCE(substitute_time, '')) GLOB '[0-9]*'
               THEN CAST(TRIM(substitute_time) AS INTEGER)
             ELSE 60
           END >= 60 THEN 2
           ELSE 1
         END AS appearance_points,
         COALESCE(yellow_card, 0) AS yellow_cards,
         COALESCE(red_card, 0) AS red_cards,
         team_clean_sheet * CASE
           WHEN NULLIF(TRIM(COALESCE(substituted_by, '')), '') IS NULL THEN 1
           WHEN CASE
             WHEN TRIM(COALESCE(substitute_time, '')) GLOB '[0-9]*'
               THEN CAST(TRIM(substitute_time) AS INTEGER)
             ELSE 60
           END >= 60 THEN 1
           ELSE 0
         END AS clean_sheet
       FROM statistical_apps
       WHERE TRIM(COALESCE(player_name, '')) <> ''

       UNION ALL

       SELECT
         TRIM(substituted_by),
         CASE
           WHEN NULLIF(TRIM(COALESCE(substitute_substituted_by, '')), '') IS NOT NULL THEN 1
           WHEN CASE
             WHEN TRIM(COALESCE(substitute_time, '')) GLOB '[0-9]*'
               THEN CAST(TRIM(substitute_time) AS INTEGER)
             ELSE 60
           END <= 30 THEN 2
           ELSE 1
         END,
         COALESCE(substitute_yellow_card, 0),
         COALESCE(substitute_red_card, 0),
         team_clean_sheet * CASE
           WHEN NULLIF(TRIM(COALESCE(substitute_substituted_by, '')), '') IS NOT NULL THEN 0
           WHEN CASE
             WHEN TRIM(COALESCE(substitute_time, '')) GLOB '[0-9]*'
               THEN CAST(TRIM(substitute_time) AS INTEGER)
             ELSE 60
           END <= 30 THEN 1
           ELSE 0
         END
       FROM statistical_apps
       WHERE TRIM(COALESCE(substituted_by, '')) <> ''

       UNION ALL

       SELECT TRIM(substitute_substituted_by), 1, 0, 0, 0
       FROM statistical_apps
       WHERE TRIM(COALESCE(substitute_substituted_by, '')) <> ''
     ),
     appearance_totals AS (
       SELECT player_name, COUNT(*) AS appearances,
              SUM(appearance_points) AS appearance_points,
              SUM(yellow_cards) AS yellow_cards,
              SUM(red_cards) AS red_cards,
              SUM(clean_sheet) AS clean_sheets
       FROM expanded_appearances
       GROUP BY player_name
     ),
     goal_totals AS (
       SELECT TRIM(scorer) AS player_name, COUNT(*) AS goals
       FROM statistical_goals
       WHERE TRIM(COALESCE(scorer, '')) <> ''
         AND LOWER(TRIM(scorer)) <> 'own goal'
       GROUP BY TRIM(scorer)
     ),
     assist_totals AS (
       SELECT TRIM(assist) AS player_name, COUNT(*) AS assists
       FROM statistical_goals
       WHERE TRIM(COALESCE(assist, '')) <> ''
       GROUP BY TRIM(assist)
     ),
     ranked_players AS (
       SELECT player_name FROM appearance_totals
       UNION
       SELECT player_name FROM goal_totals
       UNION
       SELECT player_name FROM assist_totals
     ),
     metrics AS (
       SELECT
         ranked_players.player_name,
         Players.position,
         Players.pic_link,
         CASE
           WHEN Players.position = 'Goalkeeper' THEN 'Goalkeeper'
           WHEN Players.position IN ('Central Defender', 'Full Back', 'Left Back', 'Right Back', 'Sweeper') THEN 'Defender'
           WHEN Players.position IN ('Central Midfielder', 'Defensive Midfield', 'Attacking Midfield', 'Right Midfield', 'Left Midfield', 'Wing Half', 'Winger') THEN 'Midfielder'
           WHEN Players.position IN ('Striker', 'Inside Forward', 'Outside Left') THEN 'Forward'
           ELSE 'Unclassified'
         END AS fantasy_position,
         COALESCE(appearance_totals.appearances, 0) AS appearances,
         COALESCE(goal_totals.goals, 0) AS goals,
         COALESCE(assist_totals.assists, 0) AS assists,
         COALESCE(appearance_totals.yellow_cards, 0) AS yellow_cards,
         COALESCE(appearance_totals.red_cards, 0) AS red_cards,
         COALESCE(appearance_totals.clean_sheets, 0) AS clean_sheets,
         COALESCE(appearance_totals.appearance_points, 0) AS appearance_points,
         COALESCE(goal_totals.goals, 0) * CASE
           WHEN Players.position = 'Goalkeeper' THEN 10
           WHEN Players.position IN ('Central Defender', 'Full Back', 'Left Back', 'Right Back', 'Sweeper') THEN 6
           WHEN Players.position IN ('Central Midfielder', 'Defensive Midfield', 'Attacking Midfield', 'Right Midfield', 'Left Midfield', 'Wing Half', 'Winger') THEN 5
           ELSE 4
         END AS goal_points,
         COALESCE(assist_totals.assists, 0) * 3 AS assist_points,
         -COALESCE(appearance_totals.yellow_cards, 0)
           - (COALESCE(appearance_totals.red_cards, 0) * 3) AS card_points,
         COALESCE(appearance_totals.clean_sheets, 0) * CASE
           WHEN Players.position IN ('Goalkeeper', 'Central Defender', 'Full Back', 'Left Back', 'Right Back', 'Sweeper') THEN 4
           WHEN Players.position IN ('Central Midfielder', 'Defensive Midfield', 'Attacking Midfield', 'Right Midfield', 'Left Midfield', 'Wing Half', 'Winger') THEN 1
           ELSE 0
         END AS clean_sheet_points
       FROM ranked_players
       LEFT JOIN appearance_totals USING (player_name)
       LEFT JOIN goal_totals USING (player_name)
       LEFT JOIN assist_totals USING (player_name)
       LEFT JOIN Players ON Players.name = ranked_players.player_name COLLATE NOCASE
     )
     SELECT *, appearance_points + goal_points + assist_points + card_points + clean_sheet_points AS total_points
     FROM metrics
     ORDER BY total_points DESC, goals DESC, appearances DESC, player_name ASC`,
    values
  );

  return result.results;
}
