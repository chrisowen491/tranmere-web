import type { EditableGoal } from "@/lib/goalCorrections";

export interface GoalSubmission {
  id: string;
  season: string;
  matchDate: string;
  opposition: string;
  competition: string | null;
  goal: EditableGoal;
  source: string | null;
  explanation: string | null;
  submittedByName: string;
  submittedAt: string;
}

interface DBGoalSubmission {
  id: string;
  season: string;
  match_date: string;
  opposition: string;
  competition: string | null;
  goal_json: string;
  source: string | null;
  explanation: string | null;
  submitted_by_name: string;
  submitted_at: string;
}

export async function ensureGoalSubmissionsTable(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS GoalSubmissions (
      id TEXT NOT NULL PRIMARY KEY,
      season TEXT NOT NULL,
      match_date TEXT NOT NULL,
      opposition TEXT NOT NULL,
      competition TEXT,
      goal_json TEXT NOT NULL,
      source TEXT,
      explanation TEXT,
      submitted_by_account_id TEXT NOT NULL,
      submitted_by_name TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      reviewed_by TEXT,
      reviewed_at TEXT,
      review_note TEXT
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS GoalSubmissions_status_idx
      ON GoalSubmissions (status, submitted_at)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS GoalSubmissions_submitter_idx
      ON GoalSubmissions (submitted_by_account_id, submitted_at DESC)`),
  ]);
}

export function parseSubmittedGoal(value: string): EditableGoal {
  try {
    return JSON.parse(value) as EditableGoal;
  } catch {
    return {};
  }
}

export async function getGoalSubmissions(db: D1Database) {
  await ensureGoalSubmissionsTable(db);
  const { results } = await db
    .prepare(
      "SELECT * FROM GoalSubmissions WHERE status = 'pending' ORDER BY submitted_at ASC",
    )
    .all<DBGoalSubmission>();
  return results.map((row) => ({
    id: row.id,
    season: row.season,
    matchDate: row.match_date,
    opposition: row.opposition,
    competition: row.competition,
    goal: parseSubmittedGoal(row.goal_json),
    source: row.source,
    explanation: row.explanation,
    submittedByName: row.submitted_by_name,
    submittedAt: row.submitted_at,
  }));
}
