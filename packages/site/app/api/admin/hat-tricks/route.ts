import { getAdminSession } from "@/lib/adminAuth";
import type { HatTrickRow } from "@tranmere-web/lib/src/d1-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type HatTrickInput = {
  season: number;
  matchDate: string;
  opposition: string;
  playerName: string;
  goals: number;
};

type HatTrickRequest = Partial<HatTrickInput> & { id?: string };

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function text(value: unknown, limit = 200) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function isDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function validate(body: HatTrickRequest): HatTrickInput | null {
  const season = Number(body.season);
  const matchDate = text(body.matchDate, 10);
  const opposition = text(body.opposition);
  const playerName = text(body.playerName);
  const goals = Number(body.goals);
  if (
    !Number.isSafeInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !isDate(matchDate) ||
    !opposition ||
    !playerName ||
    !Number.isSafeInteger(goals) ||
    goals < 3
  ) {
    return null;
  }
  return { season, matchDate, opposition, playerName, goals };
}

function responseHatTrick(id: string, record: HatTrickInput): HatTrickRow {
  return {
    id,
    season: record.season,
    match_date: record.matchDate,
    opposition: record.opposition,
    player_name: record.playerName,
    goals: record.goals,
  };
}

function revalidateHatTricks(record: HatTrickInput) {
  revalidatePath("/admin/hat-tricks");
  revalidatePath("/players/hat-tricks");
  revalidatePath(`/match/${record.season}/${record.matchDate}`);
  revalidatePath(`/page/player/${encodeURIComponent(record.playerName)}`);
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) {
    return error("You do not have permission to manage hat-tricks.", 403);
  }
  const record = validate((await request.json()) as HatTrickRequest);
  if (!record)
    return error("Enter valid hat-trick details before saving.", 400);
  const id = crypto.randomUUID();
  await getCloudflareContext()
    .env.DB.prepare(
      `INSERT INTO HatTricks (id, season, match_date, opposition, player_name, goals)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      record.season,
      record.matchDate,
      record.opposition,
      record.playerName,
      record.goals,
    )
    .run();
  revalidateHatTricks(record);
  return NextResponse.json(
    { hatTrick: responseHatTrick(id, record) },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  if (!(await getAdminSession())) {
    return error("You do not have permission to manage hat-tricks.", 403);
  }
  const body = (await request.json()) as HatTrickRequest;
  const id = text(body.id, 100);
  const record = validate(body);
  if (!id || !record)
    return error("Enter valid hat-trick details before saving.", 400);
  const result = await getCloudflareContext()
    .env.DB.prepare(
      `UPDATE HatTricks
       SET season = ?, match_date = ?, opposition = ?, player_name = ?, goals = ?
       WHERE id = ?`,
    )
    .bind(
      record.season,
      record.matchDate,
      record.opposition,
      record.playerName,
      record.goals,
      id,
    )
    .run();
  if (!result.meta.changes)
    return error("That hat-trick could not be found.", 404);
  revalidateHatTricks(record);
  return NextResponse.json({ hatTrick: responseHatTrick(id, record) });
}

export async function DELETE(request: NextRequest) {
  if (!(await getAdminSession())) {
    return error("You do not have permission to manage hat-tricks.", 403);
  }
  const id = text(((await request.json()) as HatTrickRequest).id, 100);
  if (!id) return error("Choose a hat-trick to delete.", 400);
  const db = getCloudflareContext().env.DB;
  const existing = await db
    .prepare(
      `SELECT id, season, match_date, opposition, player_name, goals
       FROM HatTricks WHERE id = ?`,
    )
    .bind(id)
    .first<HatTrickRow>();
  if (!existing) return error("That hat-trick could not be found.", 404);
  await db.prepare("DELETE FROM HatTricks WHERE id = ?").bind(id).run();
  revalidateHatTricks({
    season: existing.season,
    matchDate: existing.match_date,
    opposition: existing.opposition,
    playerName: existing.player_name,
    goals: existing.goals,
  });
  return NextResponse.json({ deleted: true });
}
