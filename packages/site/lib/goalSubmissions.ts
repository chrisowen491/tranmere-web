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

export function parseSubmittedGoal(value: string): EditableGoal {
  try {
    return JSON.parse(value) as EditableGoal;
  } catch {
    return {};
  }
}

export async function getGoalSubmissions(db: D1Database) {
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
