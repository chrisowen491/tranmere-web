import {
  ASSIST_TYPES,
  CROSS_SIDES,
  GOAL_DISTANCES,
  GOAL_FEET,
  GOAL_TYPES,
} from "@tranmere-web/lib/src/goal-constants";
import type {
  GoalAtlasPeriod,
  GoalAtlasQueryOptions,
} from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { searchGoalAtlas } from "@/lib/goalAtlas";
import { readSearchPagination } from "@/lib/searchPagination";

function text(params: URLSearchParams, name: string) {
  return params.get(name)?.trim().slice(0, 150) || undefined;
}

function integer(
  params: URLSearchParams,
  name: string,
  min: number,
  max: number,
) {
  const raw = text(params, name);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= min && value <= max
    ? value
    : undefined;
}

function allowed<T extends string>(
  value: string | undefined,
  values: readonly T[],
) {
  return value && values.includes(value as T) ? (value as T) : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const period = allowed(text(params, "period"), [
    "first-half",
    "second-half",
    "extra-time",
  ] as const);
  const options: GoalAtlasQueryOptions = {
    season: integer(params, "season", 1800, 2200),
    competition: text(params, "competition"),
    scorer: text(params, "scorer"),
    opposition: text(params, "opposition"),
    goalType: allowed(text(params, "goalType"), GOAL_TYPES),
    foot: allowed(text(params, "foot"), GOAL_FEET),
    assistType: allowed(text(params, "assistType"), ASSIST_TYPES),
    crossSide: allowed(text(params, "crossSide"), CROSS_SIDES),
    distance: allowed(text(params, "distance"), GOAL_DISTANCES),
    period: period as GoalAtlasPeriod | undefined,
    minuteFrom: integer(params, "minuteFrom", 1, 130),
    minuteTo: integer(params, "minuteTo", 1, 130),
  };
  const pagination = readSearchPagination(params);
  const db = (await getCloudflareContext({ async: true })).env.DB;
  return NextResponse.json(await searchGoalAtlas(db, options, pagination));
}
