import { auth0 } from "@/lib/auth0";
import { getAdminSession } from "@/lib/adminAuth";
import {
  approvePlayerProfileCorrection,
  ensurePlayerProfileCorrectionsTable,
  normalizeDateOfBirth,
  type EditablePlayerProfile,
  type PlayerProfileCorrectionStatus,
} from "@/lib/playerProfileCorrections";
import { getPlayerByName, type PlayerRecord } from "@/lib/players";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PLAYER_POSITIONS } from "@tranmere-web/lib/src/player-constants";
import { revalidatePath } from "next/cache";
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

function profileSnapshot(player: PlayerRecord): EditablePlayerProfile {
  return {
    dateOfBirth: player.dateOfBirth ?? "",
    biography: player.biographyMarkdown ?? "",
    picLink: player.picLink ?? "",
    foot: player.foot ?? "",
    height: player.height ?? "",
    placeOfBirth: player.placeOfBirth ?? "",
    position: player.position ?? "",
  };
}

async function withD1ResetRetry<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason);
    if (!message.includes("D1 DB storage caused object to be reset")) {
      throw reason;
    }
    return operation();
  }
}

async function submitCorrection(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in before submitting a correction.", 401);

  const body = (await request.json()) as SubmissionRequest;
  const requestedName = body.playerName?.trim();
  const source =
    typeof body.source === "string" ? body.source.trim().slice(0, 1000) : "";
  if (!requestedName) {
    return error("Choose a player before submitting a correction.", 400);
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
  if (changes.dateOfBirth !== undefined) {
    const dateOfBirth = normalizeDateOfBirth(changes.dateOfBirth);
    if (dateOfBirth === null) {
      return error("Choose a valid date of birth.", 400);
    }
    changes.dateOfBirth = dateOfBirth;
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
          "img.tranmere-web.com",
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
    !PLAYER_POSITIONS.includes(
      changes.position as (typeof PLAYER_POSITIONS)[number],
    )
  ) {
    return error("Choose a valid primary position.", 400);
  }

  const env = getCloudflareContext().env;
  const player = await getPlayerByName(env.DB, requestedName);
  if (!player) return error("That player could not be found.", 404);

  const current = profileSnapshot(player);
  const actualChanges = Object.fromEntries(
    Object.entries(changes).filter(
      ([field, value]) =>
        value !== current[field as keyof EditablePlayerProfile],
    ),
  ) as EditablePlayerProfile;

  if (Object.keys(actualChanges).length === 0) {
    return error("Those details already appear on the player profile.", 409);
  }

  await withD1ResetRetry(() => ensurePlayerProfileCorrectionsTable(env.DB));
  const changesJson = JSON.stringify(actualChanges);
  const duplicate = await withD1ResetRetry(() =>
    env.DB.prepare(
      `SELECT id FROM PlayerProfileCorrections
       WHERE player_name = ? AND submitted_by_sub = ? AND changes_json = ?
         AND status = 'pending'
       LIMIT 1`,
    )
      .bind(player.name, session.user.sub, changesJson)
      .first(),
  );
  if (duplicate) {
    return error("You have already submitted these changes for review.", 409);
  }

  const correctionId = crypto.randomUUID();
  await withD1ResetRetry(() =>
    env.DB.prepare(
      `INSERT INTO PlayerProfileCorrections (
        id, player_name, current_json, changes_json, source, explanation,
        submitted_by_sub, submitted_by_name, submitted_by_email, submitted_at,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      ON CONFLICT(id) DO NOTHING`,
    )
      .bind(
        correctionId,
        player.name,
        JSON.stringify(current),
        changesJson,
        source,
        body.explanation?.trim().slice(0, 1000) || null,
        session.user.sub,
        session.user.name || session.user.email || "Supporter",
        session.user.email || null,
        new Date().toISOString(),
      )
      .run(),
  );

  return NextResponse.json(
    { message: "Profile correction submitted for review." },
    { status: 201 },
  );
}

export async function POST(request: NextRequest) {
  try {
    return await submitCorrection(request);
  } catch (reason) {
    console.error("Unable to submit player profile correction", reason);
    return error(
      "The correction service was temporarily unavailable. Please try again.",
      503,
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return error("You do not have permission to review corrections.", 403);
  }

  const body = (await request.json()) as ReviewRequest;
  if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
    return error("Choose whether to approve or reject this correction.", 400);
  }

  const db = getCloudflareContext().env.DB;
  const reviewNote = body.reviewNote?.trim().slice(0, 1000) || null;

  if (body.status === "approved") {
    try {
      const player = await approvePlayerProfileCorrection(
        db,
        body.id,
        session.user.email,
        reviewNote,
      );
      if (!player) {
        return error("This correction has already been reviewed.", 409);
      }

      revalidatePath(`/page/player/${player.name}`);
      revalidatePath("/");
      revalidatePath("/players");
      revalidatePath("/fantasy-team");
      revalidatePath("/who-am-i");
      revalidatePath("/players/partnerships");
      revalidatePath("/managers/trusted-xi");
      revalidatePath("/players/top-scorers-by-season");
      revalidatePath("/players/lethal-finishers");
      revalidatePath("/players/records/[slug]", "page");
      revalidatePath("/season/[slug]", "page");

      return NextResponse.json({
        message: "Correction approved and published to the player profile.",
      });
    } catch (reason) {
      return error(
        reason instanceof Error
          ? reason.message
          : "The correction could not be published.",
        400,
      );
    }
  }

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
      reviewNote,
      body.id,
    )
    .run();

  return NextResponse.json({
    message: "Correction rejected.",
  });
}
