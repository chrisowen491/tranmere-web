import { getAdminSession } from "@/lib/adminAuth";
import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import {
  ensureGoalSubmissionsTable,
  parseSubmittedGoal,
} from "@/lib/goalSubmissions";
import type { EditableGoal } from "@/lib/goalCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { GOAL_FEET } from "@tranmere-web/lib/src/goal-constants";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}
function cleanGoal(input: EditableGoal): Required<EditableGoal> {
  return {
    scorer: String(input.scorer ?? "")
      .trim()
      .slice(0, 200),
    minute: String(input.minute ?? "")
      .trim()
      .slice(0, 40),
    goalType: String(input.goalType ?? "")
      .trim()
      .slice(0, 100),
    foot: String(input.foot ?? "")
      .trim()
      .slice(0, 20),
    assist: String(input.assist ?? "")
      .trim()
      .slice(0, 200),
    assistType: String(input.assistType ?? "")
      .trim()
      .slice(0, 100),
  };
}
function validateGoal(goal: Required<EditableGoal>) {
  if (!goal.scorer) return "Enter the scorer.";
  if (goal.minute && !/^\d{1,3}(?:\+\d{1,2})?'?$/.test(goal.minute))
    return "Enter a valid minute, such as 74 or 90+3.";
  if (goal.foot && !GOAL_FEET.includes(goal.foot as (typeof GOAL_FEET)[number]))
    return "Choose a valid foot or body part.";
  return null;
}
async function playerExists(db: D1Database, name: string) {
  return db
    .prepare("SELECT id FROM Players WHERE name = ? LIMIT 1")
    .bind(name)
    .first();
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in before suggesting a missing goal.", 401);
  const body = (await request.json()) as {
    season?: string;
    matchDate?: string;
    opposition?: string;
    competition?: string;
    goal?: EditableGoal;
    source?: string;
    explanation?: string;
  };
  const goal = cleanGoal(body.goal ?? {});
  const season = Number(body.season);
  if (
    !Number.isSafeInteger(season) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.matchDate ?? "") ||
    !body.opposition
  )
    return error("That match could not be identified.", 400);
  const validation = validateGoal(goal);
  if (validation) return error(validation, 400);
  const db = getCloudflareContext().env.DB;
  const match = await db
    .prepare("SELECT id FROM Games WHERE season = ? AND match_date = ? LIMIT 1")
    .bind(season, body.matchDate)
    .first();
  if (!match) return error("That match could not be found.", 404);
  for (const name of [goal.scorer, goal.assist])
    if (name && !(await playerExists(db, name)))
      return error(`${name} could not be matched to a player profile.`, 400);
  await ensureGoalSubmissionsTable(db);
  const account = await resolveAccount(db, session.user.sub);
  const goalJson = JSON.stringify(goal);
  const duplicate = await db
    .prepare(
      "SELECT id FROM GoalSubmissions WHERE season = ? AND match_date = ? AND goal_json = ? AND status = 'pending'",
    )
    .bind(season, body.matchDate, goalJson)
    .first();
  if (duplicate)
    return error("That missing goal is already awaiting review.", 409);
  await db
    .prepare(
      `INSERT INTO GoalSubmissions (id, season, match_date, opposition, competition, goal_json, source, explanation, submitted_by_account_id, submitted_by_name, submitted_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .bind(
      crypto.randomUUID(),
      String(season),
      body.matchDate,
      body.opposition.trim().slice(0, 200),
      body.competition?.trim().slice(0, 200) || null,
      goalJson,
      body.source?.trim().slice(0, 1000) || null,
      body.explanation?.trim().slice(0, 1000) || null,
      account.id,
      session.user.name || session.user.email || "Supporter",
      new Date().toISOString(),
    )
    .run();
  return NextResponse.json(
    { message: "The missing goal is awaiting review." },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return error("You do not have permission to review submissions.", 403);
  const body = (await request.json()) as {
    id?: string;
    status?: "approved" | "rejected";
    reviewNote?: string;
  };
  if (!body.id || !["approved", "rejected"].includes(body.status ?? ""))
    return error("Choose whether to approve or reject this goal.", 400);
  const db = getCloudflareContext().env.DB;
  await ensureGoalSubmissionsTable(db);
  const submission = await db
    .prepare(
      "SELECT season, match_date, opposition, competition, goal_json FROM GoalSubmissions WHERE id = ? AND status = 'pending'",
    )
    .bind(body.id)
    .first<{
      season: string;
      match_date: string;
      opposition: string;
      competition: string | null;
      goal_json: string;
    }>();
  if (!submission) return error("This goal has already been reviewed.", 409);
  const goal = cleanGoal(parseSubmittedGoal(submission.goal_json));
  const validation = validateGoal(goal);
  if (validation) return error(validation, 400);
  for (const name of [goal.scorer, goal.assist])
    if (name && !(await playerExists(db, name)))
      return error(`${name} could not be matched to a player profile.`, 400);
  const reviewNote = body.reviewNote?.trim().slice(0, 1000) || null;
  if (body.status === "approved") {
    const goalId = crypto.randomUUID();
    const results = await db.batch([
      db
        .prepare(
          `INSERT INTO Goals (id, season, match_date, scorer, opposition, competition, minute, goal_type, assist, assist_type, foot, six_yard_box, eighteen_yard_box, cross_side, long_range) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NULL, 0 WHERE EXISTS (SELECT 1 FROM GoalSubmissions WHERE id = ? AND status = 'pending')`,
        )
        .bind(
          goalId,
          Number(submission.season),
          submission.match_date,
          goal.scorer,
          submission.opposition,
          submission.competition,
          goal.minute || null,
          goal.goalType || null,
          goal.assist || null,
          goal.assistType || null,
          goal.foot || null,
          body.id,
        ),
      db
        .prepare(
          "UPDATE GoalSubmissions SET status = 'approved', reviewed_by = ?, reviewed_at = ?, review_note = ? WHERE id = ? AND status = 'pending'",
        )
        .bind(
          session.user.email,
          new Date().toISOString(),
          reviewNote,
          body.id,
        ),
    ]);
    if (!results[0].meta.changes || !results[1].meta.changes)
      return error("The goal could not be published.", 409);
    revalidatePath(`/page/player/${encodeURIComponent(goal.scorer)}`);
  } else
    await db
      .prepare(
        "UPDATE GoalSubmissions SET status = 'rejected', reviewed_by = ?, reviewed_at = ?, review_note = ? WHERE id = ? AND status = 'pending'",
      )
      .bind(session.user.email, new Date().toISOString(), reviewNote, body.id)
      .run();
  revalidatePath(`/match/${submission.season}/${submission.match_date}`);
  revalidatePath(`/season/${submission.season}`);
  return NextResponse.json({ message: `Goal submission ${body.status}.` });
}
