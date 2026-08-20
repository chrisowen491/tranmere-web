import {
  AVATAR_KIT_OPTIONS,
  type AvatarKit,
} from "@tranmere-web/lib/src/avatar-kit-constants";

export type KitCorrectionStatus = "pending" | "approved" | "rejected";

export interface KitCorrection {
  id: string;
  season: string;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  currentKit: string | null;
  proposedKit: AvatarKit;
  explanation: string | null;
  submittedByName: string;
  submittedAt: string;
}

interface DBKitCorrection {
  id: string;
  season: string;
  match_date: string;
  home_team: string;
  away_team: string;
  current_kit: string | null;
  proposed_kit: AvatarKit;
  explanation: string | null;
  submitted_by_name: string;
  submitted_at: string;
}

export function isAvatarKit(value: string): value is AvatarKit {
  return AVATAR_KIT_OPTIONS.some((option) => option.value === value);
}

export function kitLabel(value?: string | null) {
  return (
    AVATAR_KIT_OPTIONS.find((option) => option.value === value)?.label ??
    value ??
    "Season default"
  );
}

export async function ensureKitCorrectionsTable(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS MatchKitCorrections (
      id TEXT NOT NULL PRIMARY KEY,
      season TEXT NOT NULL,
      match_date TEXT NOT NULL,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      current_kit TEXT,
      proposed_kit TEXT NOT NULL,
      explanation TEXT,
      submitted_by_account_id TEXT NOT NULL,
      submitted_by_name TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      reviewed_by TEXT,
      reviewed_at TEXT,
      review_note TEXT
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS MatchKitCorrections_status_idx
      ON MatchKitCorrections (status, submitted_at)`),
  ]);
}

export async function getKitCorrections(
  db: D1Database,
  status?: KitCorrectionStatus,
) {
  await ensureKitCorrectionsTable(db);
  const statement = status
    ? db
        .prepare(
          "SELECT * FROM MatchKitCorrections WHERE status = ? ORDER BY submitted_at ASC",
        )
        .bind(status)
    : db.prepare(
        "SELECT * FROM MatchKitCorrections ORDER BY submitted_at DESC",
      );
  const { results } = await statement.all<DBKitCorrection>();
  return results.map((row) => ({
    id: row.id,
    season: row.season,
    matchDate: row.match_date,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    currentKit: row.current_kit,
    proposedKit: row.proposed_kit,
    explanation: row.explanation,
    submittedByName: row.submitted_by_name,
    submittedAt: row.submitted_at,
  }));
}
