import {
  adminError,
  isIsoDate,
  optionalText,
  requiredText,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import type { GoalRow } from "@tranmere-web/lib/src/d1-types";
import {
  GOAL_DISTANCES,
  type GoalDistance,
} from "@tranmere-web/lib/src/goal-constants";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

type GoalInput = {
  season: number;
  matchDate: string;
  scorer: string;
  opposition: string;
  competition: string | null;
  minute: string | null;
  goalType: string | null;
  assist: string | null;
  assistType: string | null;
  foot: string | null;
  distance: GoalDistance | null;
  crossSide: string | null;
};

type GoalRequest = Partial<GoalInput> & { id?: string };

function validateGoal(body: GoalRequest): GoalInput | null {
  const season = Number(body.season);
  const matchDate = requiredText(body.matchDate, 10);
  const scorer = requiredText(body.scorer);
  const opposition = requiredText(body.opposition);
  const distance = optionalText(body.distance, 20);
  if (
    !Number.isSafeInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !isIsoDate(matchDate) ||
    !scorer ||
    !opposition ||
    (distance !== null && !GOAL_DISTANCES.includes(distance as GoalDistance))
  ) {
    return null;
  }
  return {
    season,
    matchDate,
    scorer,
    opposition,
    competition: optionalText(body.competition),
    minute: optionalText(body.minute, 40),
    goalType: optionalText(body.goalType),
    assist: optionalText(body.assist),
    assistType: optionalText(body.assistType),
    foot: optionalText(body.foot),
    distance: distance as GoalDistance | null,
    crossSide: optionalText(body.crossSide),
  };
}

function values(goal: GoalInput) {
  return [
    goal.season,
    goal.matchDate,
    goal.scorer,
    goal.opposition,
    goal.competition,
    goal.minute,
    goal.goalType,
    goal.assist,
    goal.assistType,
    goal.foot,
    goal.distance,
    goal.crossSide,
  ];
}

function responseGoal(id: string, goal: GoalInput): GoalRow {
  return {
    id,
    season: goal.season,
    match_date: goal.matchDate,
    scorer: goal.scorer,
    opposition: goal.opposition,
    competition: goal.competition,
    minute: goal.minute,
    goal_type: goal.goalType,
    assist: goal.assist,
    assist_type: goal.assistType,
    foot: goal.foot,
    distance: goal.distance,
    cross_side: goal.crossSide,
  };
}

function revalidateGoals(season: number, date: string, scorer: string) {
  revalidateAdminPaths([
    "/admin/goals",
    `/match/${season}/${date}`,
    `/page/player/${encodeURIComponent(scorer)}`,
  ]);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("goals");
  if (forbidden) return forbidden;
  const goal = validateGoal((await request.json()) as GoalRequest);
  if (!goal) return adminError("Enter valid goal details before saving.", 400);
  const id = crypto.randomUUID();
  await getCloudflareContext()
    .env.DB.prepare(
      `INSERT INTO Goals (
      id, season, match_date, scorer, opposition, competition, minute, goal_type,
      assist, assist_type, foot, distance, cross_side
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, ...values(goal))
    .run();
  revalidateGoals(goal.season, goal.matchDate, goal.scorer);
  return NextResponse.json({ goal: responseGoal(id, goal) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("goals");
  if (forbidden) return forbidden;
  const body = (await request.json()) as GoalRequest;
  const id = requiredText(body.id, 100);
  const goal = validateGoal(body);
  if (!id || !goal)
    return adminError("Enter valid goal details before saving.", 400);
  const result = await getCloudflareContext()
    .env.DB.prepare(
      `UPDATE Goals SET
      season = ?, match_date = ?, scorer = ?, opposition = ?, competition = ?, minute = ?,
      goal_type = ?, assist = ?, assist_type = ?, foot = ?, distance = ?, cross_side = ?
     WHERE id = ?`,
    )
    .bind(...values(goal), id)
    .run();
  if (!result.meta.changes)
    return adminError("That goal could not be found.", 404);
  revalidateGoals(goal.season, goal.matchDate, goal.scorer);
  return NextResponse.json({ goal: responseGoal(id, goal) });
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("goals");
  if (forbidden) return forbidden;
  const id = requiredText(((await request.json()) as GoalRequest).id, 100);
  if (!id) return adminError("Choose a goal to delete.", 400);
  const db = getCloudflareContext().env.DB;
  const existing = await db
    .prepare(
      `SELECT id, season, match_date, scorer, opposition, competition, minute, goal_type,
            assist, assist_type, foot, distance, cross_side
     FROM Goals WHERE id = ?`,
    )
    .bind(id)
    .first<GoalRow>();
  if (!existing) return adminError("That goal could not be found.", 404);
  await db.prepare("DELETE FROM Goals WHERE id = ?").bind(id).run();
  revalidateGoals(existing.season, existing.match_date, existing.scorer);
  return NextResponse.json({ deleted: true });
}
