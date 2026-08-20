import { getAdminSession } from "@/lib/adminAuth";
import { auth0 } from "@/lib/auth0";
import {
  ensureAppearanceCorrectionsTable,
  parseEditableAppearance,
  type AppearanceCorrectionStatus,
  type EditableAppearance,
} from "@/lib/appearanceCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface AppearanceRecord {
  id: string;
  season: number;
  match_date: string;
  opposition: string;
  player_name: string;
  shirt_number: number | null;
  yellow_card: number;
  red_card: number;
  substituted_by: string | null;
  substitute_time: string | null;
  substitute_yellow_card: number;
  substitute_red_card: number;
}

const textFields = new Set<keyof EditableAppearance>([
  "playerName",
  "shirtNumber",
  "substitutedBy",
  "substituteTime",
]);
const booleanFields = new Set<keyof EditableAppearance>([
  "yellowCard",
  "redCard",
  "substituteYellowCard",
  "substituteRedCard",
]);

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function snapshot(row: AppearanceRecord): Required<EditableAppearance> {
  return {
    playerName: row.player_name,
    shirtNumber: row.shirt_number?.toString() ?? "",
    yellowCard: Boolean(row.yellow_card),
    redCard: Boolean(row.red_card),
    substitutedBy: row.substituted_by ?? "",
    substituteTime: row.substitute_time ?? "",
    substituteYellowCard: Boolean(row.substitute_yellow_card),
    substituteRedCard: Boolean(row.substitute_red_card),
  };
}

function cleanChanges(input: EditableAppearance) {
  const changes: EditableAppearance = {};
  for (const field of Object.keys(input) as Array<keyof EditableAppearance>) {
    if (textFields.has(field)) {
      const max = field === "substituteTime" ? 40 : 200;
      Object.assign(changes, {
        [field]: String(input[field] ?? "")
          .trim()
          .slice(0, max),
      });
    } else if (booleanFields.has(field) && typeof input[field] === "boolean") {
      Object.assign(changes, { [field]: input[field] });
    }
  }
  return changes;
}

function validateChanges(changes: EditableAppearance) {
  if (changes.playerName !== undefined && !changes.playerName)
    return "An appearance must have a player.";
  if (
    changes.shirtNumber &&
    (!/^\d{1,3}$/.test(changes.shirtNumber) ||
      Number(changes.shirtNumber) > 999)
  )
    return "Enter a valid shirt number.";
  if (
    changes.substituteTime &&
    !/^\d{1,3}(?:\+\d{1,2})?'?$/.test(changes.substituteTime)
  )
    return "Enter a valid substitution minute, such as 74 or 90+3.";
  return null;
}

async function getAppearance(db: D1Database, id: string) {
  return db
    .prepare(
      `SELECT id, season, match_date, opposition, player_name,
      shirt_number, yellow_card, red_card, substituted_by, substitute_time,
      substitute_yellow_card, substitute_red_card FROM Apps WHERE id = ?`,
    )
    .bind(id)
    .first<AppearanceRecord>();
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
    return error("Please log in before suggesting appearance changes.", 401);
  const body = (await request.json()) as {
    appearanceId?: string;
    changes?: EditableAppearance;
    source?: string;
    explanation?: string;
  };
  if (!body.appearanceId || !body.changes || typeof body.changes !== "object")
    return error("Change at least one appearance detail.", 400);

  const db = getCloudflareContext().env.DB;
  const appearance = await getAppearance(db, body.appearanceId);
  if (!appearance) return error("That appearance could not be found.", 404);
  const current = snapshot(appearance);
  const requested = cleanChanges(body.changes);
  const changes = Object.fromEntries(
    Object.entries(requested).filter(
      ([field, value]) => value !== current[field as keyof EditableAppearance],
    ),
  ) as EditableAppearance;
  if (!Object.keys(changes).length)
    return error(
      "Those details are already recorded for this appearance.",
      409,
    );
  const validationError = validateChanges(changes);
  if (validationError) return error(validationError, 400);
  for (const name of [changes.playerName, changes.substitutedBy]) {
    if (name && !(await playerExists(db, name)))
      return error(`${name} could not be matched to a player profile.`, 400);
  }

  await ensureAppearanceCorrectionsTable(db);
  const changesJson = JSON.stringify(changes);
  const duplicate = await db
    .prepare(
      `SELECT id FROM AppearanceCorrections
    WHERE appearance_id = ? AND submitted_by_sub = ? AND changes_json = ? AND status = 'pending'`,
    )
    .bind(appearance.id, session.user.sub, changesJson)
    .first();
  if (duplicate)
    return error("You have already submitted these appearance changes.", 409);
  await db
    .prepare(
      `INSERT INTO AppearanceCorrections (
    id, appearance_id, season, match_date, opposition, current_json, changes_json,
    source, explanation, submitted_by_sub, submitted_by_name, submitted_at, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .bind(
      crypto.randomUUID(),
      appearance.id,
      String(appearance.season),
      appearance.match_date,
      appearance.opposition,
      JSON.stringify(current),
      changesJson,
      body.source?.trim().slice(0, 1000) || null,
      body.explanation?.trim().slice(0, 1000) || null,
      session.user.sub,
      session.user.name || session.user.email || "Supporter",
      new Date().toISOString(),
    )
    .run();
  return NextResponse.json(
    { message: "Appearance changes are awaiting review." },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return error("You do not have permission to review corrections.", 403);
  const body = (await request.json()) as {
    id?: string;
    status?: AppearanceCorrectionStatus;
    reviewNote?: string;
  };
  if (!body.id || (body.status !== "approved" && body.status !== "rejected"))
    return error("Choose whether to approve or reject this correction.", 400);
  const db = getCloudflareContext().env.DB;
  await ensureAppearanceCorrectionsTable(db);
  const correction = await db
    .prepare(
      `SELECT appearance_id, season, match_date, changes_json
    FROM AppearanceCorrections WHERE id = ? AND status = 'pending'`,
    )
    .bind(body.id)
    .first<{
      appearance_id: string;
      season: string;
      match_date: string;
      changes_json: string;
    }>();
  if (!correction)
    return error("This correction has already been reviewed.", 409);
  const reviewNote = body.reviewNote?.trim().slice(0, 1000) || null;
  if (body.status === "approved") {
    const appearance = await getAppearance(db, correction.appearance_id);
    if (!appearance)
      return error("The appearance record could not be found.", 404);
    const changes = cleanChanges(
      parseEditableAppearance(correction.changes_json),
    );
    const validationError = validateChanges(changes);
    if (validationError) return error(validationError, 400);
    for (const name of [changes.playerName, changes.substitutedBy]) {
      if (name && !(await playerExists(db, name)))
        return error(`${name} could not be matched to a player profile.`, 400);
    }
    const next = { ...snapshot(appearance), ...changes };
    const results = await db.batch([
      db
        .prepare(
          `UPDATE Apps SET player_name = ?, shirt_number = ?, yellow_card = ?, red_card = ?,
        substituted_by = ?, substitute_time = ?, substitute_yellow_card = ?, substitute_red_card = ? WHERE id = ?`,
        )
        .bind(
          next.playerName,
          next.shirtNumber === "" ? null : Number(next.shirtNumber),
          Number(next.yellowCard),
          Number(next.redCard),
          next.substitutedBy || null,
          next.substituteTime || null,
          Number(next.substituteYellowCard),
          Number(next.substituteRedCard),
          appearance.id,
        ),
      db
        .prepare(
          `UPDATE AppearanceCorrections SET status = 'approved', reviewed_by = ?, reviewed_at = ?, review_note = ?
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
    for (const name of new Set(
      [
        appearance.player_name,
        appearance.substituted_by,
        next.playerName,
        next.substitutedBy,
      ].filter((name): name is string => Boolean(name)),
    ))
      revalidatePath(`/page/player/${encodeURIComponent(name)}`);
  } else {
    await db
      .prepare(
        `UPDATE AppearanceCorrections SET status = 'rejected', reviewed_by = ?, reviewed_at = ?, review_note = ?
      WHERE id = ? AND status = 'pending'`,
      )
      .bind(session.user.email, new Date().toISOString(), reviewNote, body.id)
      .run();
  }
  revalidatePath(`/match/${correction.season}/${correction.match_date}`);
  revalidatePath(`/season/${correction.season}`);
  return NextResponse.json({
    message: `Appearance correction ${body.status}.`,
  });
}
