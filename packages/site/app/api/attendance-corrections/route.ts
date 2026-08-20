import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { getAdminSession } from "@/lib/adminAuth";
import { getGameBySeasonAndDate } from "@/lib/games";
import {
  ensureAttendanceCorrectionsTable,
  type AttendanceCorrectionStatus,
} from "@/lib/attendanceCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface CorrectionRequest {
  season?: string;
  matchDate?: string;
  homeTeam?: string;
  awayTeam?: string;
  currentAttendance?: number | null;
  proposedAttendance?: number;
  source?: string;
  explanation?: string;
}

interface ReviewRequest {
  id?: string;
  status?: AttendanceCorrectionStatus;
  reviewNote?: string;
}

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in before submitting a correction.", 401);

  const body = (await request.json()) as CorrectionRequest;
  const proposedAttendance = Number(body.proposedAttendance);

  if (
    !body.season ||
    !body.matchDate ||
    !/^\d{4}$/.test(body.season) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.matchDate) ||
    !Number.isInteger(proposedAttendance) ||
    proposedAttendance < 1 ||
    proposedAttendance > 200000
  ) {
    return error("Please enter a valid attendance.", 400);
  }

  const source = body.source?.trim().slice(0, 1000) || "";

  const explanation = body.explanation?.trim().slice(0, 1000) || null;
  const env = getCloudflareContext().env;
  const match = await getGameBySeasonAndDate(
    env.DB,
    body.season,
    body.matchDate,
  );
  if (!match) {
    return error("That match could not be found.", 404);
  }
  const currentAttendance = match.attendance ?? null;
  if (currentAttendance === proposedAttendance) {
    return error("That attendance is already shown on the match page.", 409);
  }

  const db = env.DB;
  await ensureAttendanceCorrectionsTable(db);
  const account = await resolveAccount(db, session.user.sub);

  const duplicate = await db
    .prepare(
      `SELECT id FROM MatchAttendanceCorrections
       WHERE season = ? AND match_date = ? AND submitted_by_account_id = ?
         AND proposed_attendance = ? AND status = 'pending'
       LIMIT 1`,
    )
    .bind(body.season, body.matchDate, account.id, proposedAttendance)
    .first();

  if (duplicate) {
    return error("You have already submitted this correction for review.", 409);
  }

  await db
    .prepare(
      `INSERT INTO MatchAttendanceCorrections (
        id, season, match_date, home_team, away_team, current_attendance,
        proposed_attendance, source, explanation, submitted_by_account_id,
        submitted_by_name, submitted_by_email, submitted_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .bind(
      crypto.randomUUID(),
      body.season,
      body.matchDate,
      (match.home || body.homeTeam || "Tranmere Rovers").slice(0, 100),
      (match.visitor || body.awayTeam || match.opposition || "Unknown").slice(
        0,
        100,
      ),
      currentAttendance,
      proposedAttendance,
      source,
      explanation,
      account.id,
      session.user.name || session.user.email || "Supporter",
      session.user.email || null,
      new Date().toISOString(),
    )
    .run();

  return NextResponse.json(
    { message: "Correction submitted for review." },
    { status: 201 },
  );
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
  await ensureAttendanceCorrectionsTable(db);
  const correction = await db
    .prepare(
      `SELECT season, match_date, proposed_attendance
       FROM MatchAttendanceCorrections
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(body.id)
    .first<{
      season: string;
      match_date: string;
      proposed_attendance: number;
    }>();

  if (!correction) {
    return error("This correction has already been reviewed.", 409);
  }

  if (body.status === "approved") {
    const gameUpdate = await db
      .prepare(
        `UPDATE Games
         SET attendance = ?
         WHERE season = ? AND match_date = ?`,
      )
      .bind(
        correction.proposed_attendance,
        Number(correction.season),
        correction.match_date,
      )
      .run();
    if (!gameUpdate.meta.changes) {
      return error("The main match record could not be found.", 404);
    }
  }

  await db
    .prepare(
      `UPDATE MatchAttendanceCorrections
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

  revalidatePath(`/match/${correction.season}/${correction.match_date}`);
  revalidatePath(`/season/${correction.season}`);
  revalidatePath("/results");
  revalidatePath("/results/top-attendances");

  return NextResponse.json({ message: `Correction ${body.status}.` });
}
