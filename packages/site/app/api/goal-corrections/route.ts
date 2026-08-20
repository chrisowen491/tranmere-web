import { getAdminSession } from "@/lib/adminAuth";
import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import {
  ensureGoalCorrectionsTable,
  parseEditableGoal,
  type EditableGoal,
  type GoalCorrectionStatus,
} from "@/lib/goalCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { GOAL_FEET } from "@tranmere-web/lib/src/goal-constants";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const editableFields: Array<keyof EditableGoal> = [
  "scorer",
  "minute",
  "goalType",
  "foot",
  "assist",
  "assistType",
];

const fieldLengths: Record<keyof EditableGoal, number> = {
  scorer: 200,
  minute: 40,
  goalType: 100,
  foot: 20,
  assist: 200,
  assistType: 100,
};

interface GoalRecord {
  id: string;
  season: number;
  match_date: string;
  opposition: string;
  scorer: string;
  minute: string | null;
  goal_type: string | null;
  foot: string | null;
  assist: string | null;
  assist_type: string | null;
}

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function snapshot(goal: GoalRecord): Required<EditableGoal> {
  return {
    scorer: goal.scorer,
    minute: goal.minute ?? "",
    goalType: goal.goal_type ?? "",
    foot: goal.foot ?? "",
    assist: goal.assist ?? "",
    assistType: goal.assist_type ?? "",
  };
}

function cleanChanges(input: EditableGoal) {
  const changes: EditableGoal = {};
  for (const field of editableFields) {
    if (!Object.prototype.hasOwnProperty.call(input, field)) continue;
    changes[field] = String(input[field] ?? "")
      .trim()
      .slice(0, fieldLengths[field]);
  }
  return changes;
}

async function playerExists(db: D1Database, name: string) {
  return db
    .prepare("SELECT id FROM Players WHERE name = ? LIMIT 1")
    .bind(name)
    .first();
}

async function getGoal(db: D1Database, id: string) {
  return db
    .prepare(
      `SELECT id, season, match_date, opposition, scorer, minute, goal_type,
              foot, assist, assist_type
       FROM Goals WHERE id = ?`,
    )
    .bind(id)
    .first<GoalRecord>();
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in before suggesting goal changes.", 401);
  const body = (await request.json()) as {
    goalId?: string;
    changes?: EditableGoal;
    source?: string;
    explanation?: string;
  };
  if (!body.goalId || !body.changes || typeof body.changes !== "object")
    return error("Change at least one goal detail.", 400);

  const db = getCloudflareContext().env.DB;
  const goal = await getGoal(db, body.goalId);
  if (!goal) return error("That goal could not be found.", 404);
  const current = snapshot(goal);
  const requested = cleanChanges(body.changes);
  const changes = Object.fromEntries(
    Object.entries(requested).filter(
      ([field, value]) => value !== current[field as keyof EditableGoal],
    ),
  ) as EditableGoal;
  if (!Object.keys(changes).length)
    return error("Those details are already recorded for this goal.", 409);
  if (changes.scorer !== undefined && !changes.scorer)
    return error("A goal must have a scorer.", 400);
  if (changes.minute && !/^\d{1,3}(?:\+\d{1,2})?'?$/.test(changes.minute))
    return error("Enter a valid minute, such as 74 or 90+3.", 400);
  if (
    changes.foot &&
    !GOAL_FEET.includes(changes.foot as (typeof GOAL_FEET)[number])
  )
    return error("Choose a valid foot or body part.", 400);
  for (const name of [changes.scorer, changes.assist]) {
    if (name && !(await playerExists(db, name)))
      return error(`${name} could not be matched to a player profile.`, 400);
  }

  await ensureGoalCorrectionsTable(db);
  const account = await resolveAccount(db, session.user.sub);
  const changesJson = JSON.stringify(changes);
  const duplicate = await db
    .prepare(
      `SELECT id FROM GoalCorrections
       WHERE goal_id = ? AND submitted_by_account_id = ? AND changes_json = ?
         AND status = 'pending'`,
    )
    .bind(goal.id, account.id, changesJson)
    .first();
  if (duplicate)
    return error("You have already submitted these goal changes.", 409);

  await db
    .prepare(
      `INSERT INTO GoalCorrections (
        id, goal_id, season, match_date, opposition, current_json, changes_json,
        source, explanation, submitted_by_account_id, submitted_by_name, submitted_at,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .bind(
      crypto.randomUUID(),
      goal.id,
      String(goal.season),
      goal.match_date,
      goal.opposition,
      JSON.stringify(current),
      changesJson,
      body.source?.trim().slice(0, 1000) || null,
      body.explanation?.trim().slice(0, 1000) || null,
      account.id,
      session.user.name || session.user.email || "Supporter",
      new Date().toISOString(),
    )
    .run();
  return NextResponse.json(
    { message: "Goal changes are awaiting review." },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return error("You do not have permission to review corrections.", 403);
  const body = (await request.json()) as {
    id?: string;
    status?: GoalCorrectionStatus;
    reviewNote?: string;
  };
  if (!body.id || (body.status !== "approved" && body.status !== "rejected"))
    return error("Choose whether to approve or reject this correction.", 400);

  const db = getCloudflareContext().env.DB;
  await ensureGoalCorrectionsTable(db);
  const correction = await db
    .prepare(
      `SELECT goal_id, season, match_date, changes_json
       FROM GoalCorrections WHERE id = ? AND status = 'pending'`,
    )
    .bind(body.id)
    .first<{
      goal_id: string;
      season: string;
      match_date: string;
      changes_json: string;
    }>();
  if (!correction)
    return error("This correction has already been reviewed.", 409);

  const reviewNote = body.reviewNote?.trim().slice(0, 1000) || null;
  if (body.status === "approved") {
    const goal = await getGoal(db, correction.goal_id);
    if (!goal) return error("The goal record could not be found.", 404);
    const changes = cleanChanges(parseEditableGoal(correction.changes_json));
    if (changes.scorer !== undefined && !changes.scorer)
      return error("A goal must have a scorer.", 400);
    if (changes.minute && !/^\d{1,3}(?:\+\d{1,2})?'?$/.test(changes.minute))
      return error("The suggested minute is invalid.", 400);
    if (
      changes.foot &&
      !GOAL_FEET.includes(changes.foot as (typeof GOAL_FEET)[number])
    )
      return error("The suggested foot or body part is invalid.", 400);
    for (const name of [changes.scorer, changes.assist]) {
      if (name && !(await playerExists(db, name)))
        return error(`${name} could not be matched to a player profile.`, 400);
    }
    const next = { ...snapshot(goal), ...changes };
    const results = await db.batch([
      db
        .prepare(
          `UPDATE Goals SET scorer = ?, minute = ?, goal_type = ?, foot = ?,
                            assist = ?, assist_type = ? WHERE id = ?`,
        )
        .bind(
          next.scorer,
          next.minute || null,
          next.goalType || null,
          next.foot || null,
          next.assist || null,
          next.assistType || null,
          goal.id,
        ),
      db
        .prepare(
          `UPDATE GoalCorrections
           SET status = 'approved', reviewed_by = ?, reviewed_at = ?, review_note = ?
           WHERE id = ? AND status = 'pending'`,
        )
        .bind(
          session.user.email,
          new Date().toISOString(),
          reviewNote,
          body.id,
        ),
    ]);
    if (!results[0].meta.changes || !results[1].meta.changes)
      return error("The correction could not be published.", 409);
    for (const name of new Set([goal.scorer, next.scorer].filter(Boolean)))
      revalidatePath(`/page/player/${encodeURIComponent(name)}`);
  } else {
    await db
      .prepare(
        `UPDATE GoalCorrections
         SET status = 'rejected', reviewed_by = ?, reviewed_at = ?, review_note = ?
         WHERE id = ? AND status = 'pending'`,
      )
      .bind(session.user.email, new Date().toISOString(), reviewNote, body.id)
      .run();
  }
  revalidatePath(`/match/${correction.season}/${correction.match_date}`);
  revalidatePath(`/season/${correction.season}`);
  return NextResponse.json({ message: `Goal correction ${body.status}.` });
}
