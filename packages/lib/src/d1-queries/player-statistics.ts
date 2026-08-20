import type {
  AppRow,
  GoalRow,
  HatTrickRow,
  PlayerAppearanceRow,
  PlayerMilestoneRow,
  PlayerSeasonSummaryRow
} from '../d1-types';
import { all, withLimit, type D1DatabaseReader, type D1Value } from './shared';

export interface HatTrickQueryOptions {
  player?: string;
  playerMatch?: 'exact' | 'contains';
  season?: number;
  matchDate?: string;
  limit?: number;
}

export interface PlayerMilestoneQueryOptions {
  player?: string;
  matchDate?: string;
  milestoneType?: PlayerMilestoneRow['milestone_type'];
}

export interface PlayerSeasonSummaryQueryOptions {
  player?: string;
  playerMatch?: 'exact' | 'contains';
  season?: string;
  position?: string;
  onlyOneAppearance?: boolean;
  sort?: 'starts' | 'goals' | 'subs';
  limit?: number;
  offset?: number;
}

export interface AppQueryOptions {
  player?: string;
  playerMatch?: 'exact' | 'contains';
  substitutedBy?: string;
  season?: number;
  matchDate?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface PlayerAppearanceQueryOptions {
  season?: number;
  limit?: number;
  offset?: number;
  sort?: 'date-asc' | 'date-desc';
}

export interface GoalQueryOptions {
  scorer?: string;
  scorerMatch?: 'exact' | 'contains';
  opposition?: string;
  season?: number;
  matchDate?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

function addPlayerCondition(
  conditions: string[],
  values: D1Value[],
  column: string,
  player?: string,
  match: 'exact' | 'contains' = 'contains'
) {
  if (!player) return;
  conditions.push(match === 'exact' ? `${column} = ?` : `${column} LIKE ?`);
  values.push(match === 'exact' ? player : `%${player}%`);
}

export async function queryHatTrickRows(
  db: D1DatabaseReader,
  options: HatTrickQueryOptions = {}
) {
  const conditions: string[] = [];
  const values: D1Value[] = [];
  addPlayerCondition(
    conditions,
    values,
    'player_name',
    options.player,
    options.playerMatch
  );
  if (options.season !== undefined) {
    conditions.push('season = ?');
    values.push(options.season);
  }
  if (options.matchDate) {
    conditions.push('match_date = ?');
    values.push(options.matchDate);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return (
    await all<HatTrickRow>(
      db,
      withLimit(
        `SELECT id, season, match_date, opposition, player_name, goals
         FROM HatTricks
         ${where}
         ORDER BY match_date DESC, player_name ASC, id ASC`,
        values,
        options.limit
      ),
      values
    )
  ).results;
}

export async function queryPlayerMilestoneRows(
  db: D1DatabaseReader,
  options: PlayerMilestoneQueryOptions = {}
) {
  const conditions: string[] = [];
  const values: D1Value[] = [];
  if (options.player) {
    conditions.push('player_name = ?');
    values.push(options.player);
  }
  if (options.matchDate) {
    conditions.push('match_date = ?');
    values.push(options.matchDate);
  }
  if (options.milestoneType) {
    conditions.push('milestone_type = ?');
    values.push(options.milestoneType);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return (
    await all<PlayerMilestoneRow>(
      db,
      `SELECT id, player_name, milestone_type, match_date, season, opposition,
              milestone_value
       FROM PlayerMilestones
       ${where}
       ORDER BY match_date ASC, player_name ASC, milestone_type ASC`,
      values
    )
  ).results;
}

export async function queryLongestPlayerAbsences(
  db: D1DatabaseReader,
  limit = 8
) {
  const values: D1Value[] = [];
  return (
    await all<PlayerMilestoneRow>(
      db,
      withLimit(
        `SELECT id, player_name, milestone_type, match_date, season, opposition,
                milestone_value
         FROM PlayerMilestones
         WHERE milestone_type = 'longest-absence'
         ORDER BY milestone_value DESC, player_name ASC`,
        values,
        limit
      ),
      values
    )
  ).results;
}

export async function queryPlayerSeasonSummaryRows(
  db: D1DatabaseReader,
  options: PlayerSeasonSummaryQueryOptions = {}
) {
  const conditions: string[] = [];
  const values: D1Value[] = [];
  addPlayerCondition(
    conditions,
    values,
    'player_name',
    options.player,
    options.playerMatch
  );
  if (options.season !== undefined) {
    conditions.push('season = ?');
    values.push(options.season);
  }
  if (options.position) {
    conditions.push(
      `EXISTS (
        SELECT 1 FROM Players
        WHERE Players.name = PlayerSeasonSummaries.player_name
          AND (Players.position = ? OR Players.secondary_position = ?)
      )`
    );
    values.push(options.position, options.position);
  }
  if (options.onlyOneAppearance) conditions.push('appearances = 1');
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy =
    options.sort === 'goals'
      ? 'goals DESC, appearances DESC, player_name ASC'
      : options.sort === 'subs'
        ? 'substitute_appearances DESC, starts DESC, player_name ASC'
        : 'starts DESC, appearances DESC, player_name ASC';
  return (
    await all<PlayerSeasonSummaryRow>(
      db,
      withLimit(
        `SELECT season, player_name, appearances, starts, substitute_appearances,
                goals, assists, yellow_cards, red_cards, free_kicks, penalties,
                headers
         FROM PlayerSeasonSummaries
         ${where}
         ORDER BY ${orderBy}`,
        values,
        options.limit,
        options.offset
      ),
      values
    )
  ).results;
}

export async function queryAppRows(
  db: D1DatabaseReader,
  options: AppQueryOptions = {}
) {
  const conditions: string[] = [];
  const values: D1Value[] = [];
  addPlayerCondition(
    conditions,
    values,
    'player_name',
    options.player,
    options.playerMatch
  );
  if (options.substitutedBy) {
    conditions.push('substituted_by = ?');
    values.push(options.substitutedBy);
  }
  if (options.season !== undefined) {
    conditions.push('season = ?');
    values.push(options.season);
  }
  if (options.matchDate) {
    conditions.push('match_date = ?');
    values.push(options.matchDate);
  }
  if (options.dateFrom) {
    conditions.push('match_date >= ?');
    values.push(options.dateFrom);
  }
  if (options.dateTo) {
    conditions.push('match_date <= ?');
    values.push(options.dateTo);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return (
    await all<AppRow>(
      db,
      withLimit(
        `SELECT id, season, match_date, player_name, competition, opposition,
                shirt_number, yellow_card, red_card, substitute_yellow_card,
                substitute_red_card, substitute_time, substituted_by,
                substitute_substituted_by
         FROM Apps
         ${where}
         ORDER BY match_date DESC, player_name ASC, id ASC`,
        values,
        options.limit
      ),
      values
    )
  ).results;
}

export async function queryPlayerAppearanceRows(
  db: D1DatabaseReader,
  playerName: string,
  options: PlayerAppearanceQueryOptions = {}
) {
  const values: D1Value[] = [playerName, playerName, playerName];
  const seasonClause = options.season === undefined ? '' : ' AND season = ?';
  if (options.season !== undefined) values.push(options.season);
  const orderBy =
    options.sort === 'date-asc'
      ? 'match_date ASC, player_name ASC, id ASC'
      : 'match_date DESC, player_name ASC, id ASC';
  return (
    await all<PlayerAppearanceRow>(
      db,
      withLimit(
        `SELECT id, season, match_date, player_name, competition, opposition,
                shirt_number, yellow_card, red_card, substitute_yellow_card,
                substitute_red_card, substitute_time, substituted_by,
                substitute_substituted_by,
                CASE WHEN player_name = ? THEN 'Start' ELSE 'Sub' END AS appearance_type
         FROM Apps
         WHERE (player_name = ? OR substituted_by = ?)${seasonClause}
         ORDER BY ${orderBy}`,
        values,
        options.limit,
        options.offset
      ),
      values
    )
  ).results;
}

export async function countPlayerAppearanceRows(
  db: D1DatabaseReader,
  playerName: string,
  season?: number
) {
  const seasonClause = season === undefined ? '' : ' AND season = ?';
  const values: D1Value[] = [playerName, playerName];
  if (season !== undefined) values.push(season);
  const result = await db
    .prepare(
      `SELECT COUNT(*) AS total
       FROM Apps
       WHERE (player_name = ? OR substituted_by = ?)${seasonClause}`
    )
    .bind(...values)
    .first<{ total: number }>();
  return result?.total ?? 0;
}

export async function queryGoalRows(
  db: D1DatabaseReader,
  options: GoalQueryOptions = {}
) {
  const conditions: string[] = [];
  const values: D1Value[] = [];
  addPlayerCondition(
    conditions,
    values,
    'scorer',
    options.scorer,
    options.scorerMatch
  );
  if (options.opposition) {
    conditions.push('opposition = ?');
    values.push(options.opposition);
  }
  if (options.season !== undefined) {
    conditions.push('season = ?');
    values.push(options.season);
  }
  if (options.matchDate) {
    conditions.push('match_date = ?');
    values.push(options.matchDate);
  }
  if (options.dateFrom) {
    conditions.push('match_date >= ?');
    values.push(options.dateFrom);
  }
  if (options.dateTo) {
    conditions.push('match_date <= ?');
    values.push(options.dateTo);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return (
    await all<GoalRow>(
      db,
      withLimit(
        `SELECT id, season, match_date, scorer, opposition, competition, minute,
                goal_type, assist, assist_type, foot, six_yard_box,
                eighteen_yard_box, cross_side, long_range
         FROM Goals
         ${where}
         ORDER BY match_date DESC, scorer ASC, id ASC`,
        values,
        options.limit
      ),
      values
    )
  ).results;
}
