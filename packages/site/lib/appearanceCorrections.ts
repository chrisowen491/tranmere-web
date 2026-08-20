export type AppearanceCorrectionStatus = "pending" | "approved" | "rejected";

export interface EditableAppearance {
  playerName?: string;
  shirtNumber?: string;
  yellowCard?: boolean;
  redCard?: boolean;
  substitutedBy?: string;
  substituteTime?: string;
  substituteYellowCard?: boolean;
  substituteRedCard?: boolean;
}

export interface AppearanceCorrection {
  id: string;
  appearanceId: string;
  season: string;
  matchDate: string;
  opposition: string;
  current: EditableAppearance;
  changes: EditableAppearance;
  source: string | null;
  explanation: string | null;
  submittedByName: string;
  submittedAt: string;
}

interface DBAppearanceCorrection {
  id: string;
  appearance_id: string;
  season: string;
  match_date: string;
  opposition: string;
  current_json: string;
  changes_json: string;
  source: string | null;
  explanation: string | null;
  submitted_by_name: string;
  submitted_at: string;
}

export const editableAppearanceLabels: Record<
  keyof EditableAppearance,
  string
> = {
  playerName: "Player",
  shirtNumber: "Shirt number",
  yellowCard: "Yellow card",
  redCard: "Red card",
  substitutedBy: "Replacement",
  substituteTime: "Substitution time",
  substituteYellowCard: "Replacement yellow card",
  substituteRedCard: "Replacement red card",
};

export function parseEditableAppearance(value: string): EditableAppearance {
  try {
    return JSON.parse(value) as EditableAppearance;
  } catch {
    return {};
  }
}

export async function ensureAppearanceCorrectionsTable(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS AppearanceCorrections (
      id TEXT NOT NULL PRIMARY KEY,
      appearance_id TEXT NOT NULL,
      season TEXT NOT NULL,
      match_date TEXT NOT NULL,
      opposition TEXT NOT NULL,
      current_json TEXT NOT NULL,
      changes_json TEXT NOT NULL,
      source TEXT,
      explanation TEXT,
      submitted_by_sub TEXT NOT NULL,
      submitted_by_name TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      reviewed_by TEXT,
      reviewed_at TEXT,
      review_note TEXT
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS AppearanceCorrections_status_idx
      ON AppearanceCorrections (status, submitted_at)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS AppearanceCorrections_appearance_idx
      ON AppearanceCorrections (appearance_id, status)`),
  ]);
}

export async function getAppearanceCorrections(
  db: D1Database,
  status?: AppearanceCorrectionStatus,
) {
  await ensureAppearanceCorrectionsTable(db);
  const statement = status
    ? db
        .prepare(
          "SELECT * FROM AppearanceCorrections WHERE status = ? ORDER BY submitted_at ASC",
        )
        .bind(status)
    : db.prepare(
        "SELECT * FROM AppearanceCorrections ORDER BY submitted_at DESC",
      );
  const { results } = await statement.all<DBAppearanceCorrection>();
  return results.map((row) => ({
    id: row.id,
    appearanceId: row.appearance_id,
    season: row.season,
    matchDate: row.match_date,
    opposition: row.opposition,
    current: parseEditableAppearance(row.current_json),
    changes: parseEditableAppearance(row.changes_json),
    source: row.source,
    explanation: row.explanation,
    submittedByName: row.submitted_by_name,
    submittedAt: row.submitted_at,
  }));
}
