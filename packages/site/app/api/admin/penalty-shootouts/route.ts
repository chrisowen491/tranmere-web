import {
  adminError,
  isIsoDate,
  optionalText,
  requiredText,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import { getGameBySeasonAndDate } from "@/lib/games";
import type {
  PenaltyShootoutKickRow,
  PenaltyShootoutOutcome,
  PenaltyShootoutTeamSide,
} from "@tranmere-web/lib/src/d1-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

type Input = {
  season: number;
  matchDate: string;
  kickOrder: number;
  teamSide: string;
  playerName: string;
  outcome: string;
  notes: string | null;
};
type RequestBody = Partial<Input> & { id?: string };

function validate(body: RequestBody): Input | null {
  const season = Number(body.season);
  const matchDate = requiredText(body.matchDate, 10);
  const kickOrder = Number(body.kickOrder);
  const playerName = requiredText(body.playerName);
  if (
    !Number.isSafeInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !isIsoDate(matchDate) ||
    !Number.isSafeInteger(kickOrder) ||
    kickOrder < 1 ||
    !["tranmere", "opposition"].includes(body.teamSide ?? "") ||
    !playerName ||
    !["scored", "missed", "saved"].includes(body.outcome ?? "")
  )
    return null;
  return {
    season,
    matchDate,
    kickOrder,
    teamSide: body.teamSide!,
    playerName,
    outcome: body.outcome!,
    notes: optionalText(body.notes, 2000),
  };
}

function row(
  id: string,
  input: Input,
  created_at: string,
  updated_at: string,
): PenaltyShootoutKickRow {
  return {
    id,
    season: input.season,
    match_date: input.matchDate,
    kick_order: input.kickOrder,
    team_side: input.teamSide as PenaltyShootoutTeamSide,
    player_name: input.playerName,
    outcome: input.outcome as PenaltyShootoutOutcome,
    notes: input.notes,
    created_at,
    updated_at,
  };
}
function paths(input: Input) {
  revalidateAdminPaths([
    "/admin/penalty-shootouts",
    "/games/penalty-shootouts",
    `/match/${input.season}/${input.matchDate}`,
  ]);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("penalty shootouts");
  if (forbidden) return forbidden;
  const input = validate(await request.json());
  if (!input) return adminError("Enter valid kick details before saving.", 400);
  const db = getCloudflareContext().env.DB;
  const game = await getGameBySeasonAndDate(
    db,
    String(input.season),
    input.matchDate,
  );
  if (!game) return adminError("That match could not be found.", 404);
  if (!game.pens)
    return adminError("That match is not marked as a penalty shootout.", 400);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    await db
      .prepare(
        `INSERT INTO PenaltyShootoutKicks (id, season, match_date, kick_order, team_side, player_name, outcome, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        input.season,
        input.matchDate,
        input.kickOrder,
        input.teamSide,
        input.playerName,
        input.outcome,
        input.notes,
        now,
        now,
      )
      .run();
  } catch {
    return adminError(
      "That kick order is already used for this shootout.",
      409,
    );
  }
  paths(input);
  return NextResponse.json({ kick: row(id, input, now, now) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("penalty shootouts");
  if (forbidden) return forbidden;
  const body = (await request.json()) as RequestBody;
  const id = requiredText(body.id, 100);
  const input = validate(body);
  if (!id || !input)
    return adminError("Enter valid kick details before saving.", 400);
  const db = getCloudflareContext().env.DB;
  const game = await getGameBySeasonAndDate(
    db,
    String(input.season),
    input.matchDate,
  );
  if (!game) return adminError("That match could not be found.", 404);
  if (!game.pens)
    return adminError("That match is not marked as a penalty shootout.", 400);
  const existing = await db
    .prepare("SELECT * FROM PenaltyShootoutKicks WHERE id = ?")
    .bind(id)
    .first<PenaltyShootoutKickRow>();
  if (!existing)
    return adminError("That shootout kick could not be found.", 404);
  const now = new Date().toISOString();
  try {
    await db
      .prepare(
        `UPDATE PenaltyShootoutKicks SET season=?, match_date=?, kick_order=?, team_side=?, player_name=?, outcome=?, notes=?, updated_at=? WHERE id=?`,
      )
      .bind(
        input.season,
        input.matchDate,
        input.kickOrder,
        input.teamSide,
        input.playerName,
        input.outcome,
        input.notes,
        now,
        id,
      )
      .run();
  } catch {
    return adminError(
      "That kick order is already used for this shootout.",
      409,
    );
  }
  paths(input);
  return NextResponse.json({ kick: row(id, input, existing.created_at, now) });
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("penalty shootouts");
  if (forbidden) return forbidden;
  const id = requiredText(((await request.json()) as RequestBody).id, 100);
  if (!id) return adminError("Choose a kick to delete.", 400);
  const db = getCloudflareContext().env.DB;
  const existing = await db
    .prepare("SELECT * FROM PenaltyShootoutKicks WHERE id = ?")
    .bind(id)
    .first<PenaltyShootoutKickRow>();
  if (!existing)
    return adminError("That shootout kick could not be found.", 404);
  await db
    .prepare("DELETE FROM PenaltyShootoutKicks WHERE id = ?")
    .bind(id)
    .run();
  paths({
    season: existing.season,
    matchDate: existing.match_date,
    kickOrder: existing.kick_order,
    teamSide: existing.team_side,
    playerName: existing.player_name,
    outcome: existing.outcome,
    notes: existing.notes,
  });
  return NextResponse.json({ deleted: true });
}
