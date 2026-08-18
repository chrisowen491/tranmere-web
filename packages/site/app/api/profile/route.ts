import { auth0 } from "@/lib/auth0";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  }
  const db = getCloudflareContext().env.DB;
  const authSub = session.user.sub;
  await db.batch([
    db.prepare("DELETE FROM FantasyTeams WHERE auth_sub = ?").bind(authSub),
    db.prepare("DELETE FROM MatchAttendances WHERE auth_sub = ?").bind(authSub),
    db
      .prepare("DELETE FROM ProgrammeCollections WHERE auth_sub = ?")
      .bind(authSub),
    db
      .prepare(
        "DELETE FROM ProgrammeContactRequests WHERE sender_sub = ? OR recipient_sub = ?",
      )
      .bind(authSub, authSub),
    db.prepare("DELETE FROM UserProfiles WHERE auth_sub = ?").bind(authSub),
  ]);
  return NextResponse.json({
    message: "Your supporter data has been removed.",
  });
}
