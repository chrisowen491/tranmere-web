import type {
  GoalAtlasBucketRow,
  GoalAtlasRow,
  GoalAtlasSummaryRow
} from '../d1-types';
import { all, withLimit, type D1DatabaseReader, type D1Value } from './shared';

export type GoalAtlasPeriod = 'first-half' | 'second-half' | 'extra-time';

export interface GoalAtlasQueryOptions {
  season?: number;
  competition?: string;
  scorer?: string;
  opposition?: string;
  goalType?: string;
  foot?: string;
  assistType?: string;
  crossSide?: string;
  distance?: string;
  period?: GoalAtlasPeriod;
  minuteFrom?: number;
  minuteTo?: number;
  limit?: number;
  offset?: number;
}

export interface GoalAtlasFilterOptions {
  scorers: string[];
  oppositions: string[];
  competitions: string[];
}

const minuteValue = `CAST(TRIM(REPLACE(COALESCE(Goals.minute, ''), '''', '')) AS INTEGER)`;

function filteredWhere(options: GoalAtlasQueryOptions) {
  const conditions = [
    `LOWER(TRIM(COALESCE(Goals.competition, ''))) <> 'friendly'`,
    `NOT EXISTS (
      SELECT 1 FROM Games statistical_game
      WHERE statistical_game.season = Goals.season
        AND statistical_game.match_date = Goals.match_date
        AND LOWER(TRIM(statistical_game.competition)) = 'friendly'
    )`
  ];
  const values: D1Value[] = [];
  const exactFilters: Array<[string, D1Value | undefined]> = [
    ['Goals.season', options.season],
    ['Goals.competition', options.competition],
    ['Goals.scorer', options.scorer],
    ['Goals.opposition', options.opposition],
    ['Goals.goal_type', options.goalType],
    ['Goals.foot', options.foot],
    ['Goals.assist_type', options.assistType],
    ['Goals.cross_side', options.crossSide],
    ['Goals.distance', options.distance]
  ];
  for (const [column, value] of exactFilters) {
    if (value === undefined || value === '') continue;
    conditions.push(`${column} = ?`);
    values.push(value);
  }
  if (options.period === 'first-half') {
    conditions.push(
      `Goals.minute IS NOT NULL AND ${minuteValue} BETWEEN 1 AND 45`
    );
  } else if (options.period === 'second-half') {
    conditions.push(
      `Goals.minute IS NOT NULL AND ${minuteValue} BETWEEN 46 AND 90`
    );
  } else if (options.period === 'extra-time') {
    conditions.push(`Goals.minute IS NOT NULL AND ${minuteValue} > 90`);
  }
  if (options.minuteFrom !== undefined) {
    conditions.push(`Goals.minute IS NOT NULL AND ${minuteValue} >= ?`);
    values.push(options.minuteFrom);
  }
  if (options.minuteTo !== undefined) {
    conditions.push(`Goals.minute IS NOT NULL AND ${minuteValue} <= ?`);
    values.push(options.minuteTo);
  }
  return { where: `WHERE ${conditions.join(' AND ')}`, values };
}

export async function queryGoalAtlasRows(
  db: D1DatabaseReader,
  options: GoalAtlasQueryOptions = {}
) {
  const { where, values } = filteredWhere(options);
  return (
    await all<GoalAtlasRow>(
      db,
      withLimit(
        `SELECT Goals.id, Goals.season, Goals.match_date, Goals.scorer,
                Goals.opposition, Goals.competition, Goals.minute,
                Goals.goal_type, Goals.assist, Goals.assist_type, Goals.foot,
                Goals.distance, Goals.cross_side, Games.full_time_score
         FROM Goals
         LEFT JOIN Games
           ON Games.season = Goals.season
          AND Games.match_date = Goals.match_date
         ${where}
         ORDER BY Goals.match_date DESC, Goals.scorer ASC, Goals.id ASC`,
        values,
        options.limit,
        options.offset
      ),
      values
    )
  ).results;
}

export async function queryGoalAtlasSummary(
  db: D1DatabaseReader,
  options: GoalAtlasQueryOptions = {}
) {
  const { where, values } = filteredWhere(options);
  return db
    .prepare(
      `SELECT COUNT(*) AS total,
              COUNT(NULLIF(TRIM(Goals.minute), '')) AS minute_complete,
              COUNT(NULLIF(TRIM(Goals.goal_type), '')) AS goal_type_complete,
              COUNT(NULLIF(TRIM(Goals.foot), '')) AS foot_complete,
              COUNT(NULLIF(TRIM(Goals.assist_type), '')) AS assist_type_complete,
              COUNT(NULLIF(TRIM(Goals.distance), '')) AS distance_complete,
              COUNT(NULLIF(TRIM(Goals.cross_side), '')) AS cross_side_complete
       FROM Goals
       ${where}`
    )
    .bind(...values)
    .first<GoalAtlasSummaryRow>();
}

async function queryBuckets(
  db: D1DatabaseReader,
  options: GoalAtlasQueryOptions,
  expression: string,
  orderBy: string
) {
  const { where, values } = filteredWhere(options);
  return (
    await all<GoalAtlasBucketRow>(
      db,
      `SELECT ${expression} AS label, COUNT(*) AS total
       FROM Goals
       ${where}
       GROUP BY label
       ORDER BY ${orderBy}`,
      values
    )
  ).results;
}

export function queryGoalAtlasPeriods(
  db: D1DatabaseReader,
  options: GoalAtlasQueryOptions = {}
) {
  return queryBuckets(
    db,
    options,
    `CASE
       WHEN Goals.minute IS NULL OR TRIM(Goals.minute) = '' THEN 'Unknown'
       WHEN ${minuteValue} <= 15 THEN '1–15'
       WHEN ${minuteValue} <= 30 THEN '16–30'
       WHEN ${minuteValue} <= 45 THEN '31–45+'
       WHEN ${minuteValue} <= 60 THEN '46–60'
       WHEN ${minuteValue} <= 75 THEN '61–75'
       WHEN ${minuteValue} <= 90 THEN '76–90+'
       ELSE 'Extra time'
     END`,
    `CASE label
       WHEN '1–15' THEN 1 WHEN '16–30' THEN 2 WHEN '31–45+' THEN 3
       WHEN '46–60' THEN 4 WHEN '61–75' THEN 5 WHEN '76–90+' THEN 6
       WHEN 'Extra time' THEN 7 ELSE 8 END`
  );
}

export function queryGoalAtlasTypes(
  db: D1DatabaseReader,
  options: GoalAtlasQueryOptions = {}
) {
  return queryBuckets(
    db,
    options,
    `COALESCE(NULLIF(TRIM(Goals.goal_type), ''), 'Unknown')`,
    `total DESC, label ASC`
  );
}

export async function queryGoalAtlasFilterOptions(db: D1DatabaseReader) {
  const [scorerRows, oppositionRows, competitionRows] = await Promise.all([
    all<{ value: string }>(
      db,
      `SELECT DISTINCT scorer AS value FROM Goals
       WHERE TRIM(scorer) <> '' ORDER BY scorer ASC`,
      []
    ),
    all<{ value: string }>(
      db,
      `SELECT DISTINCT opposition AS value FROM Goals
       WHERE TRIM(opposition) <> '' ORDER BY opposition ASC`,
      []
    ),
    all<{ value: string }>(
      db,
      `SELECT DISTINCT competition AS value FROM Goals
       WHERE competition IS NOT NULL AND TRIM(competition) <> ''
         AND LOWER(TRIM(competition)) <> 'friendly'
       ORDER BY competition ASC`,
      []
    )
  ]);
  return {
    scorers: scorerRows.results.map(({ value }) => value),
    oppositions: oppositionRows.results.map(({ value }) => value),
    competitions: competitionRows.results.map(({ value }) => value)
  } satisfies GoalAtlasFilterOptions;
}
