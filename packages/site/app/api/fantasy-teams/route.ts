import { auth0 } from "@/lib/auth0";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { listFantasyTeams, validateFantasyTeamInput } from "@/lib/fantasyTeams";
import { ensureUserProfile } from "@/lib/userProfiles";

export async function GET() {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  const db = getCloudflareContext().env.DB;
  return NextResponse.json({
    teams: await listFantasyTeams(db, session.user.sub),
  });
}

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json(
      { message: "Please log in to save this XI." },
      { status: 401 },
    );
  try {
    const db = getCloudflareContext().env.DB;
    await ensureUserProfile(db, session.user.sub);
    const input = await validateFantasyTeamInput(db, await request.json());
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db
      .prepare(
        `INSERT INTO FantasyTeams (
      id, auth_sub, name, rationale, formation, kit, captain_player_id,
      assignments_json, share_id, is_shared, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)`,
      )
      .bind(
        id,
        session.user.sub,
        input.name,
        input.rationale || null,
        input.formation,
        input.kit,
        input.captainPlayerId,
        JSON.stringify(input.assignments),
        now,
        now,
      )
      .run();
    return NextResponse.json(
      { id, message: "Fantasy XI saved." },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to save this XI.",
      },
      { status: 400 },
    );
  }
}
