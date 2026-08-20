import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import {
  getOwnedFantasyTeam,
  validateFantasyTeamInput,
} from "@/lib/fantasyTeams";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  const { id } = await context.params;
  const db = getCloudflareContext().env.DB;
  const { id: accountId } = await resolveAccount(db, session.user.sub);
  const existing = await getOwnedFantasyTeam(db, id, accountId);
  if (!existing)
    return NextResponse.json(
      { message: "Fantasy XI not found." },
      { status: 404 },
    );
  try {
    const body = (await request.json()) as { action?: string };
    if (body.action === "share") {
      const shareId = existing.shareId ?? crypto.randomUUID();
      await db
        .prepare(
          "UPDATE FantasyTeams SET share_id = ?, is_shared = 1, updated_at = ? WHERE id = ? AND account_id = ?",
        )
        .bind(shareId, new Date().toISOString(), id, accountId)
        .run();
      return NextResponse.json({ shareId, message: "Public sharing enabled." });
    }
    if (body.action === "revoke") {
      await db
        .prepare(
          "UPDATE FantasyTeams SET share_id = NULL, is_shared = 0, updated_at = ? WHERE id = ? AND account_id = ?",
        )
        .bind(new Date().toISOString(), id, accountId)
        .run();
      return NextResponse.json({ message: "Public sharing revoked." });
    }
    const input = await validateFantasyTeamInput(db, body);
    await db
      .prepare(
        `UPDATE FantasyTeams SET name = ?, rationale = ?, formation = ?, kit = ?,
      captain_player_id = ?, assignments_json = ?, updated_at = ? WHERE id = ? AND account_id = ?`,
      )
      .bind(
        input.name,
        input.rationale || null,
        input.formation,
        input.kit,
        input.captainPlayerId,
        JSON.stringify(input.assignments),
        new Date().toISOString(),
        id,
        accountId,
      )
      .run();
    return NextResponse.json({ id, message: "Fantasy XI updated." });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to update this XI.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  const { id } = await context.params;
  const db = getCloudflareContext().env.DB;
  const { id: accountId } = await resolveAccount(db, session.user.sub);
  const result = await db
    .prepare("DELETE FROM FantasyTeams WHERE id = ? AND account_id = ?")
    .bind(id, accountId)
    .run();
  if (!result.meta.changes)
    return NextResponse.json(
      { message: "Fantasy XI not found." },
      { status: 404 },
    );
  return NextResponse.json({ message: "Fantasy XI deleted." });
}
