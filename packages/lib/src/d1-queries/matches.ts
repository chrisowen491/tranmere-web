import type {
  GameRow,
  MatchReportRow,
  SearchIndexSeasonRow
} from '../d1-types';
import { all, withLimit, type D1DatabaseReader, type D1Value } from './shared';

export interface GameQueryOptions {
  season?: number;
  competition?: string;
  venue?: string;
  opposition?: string;
  penalties?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: 'date-asc' | 'date-desc' | 'attendance-desc';
  limit?: number;
  offset?: number;
  includeKit?: boolean;
  playedOnly?: boolean;
  statisticsOnly?: boolean;
}

export interface GameDateRangeBounds {
  first_match_date: string | null;
  last_match_date: string | null;
}

const gameColumns = `id, season, match_date, competition, round, home_team, away_team,
  opposition, venue, attendance, full_time_score, home_goals, away_goals,
  division, tier, leg, tie, neutral, after_extra_time, penalties,
  programme_path, no_programme_issued, formation`;

export async function querySearchIndexSeasonRows(db: D1DatabaseReader) {
  return (
    await all<SearchIndexSeasonRow>(
      db,
      `SELECT DISTINCT season FROM Games ORDER BY season ASC`,
      []
    )
  ).results;
}

export async function queryGameRows(
  db: D1DatabaseReader,
  options: GameQueryOptions = {}
) {
  const conditions: string[] = [];
  const values: D1Value[] = [];
  if (options.season !== undefined) {
    conditions.push('season = ?');
    values.push(options.season);
  }
  if (options.competition) {
    conditions.push('competition = ?');
    values.push(options.competition);
  }
  if (options.venue) {
    conditions.push('venue = ?');
    values.push(options.venue);
  }
  if (options.opposition) {
    conditions.push('opposition = ?');
    values.push(options.opposition);
  }
  if (options.penalties === 'Penalty Shootout') {
    conditions.push("penalties IS NOT NULL AND TRIM(penalties) <> ''");
  } else if (options.penalties) {
    conditions.push('penalties = ?');
    values.push(options.penalties);
  }
  if (options.dateFrom) {
    conditions.push('match_date >= ?');
    values.push(options.dateFrom);
  }
  if (options.dateTo) {
    conditions.push('match_date <= ?');
    values.push(options.dateTo);
  }
  if (options.playedOnly) {
    conditions.push(
      "full_time_score IS NOT NULL AND TRIM(full_time_score) <> ''"
    );
  }
  if (options.statisticsOnly) {
    conditions.push("LOWER(TRIM(competition)) <> 'friendly'");
  }
  const orderBy =
    options.sort === 'attendance-desc'
      ? 'attendance DESC, match_date DESC'
      : options.sort === 'date-desc'
        ? 'match_date DESC'
        : 'match_date ASC';
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const kitColumn = options.includeKit ? ', kit' : '';
  return (
    await all<GameRow>(
      db,
      withLimit(
        `SELECT ${gameColumns}${kitColumn}, referee, ticket
         FROM Games
         ${where}
         ORDER BY ${orderBy}, id ASC`,
        values,
        options.limit,
        options.offset
      ),
      values
    )
  ).results;
}

export async function queryGameBySeasonAndDate(
  db: D1DatabaseReader,
  season: number,
  matchDate: string
) {
  return db
    .prepare(
      `SELECT ${gameColumns}, kit, referee, ticket
       FROM Games
       WHERE season = ? AND match_date = ?
       ORDER BY id ASC
       LIMIT 1`
    )
    .bind(season, matchDate)
    .first<GameRow>();
}

export async function queryGameDateRangeBounds(
  db: D1DatabaseReader,
  dateFrom: string,
  dateTo: string
) {
  return db
    .prepare(
      `SELECT MIN(match_date) AS first_match_date,
              MAX(match_date) AS last_match_date
       FROM Games
       WHERE match_date >= ?
         AND match_date <= ?
         AND LOWER(TRIM(competition)) <> 'friendly'`
    )
    .bind(dateFrom, dateTo)
    .first<GameDateRangeBounds>();
}

export async function queryOnThisDayGameRow(
  db: D1DatabaseReader,
  monthDay: string,
  beforeDate: string
) {
  return db
    .prepare(
      `SELECT ${gameColumns}, referee, ticket
       FROM Games
       WHERE substr(match_date, 6, 5) = ?
         AND match_date < ?
         AND no_programme_issued = 0
       ORDER BY match_date DESC, id ASC
       LIMIT 1`
    )
    .bind(monthDay, beforeDate)
    .first<GameRow>();
}

export async function queryMatchReportRow(
  db: D1DatabaseReader,
  matchDate: string
) {
  return db
    .prepare(`SELECT match_date, report FROM MatchReports WHERE match_date = ?`)
    .bind(matchDate)
    .first<MatchReportRow>();
}
