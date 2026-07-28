import { auth0 } from "@/lib/auth0";
import { GetBaseUrl } from "@/lib/apiFunctions";
import type { PlayerProfile } from "@/lib/types";
import {
  biographyToText,
  ensurePlayerProfileCorrectionsTable,
  playerPositions,
  type EditablePlayerProfile,
  type PlayerProfileCorrectionStatus,
} from "@/lib/playerProfileCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

interface SubmissionRequest {
  playerName?: string;
  changes?: EditablePlayerProfile;
  source?: string;
  explanation?: string;
}

interface ReviewRequest {
  id?: string;
  status?: PlayerProfileCorrectionStatus;
  reviewNote?: string;
}

const editableFields: (keyof EditablePlayerProfile)[] = [
  "dateOfBirth",
  "biography",
  "picLink",
  "foot",
  "height",
  "placeOfBirth",
  "position",
];

const maxLengths: Record<keyof EditablePlayerProfile, number> = {
  dateOfBirth: 100,
  biography: 10000,
  picLink: 1000,
  foot: 20,
  height: 50,
  placeOfBirth: 200,
  position: 100,
};

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function getAdminEmail() {
  const env = getCloudflareContext().env;
  return env.AUTH0_ADMIN_EMAIL || process.env.AUTH0_ADMIN_EMAIL;
}

function profileSnapshot(profile: PlayerProfile): EditablePlayerProfile {
  return {
    dateOfBirth: profile.player.dateOfBirth ?? "",
    biography: biographyToText(profile.player.biography) ?? "",
    picLink: profile.player.picLink ?? "",
    foot: profile.player.foot ?? "",
    height: profile.player.height ?? "",
    placeOfBirth: profile.player.placeOfBirth ?? "",
    position: profile.player.position ?? "",
  };
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in before submitting a correction.", 401);

  const body = (await request.json()) as SubmissionRequest;
  const requestedName = body.playerName?.trim();
  const source = body.source?.trim().slice(0, 1000);
  if (!requestedName || !source || source.length < 3) {
    return error("A player and source description are required.", 400);
  }

  const submittedChanges = body.changes;
  if (!submittedChanges || typeof submittedChanges !== "object") {
    return error("Please change at least one profile field.", 400);
  }

  const changes: EditablePlayerProfile = {};
  for (const field of editableFields) {
    if (!Object.prototype.hasOwnProperty.call(submittedChanges, field))
      continue;
    const value = String(submittedChanges[field] ?? "")
      .trim()
      .slice(0, maxLengths[field]);
    changes[field] = value;
  }

  if (Object.keys(changes).length === 0) {
    return error("Please change at least one profile field.", 400);
  }
  if (changes.picLink && !/^https:\/\//i.test(changes.picLink)) {
    return error("Picture links must use a secure https:// address.", 400);
  }
  if (changes.picLink) {
    try {
      const pictureHost = new URL(changes.picLink).hostname;
      if (
        ![
          "images.ctfassets.net",
          "images.tranmere-web.com",
          "www.tranmere-web.com",
        ].includes(pictureHost)
      ) {
        throw new Error("Unapproved image host");
      }
    } catch {
      return error(
        "Picture links must use an approved Tranmere-Web image host.",
        400,
      );
    }
  }
  if (
    changes.position !== undefined &&
    !playerPositions.includes(
      changes.position as (typeof playerPositions)[number],
    )
  ) {
    return error("Choose a valid primary position.", 400);
  }

  const env = getCloudflareContext().env;
  const playerResponse = await fetch(
    `${GetBaseUrl(env)}/page/player/${encodeURIComponent(requestedName)}?json=true`,
  );
  if (!playerResponse.ok) return error("That player could not be found.", 404);

  const profile = (await playerResponse.json()) as PlayerProfile;
  if (!profile.player?.name)
    return error("That player could not be found.", 404);

  const current = profileSnapshot(profile);
  const actualChanges = Object.fromEntries(
    Object.entries(changes).filter(
      ([field, value]) =>
        value !== current[field as keyof EditablePlayerProfile],
    ),
  ) as EditablePlayerProfile;

  if (Object.keys(actualChanges).length === 0) {
    return error("Those details already appear on the player profile.", 409);
  }

  await ensurePlayerProfileCorrectionsTable(env.DB);
  const changesJson = JSON.stringify(actualChanges);
  const duplicate = await env.DB.prepare(
    `SELECT id FROM PlayerProfileCorrections
     WHERE player_name = ? AND submitted_by_sub = ? AND changes_json = ?
       AND status = 'pending'
     LIMIT 1`,
  )
    .bind(profile.player.name, session.user.sub, changesJson)
    .first();
  if (duplicate) {
    return error("You have already submitted these changes for review.", 409);
  }

  await env.DB.prepare(
    `INSERT INTO PlayerProfileCorrections (
      id, player_name, current_json, changes_json, source, explanation,
      submitted_by_sub, submitted_by_name, submitted_by_email, submitted_at,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
  )
    .bind(
      crypto.randomUUID(),
      profile.player.name,
      JSON.stringify(current),
      changesJson,
      source,
      body.explanation?.trim().slice(0, 1000) || null,
      session.user.sub,
      session.user.name || session.user.email || "Supporter",
      session.user.email || null,
      new Date().toISOString(),
    )
    .run();

  return NextResponse.json(
    { message: "Profile correction submitted for review." },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  const session = await auth0.getSession();
  const adminEmail = getAdminEmail();
  if (!session || !adminEmail || session.user.email !== adminEmail) {
    return error("You do not have permission to review corrections.", 403);
  }

  const body = (await request.json()) as ReviewRequest;
  if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
    return error("Choose whether to approve or reject this correction.", 400);
  }

  const db = getCloudflareContext().env.DB;
  await ensurePlayerProfileCorrectionsTable(db);
  const correction = await db
    .prepare(
      `SELECT player_name FROM PlayerProfileCorrections
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(body.id)
    .first<{ player_name: string }>();
  if (!correction) {
    return error("This correction has already been reviewed.", 409);
  }

  await db
    .prepare(
      `UPDATE PlayerProfileCorrections
       SET status = ?, reviewed_by = ?, reviewed_at = ?, review_note = ?
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(
      body.status,
      session.user.email,
      new Date().toISOString(),
      body.reviewNote?.trim().slice(0, 1000) || null,
      body.id,
    )
    .run();

  return NextResponse.json({
    message:
      body.status === "approved"
        ? "Correction approved for manual publication."
        : "Correction rejected.",
  });
}
