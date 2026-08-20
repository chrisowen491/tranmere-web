import type { AttendedMatchRow, MatchAttendanceRow } from '../d1-types';
import type { D1DatabaseReader } from './shared';

export async function queryMatchAttendance(
  db: D1DatabaseReader,
  accountId: string,
  gameId: string
) {
  return db
    .prepare(
      `SELECT account_id, game_id, created_at
       FROM MatchAttendances
       WHERE account_id = ? AND game_id = ?`
    )
    .bind(accountId, gameId)
    .first<MatchAttendanceRow>();
}

export async function queryAttendedMatches(
  db: D1DatabaseReader,
  accountId: string
) {
  const result = await db
    .prepare(
      `SELECT ma.account_id, ma.game_id, ma.created_at,
              g.season, g.match_date, g.competition, g.home_team, g.away_team,
              g.opposition, g.venue, g.full_time_score, g.neutral
       FROM MatchAttendances ma
       JOIN Games g ON g.id = ma.game_id
       WHERE ma.account_id = ?
       ORDER BY g.match_date ASC, g.id ASC`
    )
    .bind(accountId)
    .all<AttendedMatchRow>();
  return result.results;
}
