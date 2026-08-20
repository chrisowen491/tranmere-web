export type GoalCorrectionStatus = "pending" | "approved" | "rejected";

export interface EditableGoal {
  scorer?: string;
  minute?: string;
  goalType?: string;
  foot?: string;
  assist?: string;
  assistType?: string;
}

export interface GoalCorrection {
  id: string;
  goalId: string;
  season: string;
  matchDate: string;
  opposition: string;
  current: EditableGoal;
  changes: EditableGoal;
  source: string | null;
  explanation: string | null;
  submittedByName: string;
  submittedAt: string;
}

interface DBGoalCorrection {
  id: string;
  goal_id: string;
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

export const editableGoalLabels: Record<keyof EditableGoal, string> = {
  scorer: "Scorer",
  minute: "Minute",
  goalType: "Goal type",
  foot: "Foot",
  assist: "Assist",
  assistType: "Assist type",
};

export function parseEditableGoal(value: string): EditableGoal {
  try {
    return JSON.parse(value) as EditableGoal;
  } catch {
    return {};
  }
}

export async function ensureGoalCorrectionsTable(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS GoalCorrections (
      id TEXT NOT NULL PRIMARY KEY,
      goal_id TEXT NOT NULL,
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
    db.prepare(`CREATE INDEX IF NOT EXISTS GoalCorrections_status_idx
      ON GoalCorrections (status, submitted_at)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS GoalCorrections_goal_idx
      ON GoalCorrections (goal_id, status)`),
  ]);
}

export async function getGoalCorrections(
  db: D1Database,
  status?: GoalCorrectionStatus,
) {
  await ensureGoalCorrectionsTable(db);
  const statement = status
    ? db
        .prepare(
          "SELECT * FROM GoalCorrections WHERE status = ? ORDER BY submitted_at ASC",
        )
        .bind(status)
    : db.prepare("SELECT * FROM GoalCorrections ORDER BY submitted_at DESC");
  const { results } = await statement.all<DBGoalCorrection>();
  return results.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    season: row.season,
    matchDate: row.match_date,
    opposition: row.opposition,
    current: parseEditableGoal(row.current_json),
    changes: parseEditableGoal(row.changes_json),
    source: row.source,
    explanation: row.explanation,
    submittedByName: row.submitted_by_name,
    submittedAt: row.submitted_at,
  }));
}
