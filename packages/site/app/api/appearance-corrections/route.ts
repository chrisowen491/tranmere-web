import { getAdminSession } from "@/lib/adminAuth";
import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import {
  isNewAppearanceCorrection,
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
  substitute_substituted_by: string | null;
  substitute_time: string | null;
  substitute_yellow_card: number;
  substitute_red_card: number;
}

interface MatchRecord {
  season: number;
  match_date: string;
  opposition: string;
  competition: string | null;
}

const textFields = new Set<keyof EditableAppearance>([
  "playerName",
  "shirtNumber",
  "substitutedBy",
  "substituteSubstitutedBy",
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
    substituteSubstitutedBy: row.substitute_substituted_by ?? "",
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

function completeNewAppearance(input: EditableAppearance) {
  const cleaned = cleanChanges(input);
  return {
    playerName: cleaned.playerName ?? "",
    shirtNumber: cleaned.shirtNumber ?? "",
    yellowCard: cleaned.yellowCard ?? false,
    redCard: cleaned.redCard ?? false,
    substitutedBy: cleaned.substitutedBy ?? "",
    substituteSubstitutedBy: cleaned.substituteSubstitutedBy ?? "",
    substituteTime: cleaned.substituteTime ?? "",
    substituteYellowCard: cleaned.substituteYellowCard ?? false,
    substituteRedCard: cleaned.substituteRedCard ?? false,
  } satisfies Required<EditableAppearance>;
}

async function getAppearance(db: D1Database, id: string) {
  return db
    .prepare(
      `SELECT id, season, match_date, opposition, player_name,
      shirt_number, yellow_card, red_card, substituted_by, substitute_substituted_by, substitute_time,
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

async function getMatch(db: D1Database, season: string, matchDate: string) {
  return db
    .prepare(
      `SELECT season, match_date, opposition, competition
       FROM Games WHERE season = ? AND match_date = ? LIMIT 1`,
    )
    .bind(Number(season), matchDate)
    .first<MatchRecord>();
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in before suggesting appearance changes.", 401);
  const body = (await request.json()) as {
    appearanceId?: string;
    changes?: EditableAppearance;
    season?: string;
    matchDate?: string;
    newAppearances?: EditableAppearance[];
    source?: string;
    explanation?: string;
  };
  const db = getCloudflareContext().env.DB;
  const account = await resolveAccount(db, session.user.sub);
  if (Array.isArray(body.newAppearances)) {
    if (!body.season || !body.matchDate || !body.newAppearances.length)
      return error("Add at least one missing player.", 400);
    if (body.newAppearances.length > 11)
      return error(
        "A single submission can contain no more than 11 players.",
        400,
      );

    const match = await getMatch(db, body.season, body.matchDate);
    if (!match) return error("That match could not be found.", 404);
    const proposed = body.newAppearances.map(completeNewAppearance);
    const names = proposed.map(({ playerName }) => playerName);
    if (names.some((name) => !name))
      return error("Every missing appearance must have a player.", 400);
    if (new Set(names.map((name) => name.toLowerCase())).size !== names.length)
      return error("Each proposed player can only be listed once.", 400);
    for (const appearance of proposed) {
      const validationError = validateChanges(appearance);
      if (validationError) return error(validationError, 400);
      const existing = await db
        .prepare(
          "SELECT id FROM Apps WHERE season = ? AND match_date = ? AND player_name = ? LIMIT 1",
        )
        .bind(match.season, match.match_date, appearance.playerName)
        .first();
      if (existing)
        return error(
          `${appearance.playerName} is already recorded in this lineup.`,
          409,
        );
    }

    const pending = await db
      .prepare(
        `SELECT changes_json FROM AppearanceCorrections
         WHERE season = ? AND match_date = ? AND status = 'pending'
           AND appearance_id LIKE 'new:%'`,
      )
      .bind(String(match.season), match.match_date)
      .all<{ changes_json: string }>();
    const pendingNames = new Set(
      pending.results
        .map(
          ({ changes_json }) =>
            parseEditableAppearance(changes_json).playerName,
        )
        .filter(Boolean),
    );
    const duplicate = names.find((name) => pendingNames.has(name));
    if (duplicate)
      return error(
        `${duplicate} is already awaiting review for this lineup.`,
        409,
      );

    const submittedAt = new Date().toISOString();
    await db.batch(
      proposed.map((appearance) => {
        const proposalId = crypto.randomUUID();
        return db
          .prepare(
            `INSERT INTO AppearanceCorrections (
              id, appearance_id, season, match_date, opposition, current_json, changes_json,
              source, explanation, submitted_by_account_id, submitted_by_name, submitted_at, status
            ) VALUES (?, ?, ?, ?, ?, '{}', ?, ?, ?, ?, ?, ?, 'pending')`,
          )
          .bind(
            proposalId,
            `new:${proposalId}`,
            String(match.season),
            match.match_date,
            match.opposition,
            JSON.stringify(appearance),
            body.source?.trim().slice(0, 1000) || null,
            body.explanation?.trim().slice(0, 1000) || null,
            account.id,
            session.user.name || session.user.email || "Supporter",
            submittedAt,
          );
      }),
    );
    return NextResponse.json(
      {
        message: `${proposed.length} missing ${proposed.length === 1 ? "appearance is" : "appearances are"} awaiting review.`,
      },
      { status: 201 },
    );
  }

  if (!body.appearanceId || !body.changes || typeof body.changes !== "object")
    return error("Change at least one appearance detail.", 400);

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
  for (const name of [
    changes.playerName,
    changes.substitutedBy,
    changes.substituteSubstitutedBy,
  ]) {
    if (name && !(await playerExists(db, name)))
      return error(`${name} could not be matched to a player profile.`, 400);
  }

  const changesJson = JSON.stringify(changes);
  const duplicate = await db
    .prepare(
      `SELECT id FROM AppearanceCorrections
    WHERE appearance_id = ? AND submitted_by_account_id = ? AND changes_json = ? AND status = 'pending'`,
    )
    .bind(appearance.id, account.id, changesJson)
    .first();
  if (duplicate)
    return error("You have already submitted these appearance changes.", 409);
  await db
    .prepare(
      `INSERT INTO AppearanceCorrections (
    id, appearance_id, season, match_date, opposition, current_json, changes_json,
    source, explanation, submitted_by_account_id, submitted_by_name, submitted_at, status
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
      account.id,
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
  const correction = await db
    .prepare(
      `SELECT appearance_id, season, match_date, opposition, changes_json
    FROM AppearanceCorrections WHERE id = ? AND status = 'pending'`,
    )
    .bind(body.id)
    .first<{
      appearance_id: string;
      season: string;
      match_date: string;
      opposition: string;
      changes_json: string;
    }>();
  if (!correction)
    return error("This correction has already been reviewed.", 409);
  const reviewNote = body.reviewNote?.trim().slice(0, 1000) || null;
  if (body.status === "approved") {
    if (isNewAppearanceCorrection(correction.appearance_id)) {
      const changes = completeNewAppearance(
        parseEditableAppearance(correction.changes_json),
      );
      const validationError = validateChanges(changes);
      if (validationError) return error(validationError, 400);
      const match = await getMatch(
        db,
        correction.season,
        correction.match_date,
      );
      if (!match) return error("The match record could not be found.", 404);
      const existing = await db
        .prepare(
          "SELECT id FROM Apps WHERE season = ? AND match_date = ? AND player_name = ? LIMIT 1",
        )
        .bind(match.season, match.match_date, changes.playerName)
        .first();
      if (existing)
        return error(
          `${changes.playerName} is already recorded in this lineup.`,
          409,
        );
      const results = await db.batch([
        db
          .prepare(
            `INSERT INTO Apps (
              id, season, match_date, player_name, competition, opposition,
              shirt_number, yellow_card, red_card, substitute_yellow_card,
              substitute_red_card, substitute_time, substituted_by,
              substitute_substituted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            crypto.randomUUID(),
            match.season,
            match.match_date,
            changes.playerName,
            match.competition,
            match.opposition,
            changes.shirtNumber === "" ? null : Number(changes.shirtNumber),
            Number(changes.yellowCard),
            Number(changes.redCard),
            Number(changes.substituteYellowCard),
            Number(changes.substituteRedCard),
            changes.substituteTime || null,
            changes.substitutedBy || null,
            changes.substituteSubstitutedBy || null,
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
        return error("The missing appearance could not be published.", 409);
      for (const name of [
        changes.playerName,
        changes.substitutedBy,
        changes.substituteSubstitutedBy,
      ].filter((value): value is string => Boolean(value)))
        revalidatePath(`/page/player/${encodeURIComponent(name)}`);
    } else {
      const appearance = await getAppearance(db, correction.appearance_id);
      if (!appearance)
        return error("The appearance record could not be found.", 404);
      const changes = cleanChanges(
        parseEditableAppearance(correction.changes_json),
      );
      const validationError = validateChanges(changes);
      if (validationError) return error(validationError, 400);
      for (const name of [
        changes.playerName,
        changes.substitutedBy,
        changes.substituteSubstitutedBy,
      ]) {
        if (name && !(await playerExists(db, name)))
          return error(
            `${name} could not be matched to a player profile.`,
            400,
          );
      }
      const next = { ...snapshot(appearance), ...changes };
      const results = await db.batch([
        db
          .prepare(
            `UPDATE Apps SET player_name = ?, shirt_number = ?, yellow_card = ?, red_card = ?,
        substituted_by = ?, substitute_substituted_by = ?, substitute_time = ?, substitute_yellow_card = ?, substitute_red_card = ? WHERE id = ?`,
          )
          .bind(
            next.playerName,
            next.shirtNumber === "" ? null : Number(next.shirtNumber),
            Number(next.yellowCard),
            Number(next.redCard),
            next.substitutedBy || null,
            next.substituteSubstitutedBy || null,
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
          appearance.substitute_substituted_by,
          next.playerName,
          next.substitutedBy,
          next.substituteSubstitutedBy,
        ].filter((name): name is string => Boolean(name)),
      ))
        revalidatePath(`/page/player/${encodeURIComponent(name)}`);
    }
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
