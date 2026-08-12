import type {
  ClubRow,
  LeagueSeasonSummaryRow,
  ManagerRow,
  PlayerRow,
  ProgrammeRow,
  SearchIndexClubRow,
  SearchIndexPlayerRow,
  TransferRow
} from '../d1-types';
import { all, withLimit, type D1DatabaseReader, type D1Value } from './shared';

export interface QueryOptions {
  query?: string;
  sort?: 'name' | 'oldest-updated';
  limit?: number;
  offset?: number;
}

export interface TransferQueryOptions {
  player?: string;
  playerMatch?: 'exact' | 'contains';
  club?: string;
  season?: number;
  direction?: 'In' | 'Out';
  sort?: 'date-desc' | 'fee-desc';
  limit?: number;
  offset?: number;
}

export interface LeagueSeasonSummaryQueryOptions {
  season?: number;
}

export async function queryPlayerRows(
  db: D1DatabaseReader,
  options: QueryOptions = {}
) {
  const values: D1Value[] = [];
  const where = options.query ? 'WHERE name LIKE ?' : '';
  if (options.query) values.push(`%${options.query}%`);
  const orderBy =
    options.sort === 'oldest-updated'
      ? 'updated_at ASC, name ASC, id ASC'
      : 'name ASC, id ASC';
  const sql = withLimit(
    `SELECT id, name, date_of_birth, biography_markdown, pic_link, foot, height,
            place_of_birth, position, secondary_position, links_json, updated_at
     FROM Players
     ${where}
     ORDER BY ${orderBy}`,
    values,
    options.limit,
    options.offset
  );
  return (await all<PlayerRow>(db, sql, values)).results;
}

export async function countPlayerRows(
  db: D1DatabaseReader,
  options: Pick<QueryOptions, 'query'> = {}
) {
  const values: D1Value[] = [];
  const where = options.query ? 'WHERE name LIKE ?' : '';
  if (options.query) values.push(`%${options.query}%`);
  const result = await all<{ count: number }>(
    db,
    `SELECT COUNT(*) AS count FROM Players ${where}`,
    values
  );
  return result.results[0]?.count ?? 0;
}

export async function queryClubRows(
  db: D1DatabaseReader,
  options: QueryOptions = {}
) {
  const values: D1Value[] = [];
  const where = options.query
    ? 'WHERE name LIKE ? OR short_name LIKE ? OR nicknames LIKE ?'
    : '';
  if (options.query) {
    const pattern = `%${options.query}%`;
    values.push(pattern, pattern, pattern);
  }
  const sql = withLimit(
    `SELECT id, name, short_name, three_letter_name, nicknames,
            primary_colour, secondary_colour, highest_division,
            latitude, longitude
     FROM Clubs
     ${where}
     ORDER BY name ASC`,
    values,
    options.limit
  );
  return (await all<ClubRow>(db, sql, values)).results;
}

export async function querySearchIndexPlayerRows(db: D1DatabaseReader) {
  return (
    await all<SearchIndexPlayerRow>(
      db,
      `SELECT id, name, pic_link FROM Players ORDER BY name ASC, id ASC`,
      []
    )
  ).results;
}

export async function querySearchIndexClubRows(db: D1DatabaseReader) {
  return (
    await all<SearchIndexClubRow>(
      db,
      `SELECT id, name FROM Clubs ORDER BY name ASC, id ASC`,
      []
    )
  ).results;
}

export async function queryTransferRows(
  db: D1DatabaseReader,
  options: TransferQueryOptions = {}
) {
  const conditions: string[] = [];
  const values: D1Value[] = [];
  if (options.player) {
    conditions.push(
      options.playerMatch === 'exact' ? 'player_name = ?' : 'player_name LIKE ?'
    );
    values.push(
      options.playerMatch === 'exact' ? options.player : `%${options.player}%`
    );
  }
  if (options.season !== undefined) {
    conditions.push('season = ?');
    values.push(options.season);
  }
  if (options.direction === 'In') {
    conditions.push('to_club = ?');
    values.push('Tranmere Rovers');
    if (options.club) {
      conditions.push('from_club = ?');
      values.push(options.club);
    }
  } else if (options.direction === 'Out') {
    conditions.push('from_club = ?');
    values.push('Tranmere Rovers');
    if (options.club) {
      conditions.push('to_club = ?');
      values.push(options.club);
    }
  } else if (options.club) {
    conditions.push('(from_club = ? OR to_club = ?)');
    values.push(options.club, options.club);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy =
    options.sort === 'fee-desc'
      ? 'cost DESC, season DESC, transfer_date DESC, player_name ASC'
      : 'season DESC, transfer_date DESC, cost DESC, player_name ASC';
  const sql = withLimit(
    `SELECT id, player_name, season, from_club, to_club, fee_description, cost,
            transfer_date
     FROM Transfers
     ${where}
     ORDER BY ${orderBy}`,
    values,
    options.limit,
    options.offset
  );
  return (await all<TransferRow>(db, sql, values)).results;
}

export async function queryManagerRows(
  db: D1DatabaseReader,
  options: QueryOptions = {}
) {
  const values: D1Value[] = [];
  const where = options.query ? 'WHERE name LIKE ?' : '';
  if (options.query) values.push(`%${options.query}%`);
  const sql = withLimit(
    `SELECT id, name, date_joined, date_left, image_path, favourite_formation
     FROM Managers
     ${where}
     ORDER BY date_joined DESC, name ASC`,
    values,
    options.limit
  );
  return (await all<ManagerRow>(db, sql, values)).results;
}

export async function queryManagerAtDateRow(
  db: D1DatabaseReader,
  matchDate: string
) {
  const date = matchDate.slice(0, 10);
  return db
    .prepare(
      `SELECT id, name, date_joined, date_left, image_path, favourite_formation
       FROM Managers
       WHERE date_joined <= ?
         AND (lower(date_left) IN ('now', 'now()', 'present') OR date_left >= ?)
       ORDER BY date_joined DESC
       LIMIT 1`
    )
    .bind(date, date)
    .first<ManagerRow>();
}

export async function queryProgrammeRows(
  db: D1DatabaseReader,
  options: QueryOptions = {}
) {
  const values: D1Value[] = [];
  const where = options.query ? 'WHERE match_name LIKE ?' : '';
  if (options.query) values.push(`%${options.query}%`);
  const sql = withLimit(
    `SELECT url, match_name, match_date, pages
     FROM Programmes
     ${where}
     ORDER BY match_date DESC, match_name ASC`,
    values,
    options.limit
  );
  return (await all<ProgrammeRow>(db, sql, values)).results;
}

export async function queryLeagueSeasonSummaryRows(
  db: D1DatabaseReader,
  options: LeagueSeasonSummaryQueryOptions = {}
) {
  const values: D1Value[] = [];
  const where = options.season === undefined ? '' : 'WHERE season = ?';
  if (options.season !== undefined) values.push(options.season);
  return (
    await all<LeagueSeasonSummaryRow>(
      db,
      `SELECT season, division, final_league_position, wins, draws, losses, goals_for,
              goals_against, points
       FROM LeagueSeasonSummaries
       ${where}
       ORDER BY season DESC`,
      values
    )
  ).results;
}
