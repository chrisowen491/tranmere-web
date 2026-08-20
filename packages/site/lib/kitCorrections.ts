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

export async function getKitCorrections(
  db: D1Database,
  status?: KitCorrectionStatus,
) {
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
