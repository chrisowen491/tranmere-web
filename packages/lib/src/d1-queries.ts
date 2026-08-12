import type {
  AppRow,
  ClubRow,
  GameRow,
  GoalRow,
  HatTrickRow,
  LeagueSeasonSummaryRow,
  ManagerRow,
  MatchReportRow,
  PlayerAppearanceRow,
  PlayerMilestoneRow,
  PlayerRow,
  PlayerSeasonSummaryRow,
  ProgrammeRow,
  SearchIndexClubRow,
  SearchIndexPlayerRow,
  SearchIndexSeasonRow,
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
}

export interface LeagueSeasonSummaryQueryOptions {
  season?: number;
}

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

function withLimit(
  sql: string,
  values: D1Value[],
  limit?: number,
  offset?: number
) {
  if (limit === undefined) return sql;
  values.push(limit);
  if (offset === undefined) return `${sql}\nLIMIT ?`;
  values.push(offset);
  return `${sql}\nLIMIT ? OFFSET ?`;
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
  if (options.query) values.push('%' + options.query + '%');

  const result = await all<{ count: number }>(
    db,
    'SELECT COUNT(*) AS count FROM Players ' + where,
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

export async function querySearchIndexPlayerRows(db: D1DatabaseReader) {
  return (
    await all<SearchIndexPlayerRow>(
      db,
      `SELECT id, name, pic_link
       FROM Players
       ORDER BY name ASC, id ASC`,
      []
    )
  ).results;
}

export async function querySearchIndexClubRows(db: D1DatabaseReader) {
  return (
    await all<SearchIndexClubRow>(
      db,
      `SELECT id, name
       FROM Clubs
       ORDER BY name ASC, id ASC`,
      []
    )
  ).results;
}

export async function querySearchIndexSeasonRows(db: D1DatabaseReader) {
  return (
    await all<SearchIndexSeasonRow>(
      db,
      `SELECT DISTINCT season
       FROM Games
       ORDER BY season ASC`,
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
        options.limit,
        options.offset
      ),
      values
    )
  ).results;
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

export async function queryHatTrickRows(
  db: D1DatabaseReader,
  options: HatTrickQueryOptions = {}
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

export async function queryPlayerSeasonSummaryRows(
  db: D1DatabaseReader,
  options: PlayerSeasonSummaryQueryOptions = {}
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
  if (options.onlyOneAppearance) {
    conditions.push('appearances = 1');
  }

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

  if (options.player) {
    conditions.push(
      options.playerMatch === 'exact' ? 'player_name = ?' : 'player_name LIKE ?'
    );
    values.push(
      options.playerMatch === 'exact' ? options.player : `%${options.player}%`
    );
  }
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

  if (options.scorer) {
    conditions.push(
      options.scorerMatch === 'exact' ? 'scorer = ?' : 'scorer LIKE ?'
    );
    values.push(
      options.scorerMatch === 'exact' ? options.scorer : `%${options.scorer}%`
    );
  }
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
