import {
  adminError,
  isIsoDate,
  optionalText,
  requiredText,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import { getGameBySeasonAndDate } from "@/lib/games";
import type { MatchEventRow } from "@tranmere-web/lib/src/d1-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

type MatchEventInput = {
  season: number;
  matchDate: string;
  playerName: string;
  eventType: string;
  minute: string | null;
  notes: string | null;
  metadataJson: string | null;
};

type MatchEventRequest = Partial<MatchEventInput> & { id?: string };

function normalizedMetadata(value: unknown) {
  const text = optionalText(value, 10000);
  if (!text) return null;
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return undefined;
  }
}

function validateMatchEvent(body: MatchEventRequest): MatchEventInput | null {
  const season = Number(body.season);
  const matchDate = requiredText(body.matchDate, 10);
  const playerName = requiredText(body.playerName);
  const eventType = requiredText(body.eventType, 50);
  const metadataJson = normalizedMetadata(body.metadataJson);
  if (
    !Number.isSafeInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !isIsoDate(matchDate) ||
    !playerName ||
    !/^[A-Za-z][A-Za-z0-9_-]{0,49}$/.test(eventType) ||
    metadataJson === undefined
  ) {
    return null;
  }
  return {
    season,
    matchDate,
    playerName,
    eventType,
    minute: optionalText(body.minute, 40),
    notes: optionalText(body.notes, 2000),
    metadataJson,
  };
}

function values(event: MatchEventInput) {
  return [
    event.season,
    event.matchDate,
    event.playerName,
    event.eventType,
    event.minute,
    event.notes,
    event.metadataJson,
  ];
}

function responseEvent(
  id: string,
  event: MatchEventInput,
  createdAt: string,
  updatedAt: string,
): MatchEventRow {
  return {
    id,
    season: event.season,
    match_date: event.matchDate,
    player_name: event.playerName,
    event_type: event.eventType,
    minute: event.minute,
    notes: event.notes,
    metadata_json: event.metadataJson,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function revalidateMatchEvent(event: MatchEventInput) {
  revalidateAdminPaths([
    "/admin/match-events",
    `/match/${event.season}/${event.matchDate}`,
    `/season/${event.season}`,
    "/players/fantasy-rankings",
    `/page/player/${encodeURIComponent(event.playerName)}`,
  ]);
}

async function matchExists(db: D1Database, event: MatchEventInput) {
  return getGameBySeasonAndDate(db, String(event.season), event.matchDate);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("match events");
  if (forbidden) return forbidden;
  const event = validateMatchEvent((await request.json()) as MatchEventRequest);
  if (!event)
    return adminError("Enter valid match event details before saving.", 400);
  const db = getCloudflareContext().env.DB;
  if (!(await matchExists(db, event)))
    return adminError("That match could not be found.", 404);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO MatchEvents (
        id, season, match_date, player_name, event_type, minute, notes,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, ...values(event), now, now)
    .run();
  revalidateMatchEvent(event);
  return NextResponse.json(
    { event: responseEvent(id, event, now, now) },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("match events");
  if (forbidden) return forbidden;
  const body = (await request.json()) as MatchEventRequest;
  const id = requiredText(body.id, 100);
  const event = validateMatchEvent(body);
  if (!id || !event)
    return adminError("Enter valid match event details before saving.", 400);
  const db = getCloudflareContext().env.DB;
  if (!(await matchExists(db, event)))
    return adminError("That match could not be found.", 404);

  const existing = await db
    .prepare(
      `SELECT id, season, match_date, player_name, event_type, minute, notes,
              metadata_json, created_at, updated_at
       FROM MatchEvents WHERE id = ?`,
    )
    .bind(id)
    .first<MatchEventRow>();
  if (!existing) return adminError("That match event could not be found.", 404);

  const now = new Date().toISOString();
  const result = await db
    .prepare(
      `UPDATE MatchEvents SET season = ?, match_date = ?, player_name = ?,
        event_type = ?, minute = ?, notes = ?, metadata_json = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(...values(event), now, id)
    .run();
  if (!result.meta.changes)
    return adminError("That match event could not be found.", 404);
  revalidateMatchEvent({
    season: existing.season,
    matchDate: existing.match_date,
    playerName: existing.player_name,
    eventType: existing.event_type,
    minute: existing.minute,
    notes: existing.notes,
    metadataJson: existing.metadata_json,
  });
  revalidateMatchEvent(event);
  return NextResponse.json({
    event: responseEvent(id, event, existing.created_at, now),
  });
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("match events");
  if (forbidden) return forbidden;
  const id = requiredText(
    ((await request.json()) as MatchEventRequest).id,
    100,
  );
  if (!id) return adminError("Choose a match event to delete.", 400);
  const db = getCloudflareContext().env.DB;
  const existing = await db
    .prepare(
      `SELECT id, season, match_date, player_name, event_type, minute, notes,
              metadata_json, created_at, updated_at
       FROM MatchEvents WHERE id = ?`,
    )
    .bind(id)
    .first<MatchEventRow>();
  if (!existing) return adminError("That match event could not be found.", 404);
  await db.prepare("DELETE FROM MatchEvents WHERE id = ?").bind(id).run();
  revalidateMatchEvent({
    season: existing.season,
    matchDate: existing.match_date,
    playerName: existing.player_name,
    eventType: existing.event_type,
    minute: existing.minute,
    notes: existing.notes,
    metadataJson: existing.metadata_json,
  });
  return NextResponse.json({ deleted: true });
}
