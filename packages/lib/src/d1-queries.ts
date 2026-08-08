import type {
  ClubRow,
  GameRow,
  ManagerRow,
  MatchReportRow,
  PlayerRow,
  ProgrammeRow,
  TransferRow
} from './d1-types';

type D1Value = string | number | null;

interface D1Result<T> {
  results: T[];
}

interface D1PreparedStatement {
  bind(...values: D1Value[]): D1PreparedStatement;
  all<T>(): Promise<D1Result<T>>;
  first<T>(): Promise<T | null>;
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
  sort?: 'date-desc' | 'fee-desc';
  limit?: number;
}

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
  includeKit?: boolean;
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
            place_of_birth, position, secondary_position, links_json
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
         AND (
           lower(date_left) IN ('now', 'now()', 'present')
           OR date_left >= ?
         )
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
  if (options.penalties) {
    // The historic import stores the complete shootout outcome, for example
    // "Tranmere Rovers win 4-2 on penalties", rather than a fixed label.
    // "Penalty Shootout" is the UI's archive-filter value.
    if (options.penalties === 'Penalty Shootout') {
      conditions.push("penalties IS NOT NULL AND TRIM(penalties) <> ''");
    } else {
      conditions.push('penalties = ?');
      values.push(options.penalties);
    }
  }
  if (options.dateFrom) {
    conditions.push('match_date >= ?');
    values.push(options.dateFrom);
  }
  if (options.dateTo) {
    conditions.push('match_date <= ?');
    values.push(options.dateTo);
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
        `SELECT id, season, match_date, competition, round, home_team, away_team,
              opposition, venue, attendance, full_time_score, home_goals, away_goals,
              division, tier, leg, tie, neutral, after_extra_time, penalties,
              programme_path, formation${kitColumn}, referee, ticket
       FROM Games
       ${where}
       ORDER BY ${orderBy}, id ASC`,
        values,
        options.limit
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
      `SELECT id, season, match_date, competition, round, home_team, away_team,
              opposition, venue, attendance, full_time_score, home_goals, away_goals,
              division, tier, leg, tie, neutral, after_extra_time, penalties,
              programme_path, formation, kit, referee, ticket
       FROM Games
       WHERE season = ? AND match_date = ?
       ORDER BY id ASC
       LIMIT 1`
    )
    .bind(season, matchDate)
    .first<GameRow>();
}

export async function queryOnThisDayGameRow(
  db: D1DatabaseReader,
  monthDay: string,
  beforeDate: string
) {
  return db
    .prepare(
      `SELECT id, season, match_date, competition, round, home_team, away_team,
              opposition, venue, attendance, full_time_score, home_goals, away_goals,
              division, tier, leg, tie, neutral, after_extra_time, penalties,
              programme_path, formation, referee, ticket
       FROM Games
       WHERE substr(match_date, 6, 5) = ?
         AND match_date < ?
         AND programme_path IS NOT NULL
         AND trim(programme_path) <> ''
         AND programme_path <> '#N/A'
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
    .prepare(
      `SELECT match_date, report
       FROM MatchReports
       WHERE match_date = ?`
    )
    .bind(matchDate)
    .first<MatchReportRow>();
}
