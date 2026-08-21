import {
  GOAL_TYPES,
  type GoalType
} from '@tranmere-web/lib/src/goal-constants';

function canonicalGoalType(value: GoalType) {
  if (!GOAL_TYPES.includes(value)) {
    throw new Error(`Unsupported canonical goal type: ${value}`);
  }
  return value;
}

const FREE_KICK_GOAL_TYPE = canonicalGoalType('FreeKick');
const PENALTY_GOAL_TYPE = canonicalGoalType('Penalty');
const HEADER_GOAL_TYPE = canonicalGoalType('Header');

const statisticalApps = `
  LOWER(TRIM(COALESCE(Apps.competition, ''))) <> 'friendly'
  AND NOT EXISTS (
    SELECT 1
    FROM Games statistical_game
    WHERE statistical_game.season = Apps.season
      AND statistical_game.match_date = Apps.match_date
      AND LOWER(TRIM(statistical_game.competition)) = 'friendly'
  )
`;

const statisticalGoals = `
  LOWER(TRIM(COALESCE(Goals.competition, ''))) <> 'friendly'
  AND NOT EXISTS (
    SELECT 1
    FROM Games statistical_game
    WHERE statistical_game.season = Goals.season
      AND statistical_game.match_date = Goals.match_date
      AND LOWER(TRIM(statistical_game.competition)) = 'friendly'
  )
`;

const seasonContributions = `
  WITH contributions AS (
    SELECT
      CAST(season AS TEXT) AS season,
      player_name,
      1 AS appearances,
      1 AS starts,
      0 AS substitute_appearances,
      0 AS goals,
      0 AS assists,
      yellow_card AS yellow_cards,
      red_card AS red_cards,
      0 AS free_kicks,
      0 AS penalties,
      0 AS headers
    FROM Apps
    WHERE trim(player_name) <> '' AND ${statisticalApps}

    UNION ALL

    SELECT
      CAST(season AS TEXT),
      substituted_by,
      1,
      0,
      1,
      0,
      0,
      substitute_yellow_card,
      substitute_red_card,
      0,
      0,
      0
    FROM Apps
    WHERE substituted_by IS NOT NULL
      AND trim(substituted_by) <> ''
      AND ${statisticalApps}

    UNION ALL

    SELECT
      CAST(season AS TEXT),
      scorer,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      CASE WHEN goal_type = ? THEN 1 ELSE 0 END,
      CASE WHEN goal_type = ? THEN 1 ELSE 0 END,
      CASE WHEN goal_type = ? THEN 1 ELSE 0 END
    FROM Goals
    WHERE trim(scorer) <> '' AND ${statisticalGoals}

    UNION ALL

    SELECT
      CAST(season AS TEXT),
      assist,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0
    FROM Goals
    WHERE assist IS NOT NULL
      AND trim(assist) <> ''
      AND ${statisticalGoals}
  )
  INSERT INTO PlayerSeasonSummaries (
    season, player_name, appearances, starts, substitute_appearances, goals,
    assists, yellow_cards, red_cards, free_kicks, penalties, headers
  )
  SELECT
    season,
    player_name,
    SUM(appearances),
    SUM(starts),
    SUM(substitute_appearances),
    SUM(goals),
    SUM(assists),
    SUM(yellow_cards),
    SUM(red_cards),
    SUM(free_kicks),
    SUM(penalties),
    SUM(headers)
  FROM contributions
  GROUP BY season, player_name;
`;

const totalContributions = `
  INSERT INTO PlayerSeasonSummaries (
    season, player_name, appearances, starts, substitute_appearances, goals,
    assists, yellow_cards, red_cards, free_kicks, penalties, headers
  )
  SELECT
    'TOTAL',
    player_name,
    SUM(appearances),
    SUM(starts),
    SUM(substitute_appearances),
    SUM(goals),
    SUM(assists),
    SUM(yellow_cards),
    SUM(red_cards),
    SUM(free_kicks),
    SUM(penalties),
    SUM(headers)
  FROM PlayerSeasonSummaries
  WHERE season <> 'TOTAL'
  GROUP BY player_name;
`;

/**
 * Rebuilds every season and all-time player summary from the Apps and Goals
 * D1 tables. This is the D1 equivalent of the legacy UpdateJob Lambda.
 */
export async function rebuildPlayerSeasonSummaries(db: D1Database) {
  await db.batch([
    db.prepare('DELETE FROM PlayerSeasonSummaries'),
    db
      .prepare(seasonContributions)
      .bind(FREE_KICK_GOAL_TYPE, PENALTY_GOAL_TYPE, HEADER_GOAL_TYPE),
    db.prepare(totalContributions)
  ]);

  const count = await db
    .prepare('SELECT COUNT(*) AS count FROM PlayerSeasonSummaries')
    .first<{ count: number }>();

  return count?.count ?? 0;
}
