const appearanceEvents = `
  SELECT DISTINCT season, match_date, opposition, player_name
  FROM (
    SELECT
      season,
      match_date,
      opposition,
      player_name
    FROM Apps
    WHERE trim(player_name) <> ''

    UNION ALL

    SELECT
      season,
      match_date,
      opposition,
      substituted_by
    FROM Apps
    WHERE substituted_by IS NOT NULL AND trim(substituted_by) <> ''

    UNION ALL

    SELECT
      season,
      match_date,
      opposition,
      substitute_substituted_by
    FROM Apps
    WHERE
      substitute_substituted_by IS NOT NULL
      AND trim(substitute_substituted_by) <> ''
  )
`;

const appearanceBoundaries = `
  WITH appearances AS (
    ${appearanceEvents}
  ),
  ranked AS (
    SELECT
      season,
      match_date,
      opposition,
      player_name,
      ROW_NUMBER() OVER (
        PARTITION BY player_name
        ORDER BY match_date ASC, season ASC
      ) AS first_rank,
      ROW_NUMBER() OVER (
        PARTITION BY player_name
        ORDER BY match_date DESC, season DESC
      ) AS latest_rank
    FROM appearances
  )
  INSERT INTO PlayerMilestones (
    id, player_name, milestone_type, match_date, season, opposition,
    milestone_value
  )
  SELECT
    'debut:' || player_name,
    player_name,
    'debut',
    match_date,
    season,
    opposition,
    1
  FROM ranked
  WHERE first_rank = 1

  UNION ALL

  SELECT
    'latest-appearance:' || player_name,
    player_name,
    'latest-appearance',
    match_date,
    season,
    opposition,
    NULL
  FROM ranked
  WHERE latest_rank = 1;
`;

const appearanceLandmarks = `
  WITH appearances AS (
    ${appearanceEvents}
  ),
  numbered AS (
    SELECT
      season,
      match_date,
      opposition,
      player_name,
      ROW_NUMBER() OVER (
        PARTITION BY player_name
        ORDER BY match_date ASC, season ASC
      ) AS appearance_number
    FROM appearances
  )
  INSERT INTO PlayerMilestones (
    id, player_name, milestone_type, match_date, season, opposition,
    milestone_value
  )
  SELECT
    'appearance-landmark:' || player_name || ':' || appearance_number,
    player_name,
    'appearance-landmark',
    match_date,
    season,
    opposition,
    appearance_number
  FROM numbered
  WHERE appearance_number >= 50 AND appearance_number % 50 = 0;
`;

const firstGoals = `
  WITH ranked AS (
    SELECT
      season,
      match_date,
      opposition,
      scorer,
      ROW_NUMBER() OVER (
        PARTITION BY scorer
        ORDER BY match_date ASC, season ASC, id ASC
      ) AS goal_rank
    FROM Goals
    WHERE trim(scorer) <> '' AND scorer <> 'Own Goal'
  )
  INSERT INTO PlayerMilestones (
    id, player_name, milestone_type, match_date, season, opposition,
    milestone_value
  )
  SELECT
    'first-goal:' || scorer,
    scorer,
    'first-goal',
    match_date,
    season,
    opposition,
    1
  FROM ranked
  WHERE goal_rank = 1;
`;

/**
 * Rebuilds compact career milestones from Apps and Goals. Match pages can
 * query this table by date rather than loading every participant's full career.
 */
export async function rebuildPlayerMilestones(db: D1Database) {
  await db.batch([
    db.prepare('DELETE FROM PlayerMilestones'),
    db.prepare(appearanceBoundaries),
    db.prepare(appearanceLandmarks),
    db.prepare(firstGoals)
  ]);

  const count = await db
    .prepare('SELECT COUNT(*) AS count FROM PlayerMilestones')
    .first<{ count: number }>();

  return count?.count ?? 0;
}
