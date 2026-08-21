export type GoalCorrectionStatus = "pending" | "approved" | "rejected";

export interface EditableGoal {
  scorer?: string;
  minute?: string;
  goalType?: string;
  foot?: string;
  assist?: string;
  assistType?: string;
  distance?: string;
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
  distance: "Distance",
};

export function parseEditableGoal(value: string): EditableGoal {
  try {
    return JSON.parse(value) as EditableGoal;
  } catch {
    return {};
  }
}

export async function getGoalCorrections(
  db: D1Database,
  status?: GoalCorrectionStatus,
) {
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
