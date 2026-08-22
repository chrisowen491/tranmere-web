export type AppearanceCorrectionStatus = "pending" | "approved" | "rejected";

export interface EditableAppearance {
  playerName?: string;
  shirtNumber?: string;
  yellowCard?: boolean;
  redCard?: boolean;
  substitutedBy?: string;
  substituteSubstitutedBy?: string;
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

export function isNewAppearanceCorrection(appearanceId: string) {
  return appearanceId.startsWith("new:");
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
  substituteSubstitutedBy: "Replacement then replaced by",
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

export async function getAppearanceCorrections(
  db: D1Database,
  status?: AppearanceCorrectionStatus,
) {
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
