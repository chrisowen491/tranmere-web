import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
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
  const { id: accountId } = await resolveAccount(db, session.user.sub);
  return NextResponse.json({
    teams: await listFantasyTeams(db, accountId),
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
    const { id: accountId } = await resolveAccount(db, session.user.sub);
    await ensureUserProfile(db, accountId);
    const input = await validateFantasyTeamInput(db, await request.json());
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db
      .prepare(
        `INSERT INTO FantasyTeams (
      id, account_id, name, rationale, formation, kit, captain_player_id,
      assignments_json, share_id, is_shared, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)`,
      )
      .bind(
        id,
        accountId,
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
