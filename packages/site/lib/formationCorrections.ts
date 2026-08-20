import {
  MANAGER_FORMATIONS,
  type ManagerFormation,
} from "@tranmere-web/lib/src/manager-constants";

export type FormationCorrectionStatus = "pending" | "approved" | "rejected";

export interface FormationCorrection {
  id: string;
  season: string;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  currentFormation: string | null;
  proposedFormation: ManagerFormation;
  explanation: string | null;
  submittedByName: string;
  submittedAt: string;
}

interface DBFormationCorrection extends Omit<
  FormationCorrection,
  | "matchDate"
  | "homeTeam"
  | "awayTeam"
  | "currentFormation"
  | "proposedFormation"
  | "submittedByName"
  | "submittedAt"
> {
  match_date: string;
  home_team: string;
  away_team: string;
  current_formation: string | null;
  proposed_formation: ManagerFormation;
  submitted_by_name: string;
  submitted_at: string;
}

export function isFormation(value: string): value is ManagerFormation {
  return (MANAGER_FORMATIONS as readonly string[]).includes(value);
}

export async function ensureFormationCorrectionsTable(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS MatchFormationCorrections (
      id TEXT NOT NULL PRIMARY KEY,
      season TEXT NOT NULL,
      match_date TEXT NOT NULL,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      current_formation TEXT,
      proposed_formation TEXT NOT NULL,
      explanation TEXT,
      submitted_by_account_id TEXT NOT NULL,
      submitted_by_name TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      reviewed_by TEXT,
      reviewed_at TEXT,
      review_note TEXT
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS MatchFormationCorrections_status_idx
      ON MatchFormationCorrections (status, submitted_at)`),
  ]);
}

export async function getFormationCorrections(
  db: D1Database,
  status?: FormationCorrectionStatus,
) {
  await ensureFormationCorrectionsTable(db);
  const statement = status
    ? db
        .prepare(
          "SELECT * FROM MatchFormationCorrections WHERE status = ? ORDER BY submitted_at ASC",
        )
        .bind(status)
    : db.prepare(
        "SELECT * FROM MatchFormationCorrections ORDER BY submitted_at DESC",
      );
  const { results } = await statement.all<DBFormationCorrection>();
  return results.map((row) => ({
    id: row.id,
    season: row.season,
    matchDate: row.match_date,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    currentFormation: row.current_formation,
    proposedFormation: row.proposed_formation,
    explanation: row.explanation,
    submittedByName: row.submitted_by_name,
    submittedAt: row.submitted_at,
  }));
}
