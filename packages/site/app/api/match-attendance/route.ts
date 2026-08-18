import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
  getMatchAttendance,
  removeMatchAttendance,
  saveMatchAttendance,
} from "@/lib/matchAttendance";
import { ensureUserProfile } from "@/lib/userProfiles";

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function gameIdFrom(request: NextRequest) {
  const body = (await request.json()) as { gameId?: string };
  return body.gameId?.trim();
}

export async function PUT(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in to update your Rovers passport.", 401);
  const gameId = await gameIdFrom(request);
  if (!gameId) return error("Choose a match to add.", 400);
  const db = getCloudflareContext().env.DB;
  const game = await db
    .prepare("SELECT id FROM Games WHERE id = ? LIMIT 1")
    .bind(gameId)
    .first();
  if (!game) return error("That match could not be found.", 404);
  await ensureUserProfile(db, session.user.sub);
  const attendance = await saveMatchAttendance(db, session.user.sub, gameId);
  return NextResponse.json({ attendance });
}

export async function DELETE(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return error("Please log in to update your Rovers passport.", 401);
  const gameId = await gameIdFrom(request);
  if (!gameId) return error("Choose a match to remove.", 400);
  const db = getCloudflareContext().env.DB;
  if (!(await getMatchAttendance(db, session.user.sub, gameId))) {
    return error("That match is not in your Rovers passport.", 404);
  }
  await removeMatchAttendance(db, session.user.sub, gameId);
  return NextResponse.json({
    message: "Match removed from your Rovers passport.",
  });
}
