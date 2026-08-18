import type { AttendedMatchRow, MatchAttendanceRow } from '../d1-types';
import type { D1DatabaseReader } from './shared';

export async function queryMatchAttendance(
  db: D1DatabaseReader,
  authSub: string,
  gameId: string
) {
  return db
    .prepare(
      `SELECT auth_sub, game_id, created_at
       FROM MatchAttendances
       WHERE auth_sub = ? AND game_id = ?`
    )
    .bind(authSub, gameId)
    .first<MatchAttendanceRow>();
}

export async function queryAttendedMatches(
  db: D1DatabaseReader,
  authSub: string
) {
  const result = await db
    .prepare(
      `SELECT ma.auth_sub, ma.game_id, ma.created_at,
              g.season, g.match_date, g.competition, g.home_team, g.away_team,
              g.opposition, g.venue, g.full_time_score, g.neutral
       FROM MatchAttendances ma
       JOIN Games g ON g.id = ma.game_id
       WHERE ma.auth_sub = ?
       ORDER BY g.match_date ASC, g.id ASC`
    )
    .bind(authSub)
    .all<AttendedMatchRow>();
  return result.results;
}
