import type { ClubRow, ManagerRow, PlayerRow, TransferRow } from './d1-types';

type D1Value = string | number | null;

interface D1Result<T> {
  results: T[];
}

interface D1PreparedStatement {
  bind(...values: D1Value[]): D1PreparedStatement;
  all<T>(): Promise<D1Result<T>>;
}

export interface D1DatabaseReader {
  prepare(query: string): D1PreparedStatement;
}

export interface QueryOptions {
  query?: string;
  limit?: number;
}

export interface TransferQueryOptions {
  player?: string;
  playerMatch?: 'exact' | 'contains';
  club?: string;
  season?: number;
  direction?: 'In' | 'Out';
  limit?: number;
}

function withLimit(sql: string, values: D1Value[], limit?: number) {
  if (limit === undefined) return sql;
  values.push(limit);
  return `${sql}\nLIMIT ?`;
}

async function all<T>(db: D1DatabaseReader, sql: string, values: D1Value[]) {
  const statement = db.prepare(sql);
  return (values.length ? statement.bind(...values) : statement).all<T>();
}

export async function queryPlayerRows(
  db: D1DatabaseReader,
  options: QueryOptions = {}
) {
  const values: D1Value[] = [];
  const where = options.query ? 'WHERE name LIKE ?' : '';
  if (options.query) values.push(`%${options.query}%`);

  const sql = withLimit(
    `SELECT id, name, date_of_birth, biography_markdown, pic_link, foot, height,
            place_of_birth, position, links_json
     FROM Players
     ${where}
     ORDER BY name ASC, id ASC`,
    values,
    options.limit
  );

  return (await all<PlayerRow>(db, sql, values)).results;
}

export async function queryClubRows(
  db: D1DatabaseReader,
  options: QueryOptions = {}
) {
  const values: D1Value[] = [];
  const where = options.query
    ? `WHERE name LIKE ? OR short_name LIKE ? OR nicknames LIKE ?`
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
  const sql = withLimit(
    `SELECT id, player_name, season, from_club, to_club, fee_description, cost,
            transfer_date
     FROM Transfers
     ${where}
     ORDER BY season DESC, transfer_date DESC, cost DESC, player_name ASC`,
    values,
    options.limit
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
    `SELECT id, name, date_joined, date_left, programme_path, image_path
     FROM Managers
     ${where}
     ORDER BY date_joined DESC, name ASC`,
    values,
    options.limit
  );

  return (await all<ManagerRow>(db, sql, values)).results;
}
