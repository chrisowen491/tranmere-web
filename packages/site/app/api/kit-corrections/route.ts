import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { getAdminSession } from "@/lib/adminAuth";
import { getGameBySeasonAndDate } from "@/lib/games";
import { isAvatarKit, type KitCorrectionStatus } from "@/lib/kitCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return error("Please log in before suggesting a kit.", 401);
  const body = (await request.json()) as {
    season?: string;
    matchDate?: string;
    proposedKit?: string;
    explanation?: string;
  };
  if (
    !body.season ||
    !body.matchDate ||
    !/^\d{4}$/.test(body.season) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.matchDate) ||
    !body.proposedKit ||
    !isAvatarKit(body.proposedKit)
  ) {
    return error("Choose a recognised Tranmere kit.", 400);
  }
  const env = getCloudflareContext().env;
  const match = await getGameBySeasonAndDate(
    env.DB,
    body.season,
    body.matchDate,
  );
  if (!match) return error("That match could not be found.", 404);
  if (match.kit === body.proposedKit)
    return error("That kit is already shown on the match page.", 409);
  const account = await resolveAccount(env.DB, session.user.sub);
  const duplicate = await env.DB.prepare(
    `SELECT id FROM MatchKitCorrections
     WHERE season = ? AND match_date = ? AND submitted_by_account_id = ?
       AND proposed_kit = ? AND status = 'pending'`,
  )
    .bind(body.season, body.matchDate, account.id, body.proposedKit)
    .first();
  if (duplicate) return error("That kit is already awaiting review.", 409);
  await env.DB.prepare(
    `INSERT INTO MatchKitCorrections (
       id, season, match_date, home_team, away_team, current_kit,
       proposed_kit, explanation, submitted_by_account_id, submitted_by_name,
       submitted_at, status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
  )
    .bind(
      crypto.randomUUID(),
      body.season,
      body.matchDate,
      match.home || "Tranmere Rovers",
      match.visitor || match.opposition || "Unknown",
      match.kit || null,
      body.proposedKit,
      body.explanation?.trim().slice(0, 1000) || null,
      account.id,
      session.user.name || session.user.email || "Supporter",
      new Date().toISOString(),
    )
    .run();
  return NextResponse.json(
    { message: "Kit suggestion is awaiting review." },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return error("You do not have permission to review corrections.", 403);
  const body = (await request.json()) as {
    id?: string;
    status?: KitCorrectionStatus;
    reviewNote?: string;
  };
  if (!body.id || (body.status !== "approved" && body.status !== "rejected"))
    return error("Choose whether to approve or reject this correction.", 400);

  const db = getCloudflareContext().env.DB;
  const correction = await db
    .prepare(
      `SELECT season, match_date, proposed_kit FROM MatchKitCorrections
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(body.id)
    .first<{ season: string; match_date: string; proposed_kit: string }>();
  if (!correction)
    return error("This correction has already been reviewed.", 409);
  if (!isAvatarKit(correction.proposed_kit))
    return error("The suggested kit is no longer recognised.", 409);
  if (body.status === "approved") {
    const update = await db
      .prepare("UPDATE Games SET kit = ? WHERE season = ? AND match_date = ?")
      .bind(
        correction.proposed_kit,
        Number(correction.season),
        correction.match_date,
      )
      .run();
    if (!update.meta.changes)
      return error("The main match record could not be found.", 404);
  }
  await db
    .prepare(
      `UPDATE MatchKitCorrections
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
  return NextResponse.json({ message: `Kit correction ${body.status}.` });
}
