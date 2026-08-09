import {
  adminError,
  booleanFlag,
  isIsoDate,
  optionalText,
  requiredText,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import type { AppRow } from "@tranmere-web/lib/src/d1-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

type AppInput = {
  season: number;
  matchDate: string;
  playerName: string;
  competition: string | null;
  opposition: string;
  shirtNumber: number | null;
  yellowCard: number;
  redCard: number;
  substituteYellowCard: number;
  substituteRedCard: number;
  substituteTime: string | null;
  substitutedBy: string | null;
  substituteSubstitutedBy: string | null;
};

type AppRequest = Omit<Partial<AppInput>, "shirtNumber"> & {
  id?: string;
  shirtNumber?: number | string | null;
};

function validateApp(body: AppRequest): AppInput | null {
  const season = Number(body.season);
  const matchDate = requiredText(body.matchDate, 10);
  const shirtNumberValue = body.shirtNumber;
  const shirtNumber =
    shirtNumberValue === "" ||
    shirtNumberValue === null ||
    shirtNumberValue === undefined
      ? null
      : Number(shirtNumberValue);
  const playerName = requiredText(body.playerName);
  const opposition = requiredText(body.opposition);

  if (
    !Number.isSafeInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !isIsoDate(matchDate) ||
    !playerName ||
    !opposition ||
    (shirtNumber !== null &&
      (!Number.isSafeInteger(shirtNumber) || shirtNumber < 0))
  ) {
    return null;
  }

  return {
    season,
    matchDate,
    playerName,
    competition: optionalText(body.competition),
    opposition,
    shirtNumber,
    yellowCard: booleanFlag(body.yellowCard),
    redCard: booleanFlag(body.redCard),
    substituteYellowCard: booleanFlag(body.substituteYellowCard),
    substituteRedCard: booleanFlag(body.substituteRedCard),
    substituteTime: optionalText(body.substituteTime, 40),
    substitutedBy: optionalText(body.substitutedBy),
    substituteSubstitutedBy: optionalText(body.substituteSubstitutedBy),
  };
}

function values(app: AppInput) {
  return [
    app.season,
    app.matchDate,
    app.playerName,
    app.competition,
    app.opposition,
    app.shirtNumber,
    app.yellowCard,
    app.redCard,
    app.substituteYellowCard,
    app.substituteRedCard,
    app.substituteTime,
    app.substitutedBy,
    app.substituteSubstitutedBy,
  ];
}

function responseApp(id: string, app: AppInput) {
  return {
    id,
    season: app.season,
    match_date: app.matchDate,
    player_name: app.playerName,
    competition: app.competition,
    opposition: app.opposition,
    shirt_number: app.shirtNumber,
    yellow_card: app.yellowCard,
    red_card: app.redCard,
    substitute_yellow_card: app.substituteYellowCard,
    substitute_red_card: app.substituteRedCard,
    substitute_time: app.substituteTime,
    substituted_by: app.substitutedBy,
    substitute_substituted_by: app.substituteSubstitutedBy,
  };
}

function revalidateApps(season: number, date: string, playerName: string) {
  revalidateAdminPaths([
    "/admin/apps",
    `/match/${season}/${date}`,
    `/page/player/${encodeURIComponent(playerName)}`,
  ]);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("appearances");
  if (forbidden) return forbidden;

  const app = validateApp((await request.json()) as AppRequest);
  if (!app)
    return adminError("Enter valid appearance details before saving.", 400);

  const id = crypto.randomUUID();
  await getCloudflareContext()
    .env.DB.prepare(
      `INSERT INTO Apps (
        id, season, match_date, player_name, competition, opposition,
        shirt_number, yellow_card, red_card, substitute_yellow_card,
        substitute_red_card, substitute_time, substituted_by,
        substitute_substituted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, ...values(app))
    .run();

  revalidateApps(app.season, app.matchDate, app.playerName);
  return NextResponse.json({ app: responseApp(id, app) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("appearances");
  if (forbidden) return forbidden;

  const body = (await request.json()) as AppRequest;
  const id = requiredText(body.id, 100);
  const app = validateApp(body);
  if (!id || !app)
    return adminError("Enter valid appearance details before saving.", 400);

  const result = await getCloudflareContext()
    .env.DB.prepare(
      `UPDATE Apps SET
        season = ?, match_date = ?, player_name = ?, competition = ?, opposition = ?,
        shirt_number = ?, yellow_card = ?, red_card = ?, substitute_yellow_card = ?,
        substitute_red_card = ?, substitute_time = ?, substituted_by = ?,
        substitute_substituted_by = ?
       WHERE id = ?`,
    )
    .bind(...values(app), id)
    .run();

  if (!result.meta.changes)
    return adminError("That appearance could not be found.", 404);

  revalidateApps(app.season, app.matchDate, app.playerName);
  return NextResponse.json({ app: responseApp(id, app) });
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("appearances");
  if (forbidden) return forbidden;

  const id = requiredText(((await request.json()) as AppRequest).id, 100);
  if (!id) return adminError("Choose an appearance to delete.", 400);

  const db = getCloudflareContext().env.DB;
  const existing = await db
    .prepare(
      `SELECT id, season, match_date, player_name, competition, opposition,
              shirt_number, yellow_card, red_card, substitute_yellow_card,
              substitute_red_card, substitute_time, substituted_by,
              substitute_substituted_by
       FROM Apps WHERE id = ?`,
    )
    .bind(id)
    .first<AppRow>();
  if (!existing) return adminError("That appearance could not be found.", 404);

  await db.prepare("DELETE FROM Apps WHERE id = ?").bind(id).run();
  revalidateApps(existing.season, existing.match_date, existing.player_name);
  return NextResponse.json({ deleted: true });
}
