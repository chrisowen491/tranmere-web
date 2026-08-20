export type AttendanceCorrectionStatus = "pending" | "approved" | "rejected";

export interface AttendanceCorrection {
  id: string;
  season: string;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  currentAttendance: number | null;
  proposedAttendance: number;
  source: string;
  explanation: string | null;
  submittedByAccountId: string;
  submittedByName: string;
  submittedByEmail: string | null;
  submittedAt: string;
  status: AttendanceCorrectionStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

interface DBAttendanceCorrection {
  id: string;
  season: string;
  match_date: string;
  home_team: string;
  away_team: string;
  current_attendance: number | null;
  proposed_attendance: number;
  source: string;
  explanation: string | null;
  submitted_by_account_id: string;
  submitted_by_name: string;
  submitted_by_email: string | null;
  submitted_at: string;
  status: AttendanceCorrectionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

function mapCorrection(row: DBAttendanceCorrection): AttendanceCorrection {
  return {
    id: row.id,
    season: row.season,
    matchDate: row.match_date,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    currentAttendance: row.current_attendance,
    proposedAttendance: row.proposed_attendance,
    source: row.source,
    explanation: row.explanation,
    submittedByAccountId: row.submitted_by_account_id,
    submittedByName: row.submitted_by_name,
    submittedByEmail: row.submitted_by_email,
    submittedAt: row.submitted_at,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    reviewNote: row.review_note,
  };
}

export async function getApprovedAttendance(
  db: D1Database,
  season: string,
  matchDate: string,
) {
  const result = await db
    .prepare(
      `SELECT proposed_attendance
       FROM MatchAttendanceCorrections
       WHERE season = ? AND match_date = ? AND status = 'approved'
       ORDER BY reviewed_at DESC
       LIMIT 1`,
    )
    .bind(season, matchDate)
    .first<{ proposed_attendance: number }>();

  return result?.proposed_attendance ?? null;
}

export async function getAttendanceCorrections(
  db: D1Database,
  status?: AttendanceCorrectionStatus,
) {
  const query = status
    ? db
        .prepare(
          `SELECT * FROM MatchAttendanceCorrections
           WHERE status = ?
           ORDER BY submitted_at ASC`,
        )
        .bind(status)
    : db.prepare(
        `SELECT * FROM MatchAttendanceCorrections
         ORDER BY submitted_at DESC`,
      );
  const result = await query.all<DBAttendanceCorrection>();
  return result.results.map(mapCorrection);
}
