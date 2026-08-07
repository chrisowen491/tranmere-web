import { auth0 } from "@/lib/auth0";
import { getAdminSession } from "@/lib/adminAuth";
import {
  ensureFormationCorrectionsTable,
  isFormation,
  type FormationCorrectionStatus,
} from "@/lib/formationCorrections";
import { getGameBySeasonAndDate } from "@/lib/games";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in before suggesting a formation.", 401);
  const body = (await request.json()) as {
    season?: string;
    matchDate?: string;
    proposedFormation?: string;
    explanation?: string;
  };
  if (
    !body.season ||
    !body.matchDate ||
    !/^\d{4}$/.test(body.season) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.matchDate) ||
    !body.proposedFormation ||
    !isFormation(body.proposedFormation)
  ) {
    return error("Choose a recognised formation.", 400);
  }
  const env = getCloudflareContext().env;
  const match = await getGameBySeasonAndDate(
    env.DB,
    body.season,
    body.matchDate,
  );
  if (!match) return error("That match could not be found.", 404);
  await ensureFormationCorrectionsTable(env.DB);
  const duplicate = await env.DB.prepare(
    `SELECT id FROM MatchFormationCorrections
     WHERE season = ? AND match_date = ? AND submitted_by_sub = ?
       AND proposed_formation = ? AND status = 'pending'`,
  )
    .bind(body.season, body.matchDate, session.user.sub, body.proposedFormation)
    .first();
  if (duplicate)
    return error("That formation is already awaiting review.", 409);
  await env.DB.prepare(
    `INSERT INTO MatchFormationCorrections (
       id, season, match_date, home_team, away_team, current_formation,
       proposed_formation, explanation, submitted_by_sub, submitted_by_name,
       submitted_at, status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
  )
    .bind(
      crypto.randomUUID(),
      body.season,
      body.matchDate,
      match.home || "Tranmere Rovers",
      match.visitor || match.opposition || "Unknown",
      match.formation || null,
      body.proposedFormation,
      body.explanation?.trim().slice(0, 1000) || null,
      session.user.sub,
      session.user.name || session.user.email || "Supporter",
      new Date().toISOString(),
    )
    .run();
  return NextResponse.json(
    { message: "Formation suggestion is awaiting review." },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return error("You do not have permission to review corrections.", 403);
  const body = (await request.json()) as {
    id?: string;
    status?: FormationCorrectionStatus;
    reviewNote?: string;
  };
  if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
    return error("Choose whether to approve or reject this correction.", 400);
  }
  const db = getCloudflareContext().env.DB;
  await ensureFormationCorrectionsTable(db);
  const correction = await db
    .prepare(
      `SELECT season, match_date, proposed_formation FROM MatchFormationCorrections
     WHERE id = ? AND status = 'pending'`,
    )
    .bind(body.id)
    .first<{
      season: string;
      match_date: string;
      proposed_formation: string;
    }>();
  if (!correction)
    return error("This correction has already been reviewed.", 409);
  if (body.status === "approved") {
    const update = await db
      .prepare(
        "UPDATE Games SET formation = ? WHERE season = ? AND match_date = ?",
      )
      .bind(
        correction.proposed_formation,
        Number(correction.season),
        correction.match_date,
      )
      .run();
    if (!update.meta.changes)
      return error("The main match record could not be found.", 404);
  }
  await db
    .prepare(
      `UPDATE MatchFormationCorrections
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
  return NextResponse.json({ message: `Formation correction ${body.status}.` });
}
