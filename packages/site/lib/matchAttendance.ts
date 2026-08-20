import {
  queryAttendedMatches,
  queryMatchAttendance,
} from "@tranmere-web/lib/src/d1-queries";
import type { AttendedMatchRow } from "@tranmere-web/lib/src/d1-types";

export { queryAttendedMatches as getAttendedMatches };
export { queryMatchAttendance as getMatchAttendance };

export type AttendanceResult = "W" | "D" | "L";

export function attendanceResult(match: AttendedMatchRow): AttendanceResult {
  const scores = match.full_time_score.match(/(\d+)\D+(\d+)/);
  if (!scores) return "D";
  const home = Number(scores[1]);
  const away = Number(scores[2]);
  if (home === away) return "D";
  const tranmereHome = match.home_team === "Tranmere Rovers";
  return (tranmereHome ? home > away : away > home) ? "W" : "L";
}

export async function saveMatchAttendance(
  db: D1Database,
  accountId: string,
  gameId: string,
) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO MatchAttendances (account_id, game_id, created_at)
       VALUES (?, ?, ?)`,
    )
    .bind(accountId, gameId, new Date().toISOString())
    .run();
  return queryMatchAttendance(db, accountId, gameId);
}

export async function removeMatchAttendance(
  db: D1Database,
  accountId: string,
  gameId: string,
) {
  await db
    .prepare(
      "DELETE FROM MatchAttendances WHERE account_id = ? AND game_id = ?",
    )
    .bind(accountId, gameId)
    .run();
}
