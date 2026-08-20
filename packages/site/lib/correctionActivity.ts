import { ensureAppearanceCorrectionsTable } from "@/lib/appearanceCorrections";
import { ensureAttendanceCorrectionsTable } from "@/lib/attendanceCorrections";
import { ensureFormationCorrectionsTable } from "@/lib/formationCorrections";
import { ensureGoalCorrectionsTable } from "@/lib/goalCorrections";
import { ensureKitCorrectionsTable } from "@/lib/kitCorrections";
import { ensurePlayerProfileCorrectionsTable } from "@/lib/playerProfileCorrections";

export type CorrectionKind =
  "attendance" | "formation" | "player-profile" | "kit" | "goal" | "appearance";

export type CorrectionActivityStatus = "pending" | "approved" | "rejected";

export interface CorrectionActivity {
  id: string;
  contributionKey: string;
  kind: CorrectionKind;
  label: string;
  subject: string;
  submittedAt: string;
  status: CorrectionActivityStatus;
  source: string | null;
  explanation: string | null;
  current: Record<string, unknown>;
  changes: Record<string, unknown>;
  reviewNote: string | null;
  reviewedAt: string | null;
  publicPath: string | null;
}

interface CorrectionActivityRow {
  id: string;
  contribution_key: string;
  kind: CorrectionKind;
  season: string | null;
  match_date: string | null;
  subject: string;
  current_json: string | null;
  changes_json: string | null;
  source: string | null;
  explanation: string | null;
  submitted_at: string;
  status: CorrectionActivityStatus;
  review_note: string | null;
  reviewed_at: string | null;
}

const labels: Record<CorrectionKind, string> = {
  attendance: "Attendance",
  formation: "Formation",
  "player-profile": "Player profile",
  kit: "Match kit",
  goal: "Goal details",
  appearance: "Appearance",
};

const correctionTables: Record<CorrectionKind, string> = {
  attendance: "MatchAttendanceCorrections",
  formation: "MatchFormationCorrections",
  "player-profile": "PlayerProfileCorrections",
  kit: "MatchKitCorrections",
  goal: "GoalCorrections",
  appearance: "AppearanceCorrections",
};

function parseJson(value: string | null) {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function ensureCorrectionActivityTables(db: D1Database) {
  await ensureAttendanceCorrectionsTable(db);
  await ensureFormationCorrectionsTable(db);
  await ensurePlayerProfileCorrectionsTable(db);
  await ensureKitCorrectionsTable(db);
  await ensureGoalCorrectionsTable(db);
  await ensureAppearanceCorrectionsTable(db);
}

const activityQueries = [
  `SELECT id, 'attendance' AS kind,
         'attendance:' || season || ':' || match_date || ':' || proposed_attendance AS contribution_key,
         season, match_date,
         home_team || ' v ' || away_team AS subject,
         json_object('attendance', current_attendance) AS current_json,
         json_object('attendance', proposed_attendance) AS changes_json,
         source, explanation, submitted_at, status, review_note, reviewed_at
  FROM MatchAttendanceCorrections
  WHERE submitted_by_sub = ?`,
  `SELECT id, 'formation' AS kind,
         'formation:' || season || ':' || match_date || ':' || proposed_formation AS contribution_key,
         season, match_date,
         home_team || ' v ' || away_team AS subject,
         json_object('formation', current_formation) AS current_json,
         json_object('formation', proposed_formation) AS changes_json,
         NULL AS source, explanation, submitted_at, status, review_note, reviewed_at
  FROM MatchFormationCorrections
  WHERE submitted_by_sub = ?`,
  `SELECT id, 'player-profile' AS kind,
         'player-profile:' || player_name || ':' || changes_json AS contribution_key,
         NULL AS season, NULL AS match_date, player_name AS subject,
         current_json, changes_json, source, explanation, submitted_at, status,
         review_note, reviewed_at
  FROM PlayerProfileCorrections
  WHERE submitted_by_sub = ?`,
  `SELECT id, 'kit' AS kind,
         'kit:' || season || ':' || match_date || ':' || proposed_kit AS contribution_key,
         season, match_date,
         home_team || ' v ' || away_team AS subject,
         json_object('kit', current_kit) AS current_json,
         json_object('kit', proposed_kit) AS changes_json,
         NULL AS source, explanation, submitted_at, status, review_note, reviewed_at
  FROM MatchKitCorrections
  WHERE submitted_by_sub = ?`,
  `SELECT id, 'goal' AS kind,
         'goal:' || goal_id || ':' || changes_json AS contribution_key,
         season, match_date, opposition AS subject,
         current_json, changes_json, source, explanation, submitted_at, status,
         review_note, reviewed_at
  FROM GoalCorrections
  WHERE submitted_by_sub = ?`,
  `SELECT id, 'appearance' AS kind,
         'appearance:' || appearance_id || ':' || changes_json AS contribution_key,
         season, match_date, opposition AS subject,
         current_json, changes_json, source, explanation, submitted_at, status,
         review_note, reviewed_at
  FROM AppearanceCorrections
  WHERE submitted_by_sub = ?`,
] as const;

const publicContributionQueries = [
  `SELECT c.submitted_by_sub AS auth_sub, up.correction_username AS display_name,
          'attendance:' || c.season || ':' || c.match_date || ':' || c.proposed_attendance AS contribution_key
   FROM MatchAttendanceCorrections c`,
  `SELECT c.submitted_by_sub AS auth_sub, up.correction_username AS display_name,
          'formation:' || c.season || ':' || c.match_date || ':' || c.proposed_formation AS contribution_key
   FROM MatchFormationCorrections c`,
  `SELECT c.submitted_by_sub AS auth_sub, up.correction_username AS display_name,
          'player-profile:' || c.player_name || ':' || c.changes_json AS contribution_key
   FROM PlayerProfileCorrections c`,
  `SELECT c.submitted_by_sub AS auth_sub, up.correction_username AS display_name,
          'kit:' || c.season || ':' || c.match_date || ':' || c.proposed_kit AS contribution_key
   FROM MatchKitCorrections c`,
  `SELECT c.submitted_by_sub AS auth_sub, up.correction_username AS display_name,
          'goal:' || c.goal_id || ':' || c.changes_json AS contribution_key
   FROM GoalCorrections c`,
  `SELECT c.submitted_by_sub AS auth_sub, up.correction_username AS display_name,
          'appearance:' || c.appearance_id || ':' || c.changes_json AS contribution_key
   FROM AppearanceCorrections c`,
] as const;

export async function getCorrectionActivity(db: D1Database, authSub: string) {
  await ensureCorrectionActivityTables(db);
  const queryResults = await db.batch(
    activityQueries.map((query) => db.prepare(query).bind(authSub)),
  );
  const results = queryResults
    .flatMap(
      (result) => (result.results ?? []) as unknown as CorrectionActivityRow[],
    )
    .sort((left, right) => right.submitted_at.localeCompare(left.submitted_at));

  return results.map((row) => {
    const current = parseJson(row.current_json);
    const subject =
      row.kind === "goal" && typeof current.scorer === "string"
        ? `${current.scorer} v ${row.subject}`
        : row.kind === "appearance" && typeof current.playerName === "string"
          ? `${current.playerName} v ${row.subject}`
          : row.subject;
    const publicPath =
      row.status !== "approved"
        ? null
        : row.kind === "player-profile"
          ? `/page/player/${encodeURIComponent(row.subject)}`
          : row.season && row.match_date
            ? `/match/${row.season}/${row.match_date}`
            : null;
    return {
      id: row.id,
      contributionKey: row.contribution_key,
      kind: row.kind,
      label: labels[row.kind],
      subject,
      submittedAt: row.submitted_at,
      status: row.status,
      source: row.source,
      explanation: row.explanation,
      current,
      changes: parseJson(row.changes_json),
      reviewNote: row.review_note,
      reviewedAt: row.reviewed_at,
      publicPath,
    };
  });
}

export async function withdrawCorrection(
  db: D1Database,
  authSub: string,
  kind: CorrectionKind,
  id: string,
) {
  const table = correctionTables[kind];
  if (!table) return false;
  await ensureCorrectionActivityTables(db);
  const result = await db
    .prepare(
      `DELETE FROM ${table}
       WHERE id = ? AND submitted_by_sub = ? AND status = 'pending'`,
    )
    .bind(id, authSub)
    .run();
  return Boolean(result.meta.changes);
}

export async function getPublicContributors(db: D1Database) {
  await ensureCorrectionActivityTables(db);
  const queryResults = await db.batch(
    publicContributionQueries.map((query) =>
      db.prepare(
        `${query}
         INNER JOIN UserProfiles up ON up.auth_sub = c.submitted_by_sub
         WHERE c.status = 'approved'
           AND up.correction_recognition_visible = 1
           AND up.correction_username IS NOT NULL`,
      ),
    ),
  );
  const rows = queryResults.flatMap(
    (result) =>
      (result.results ?? []) as unknown as Array<{
        auth_sub: string;
        display_name: string;
        contribution_key: string;
      }>,
  );
  const contributors = new Map<
    string,
    { auth_sub: string; display_name: string; keys: Set<string> }
  >();
  for (const row of rows) {
    const contributor = contributors.get(row.auth_sub) ?? {
      auth_sub: row.auth_sub,
      display_name: row.display_name,
      keys: new Set<string>(),
    };
    contributor.display_name = row.display_name;
    contributor.keys.add(row.contribution_key);
    contributors.set(row.auth_sub, contributor);
  }
  return Array.from(contributors.values(), (contributor) => ({
    auth_sub: contributor.auth_sub,
    display_name: contributor.display_name,
    approved_count: contributor.keys.size,
  })).sort((left, right) =>
    left.display_name.localeCompare(right.display_name, "en-GB", {
      sensitivity: "base",
    }),
  );
}
