import {
  adminError,
  isIsoDate,
  optionalText,
  requiredText,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import {
  MATCH_COMPETITIONS,
  type MatchCompetition,
} from "@tranmere-web/lib/src/competition-constants";
import {
  MANAGER_FORMATIONS,
  type ManagerFormation,
} from "@tranmere-web/lib/src/manager-constants";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

type GameInput = {
  season: number;
  matchDate: string;
  competition: string;
  round: string | null;
  homeTeam: string;
  awayTeam: string;
  opposition: string;
  venue: string;
  attendance: number | null;
  fullTimeScore: string;
  homeGoals: string | null;
  awayGoals: string | null;
  division: string | null;
  tier: string | null;
  leg: string | null;
  tie: string | null;
  neutral: string | null;
  afterExtraTime: string | null;
  penalties: string | null;
  programmePath: string | null;
  formation: string | null;
  kit: string | null;
  referee: string | null;
  ticket: string | null;
};

type GameRequest = Omit<Partial<GameInput>, "attendance"> & {
  id?: string;
  attendance?: number | string | null;
};

const optionalFields = [
  "round",
  "homeGoals",
  "awayGoals",
  "division",
  "tier",
  "leg",
  "tie",
  "neutral",
  "afterExtraTime",
  "penalties",
  "programmePath",
  "formation",
  "kit",
  "referee",
  "ticket",
] as const;

function validateGame(body: GameRequest): GameInput | null {
  const season = Number(body.season);
  const matchDate = requiredText(body.matchDate, 10);
  const attendanceValue = body.attendance;
  const attendance =
    attendanceValue === "" ||
    attendanceValue === null ||
    attendanceValue === undefined
      ? null
      : Number(attendanceValue);
  const optional = Object.fromEntries(
    optionalFields.map((field) => [field, optionalText(body[field], 500)]),
  ) as Record<(typeof optionalFields)[number], string | null>;
  const competition = requiredText(body.competition);

  if (
    !Number.isSafeInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !isIsoDate(matchDate) ||
    !MATCH_COMPETITIONS.includes(competition as MatchCompetition) ||
    !requiredText(body.homeTeam) ||
    !requiredText(body.awayTeam) ||
    !requiredText(body.opposition) ||
    !requiredText(body.venue) ||
    !requiredText(body.fullTimeScore, 40) ||
    (attendance !== null &&
      (!Number.isSafeInteger(attendance) || attendance < 0)) ||
    (optional.formation !== null &&
      !MANAGER_FORMATIONS.includes(optional.formation as ManagerFormation))
  ) {
    return null;
  }

  return {
    season,
    matchDate,
    competition,
    round: optional.round,
    homeTeam: requiredText(body.homeTeam),
    awayTeam: requiredText(body.awayTeam),
    opposition: requiredText(body.opposition),
    venue: requiredText(body.venue),
    attendance,
    fullTimeScore: requiredText(body.fullTimeScore, 40),
    homeGoals: optional.homeGoals,
    awayGoals: optional.awayGoals,
    division: optional.division,
    tier: optional.tier,
    leg: optional.leg,
    tie: optional.tie,
    neutral: optional.neutral,
    afterExtraTime: optional.afterExtraTime,
    penalties: optional.penalties,
    programmePath: optional.programmePath,
    formation: optional.formation,
    kit: optional.kit,
    referee: optional.referee,
    ticket: optional.ticket,
  };
}

function values(game: GameInput) {
  return [
    game.season,
    game.matchDate,
    game.competition,
    game.round,
    game.homeTeam,
    game.awayTeam,
    game.opposition,
    game.venue,
    game.attendance,
    game.fullTimeScore,
    game.homeGoals,
    game.awayGoals,
    game.division,
    game.tier,
    game.leg,
    game.tie,
    game.neutral,
    game.afterExtraTime,
    game.penalties,
    game.programmePath,
    game.formation,
    game.kit,
    game.referee,
    game.ticket,
  ];
}

function revalidateGames(season: number, date: string) {
  revalidateAdminPaths([
    "/admin/games",
    "/results",
    `/season/${season}`,
    `/match/${season}/${date}`,
  ]);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("games");
  if (forbidden) return forbidden;

  const game = validateGame((await request.json()) as GameRequest);
  if (!game) return adminError("Enter valid match details before saving.", 400);

  const id = crypto.randomUUID();
  const db = getCloudflareContext().env.DB;
  await db
    .prepare(
      `INSERT INTO Games (
        id, season, match_date, competition, round, home_team, away_team,
        opposition, venue, attendance, full_time_score, home_goals, away_goals,
        division, tier, leg, tie, neutral, after_extra_time, penalties,
        programme_path, formation, kit, referee, ticket
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, ...values(game))
    .run();

  revalidateGames(game.season, game.matchDate);
  return NextResponse.json({ id, ...game }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("games");
  if (forbidden) return forbidden;

  const body = (await request.json()) as GameRequest;
  const id = requiredText(body.id, 100);
  const game = validateGame(body);
  if (!id || !game)
    return adminError("Enter valid match details before saving.", 400);

  const db = getCloudflareContext().env.DB;
  const result = await db
    .prepare(
      `UPDATE Games SET
        season = ?, match_date = ?, competition = ?, round = ?, home_team = ?,
        away_team = ?, opposition = ?, venue = ?, attendance = ?, full_time_score = ?,
        home_goals = ?, away_goals = ?, division = ?, tier = ?, leg = ?, tie = ?,
        neutral = ?, after_extra_time = ?, penalties = ?, programme_path = ?,
        formation = ?, kit = ?, referee = ?, ticket = ?
       WHERE id = ?`,
    )
    .bind(...values(game), id)
    .run();

  if (!result.meta.changes)
    return adminError("That game could not be found.", 404);

  revalidateGames(game.season, game.matchDate);
  return NextResponse.json({ id, ...game });
}
