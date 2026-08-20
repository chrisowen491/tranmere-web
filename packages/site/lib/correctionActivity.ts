export type CorrectionKind =
  | "attendance"
  | "formation"
  | "player-profile"
  | "kit"
  | "goal"
  | "goal-submission"
  | "appearance";

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
  "goal-submission": "Missing goal",
  appearance: "Appearance",
};

const correctionTables: Record<CorrectionKind, string> = {
  attendance: "MatchAttendanceCorrections",
  formation: "MatchFormationCorrections",
  "player-profile": "PlayerProfileCorrections",
  kit: "MatchKitCorrections",
  goal: "GoalCorrections",
  "goal-submission": "GoalSubmissions",
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

const activityQueries = [
  `SELECT id, 'attendance' AS kind,
         'attendance:' || season || ':' || match_date || ':' || proposed_attendance AS contribution_key,
         season, match_date,
         home_team || ' v ' || away_team AS subject,
         json_object('attendance', current_attendance) AS current_json,
         json_object('attendance', proposed_attendance) AS changes_json,
         source, explanation, submitted_at, status, review_note, reviewed_at
  FROM MatchAttendanceCorrections
  WHERE submitted_by_account_id = ?`,
  `SELECT id, 'formation' AS kind,
         'formation:' || season || ':' || match_date || ':' || proposed_formation AS contribution_key,
         season, match_date,
         home_team || ' v ' || away_team AS subject,
         json_object('formation', current_formation) AS current_json,
         json_object('formation', proposed_formation) AS changes_json,
         NULL AS source, explanation, submitted_at, status, review_note, reviewed_at
  FROM MatchFormationCorrections
  WHERE submitted_by_account_id = ?`,
  `SELECT id, 'player-profile' AS kind,
         'player-profile:' || player_name || ':' || changes_json AS contribution_key,
         NULL AS season, NULL AS match_date, player_name AS subject,
         current_json, changes_json, source, explanation, submitted_at, status,
         review_note, reviewed_at
  FROM PlayerProfileCorrections
  WHERE submitted_by_account_id = ?`,
  `SELECT id, 'kit' AS kind,
         'kit:' || season || ':' || match_date || ':' || proposed_kit AS contribution_key,
         season, match_date,
         home_team || ' v ' || away_team AS subject,
         json_object('kit', current_kit) AS current_json,
         json_object('kit', proposed_kit) AS changes_json,
         NULL AS source, explanation, submitted_at, status, review_note, reviewed_at
  FROM MatchKitCorrections
  WHERE submitted_by_account_id = ?`,
  `SELECT id, 'goal' AS kind,
         'goal:' || goal_id || ':' || changes_json AS contribution_key,
         season, match_date, opposition AS subject,
         current_json, changes_json, source, explanation, submitted_at, status,
         review_note, reviewed_at
  FROM GoalCorrections
  WHERE submitted_by_account_id = ?`,
  `SELECT id, 'appearance' AS kind,
         'appearance:' || appearance_id || ':' || changes_json AS contribution_key,
         season, match_date, opposition AS subject,
         current_json, changes_json, source, explanation, submitted_at, status,
         review_note, reviewed_at
  FROM AppearanceCorrections
  WHERE submitted_by_account_id = ?`,
  `SELECT id, 'goal-submission' AS kind,
         'goal-submission:' || season || ':' || match_date || ':' || goal_json AS contribution_key,
         season, match_date, opposition AS subject,
         '{}' AS current_json, goal_json AS changes_json, source, explanation,
         submitted_at, status, review_note, reviewed_at
   FROM GoalSubmissions
   WHERE submitted_by_account_id = ?`,
] as const;

const publicContributionQueries = [
  `SELECT c.submitted_by_account_id AS account_id, up.correction_username AS display_name, up.avatar_url,
          'attendance:' || c.season || ':' || c.match_date || ':' || c.proposed_attendance AS contribution_key
   FROM MatchAttendanceCorrections c`,
  `SELECT c.submitted_by_account_id AS account_id, up.correction_username AS display_name, up.avatar_url,
          'formation:' || c.season || ':' || c.match_date || ':' || c.proposed_formation AS contribution_key
   FROM MatchFormationCorrections c`,
  `SELECT c.submitted_by_account_id AS account_id, up.correction_username AS display_name, up.avatar_url,
          'player-profile:' || c.player_name || ':' || c.changes_json AS contribution_key
   FROM PlayerProfileCorrections c`,
  `SELECT c.submitted_by_account_id AS account_id, up.correction_username AS display_name, up.avatar_url,
          'kit:' || c.season || ':' || c.match_date || ':' || c.proposed_kit AS contribution_key
   FROM MatchKitCorrections c`,
  `SELECT c.submitted_by_account_id AS account_id, up.correction_username AS display_name, up.avatar_url,
          'goal:' || c.goal_id || ':' || c.changes_json AS contribution_key
   FROM GoalCorrections c`,
  `SELECT c.submitted_by_account_id AS account_id, up.correction_username AS display_name, up.avatar_url,
          'appearance:' || c.appearance_id || ':' || c.changes_json AS contribution_key
   FROM AppearanceCorrections c`,
  `SELECT c.submitted_by_account_id AS account_id, up.correction_username AS display_name, up.avatar_url,
          'goal-submission:' || c.season || ':' || c.match_date || ':' || c.goal_json AS contribution_key
   FROM GoalSubmissions c`,
] as const;

export async function getCorrectionActivity(db: D1Database, accountId: string) {
  const queryResults = await db.batch(
    activityQueries.map((query) => db.prepare(query).bind(accountId)),
  );
  const results = queryResults
    .flatMap(
      (result) => (result.results ?? []) as unknown as CorrectionActivityRow[],
    )
    .sort((left, right) => right.submitted_at.localeCompare(left.submitted_at));

  return results.map((row) => {
    const current = parseJson(row.current_json);
    const changes = parseJson(row.changes_json);
    const subject =
      row.kind === "goal" && typeof current.scorer === "string"
        ? `${current.scorer} v ${row.subject}`
        : row.kind === "appearance" &&
            typeof (current.playerName ?? changes.playerName) === "string"
          ? `${current.playerName ?? changes.playerName} v ${row.subject}`
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
      changes,
      reviewNote: row.review_note,
      reviewedAt: row.reviewed_at,
      publicPath,
    };
  });
}

export async function withdrawCorrection(
  db: D1Database,
  accountId: string,
  kind: CorrectionKind,
  id: string,
) {
  const table = correctionTables[kind];
  if (!table) return false;
  const result = await db
    .prepare(
      `DELETE FROM ${table}
       WHERE id = ? AND submitted_by_account_id = ? AND status = 'pending'`,
    )
    .bind(id, accountId)
    .run();
  return Boolean(result.meta.changes);
}

export async function getPublicContributors(db: D1Database) {
  const queryResults = await db.batch(
    publicContributionQueries.map((query) =>
      db.prepare(
        `${query}
         INNER JOIN UserProfiles up ON up.account_id = c.submitted_by_account_id
         WHERE c.status = 'approved'
           AND up.correction_recognition_visible = 1
           AND up.correction_username IS NOT NULL`,
      ),
    ),
  );
  const rows = queryResults.flatMap(
    (result) =>
      (result.results ?? []) as unknown as Array<{
        account_id: string;
        display_name: string;
        avatar_url: string | null;
        contribution_key: string;
      }>,
  );
  const contributors = new Map<
    string,
    {
      account_id: string;
      display_name: string;
      avatar_url: string | null;
      keys: Set<string>;
    }
  >();
  for (const row of rows) {
    const contributor = contributors.get(row.account_id) ?? {
      account_id: row.account_id,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      keys: new Set<string>(),
    };
    contributor.display_name = row.display_name;
    contributor.avatar_url = row.avatar_url;
    contributor.keys.add(row.contribution_key);
    contributors.set(row.account_id, contributor);
  }
  return Array.from(contributors.values(), (contributor) => ({
    account_id: contributor.account_id,
    display_name: contributor.display_name,
    avatar_url: contributor.avatar_url,
    approved_count: contributor.keys.size,
  })).sort((left, right) =>
    left.display_name.localeCompare(right.display_name, "en-GB", {
      sensitivity: "base",
    }),
  );
}
