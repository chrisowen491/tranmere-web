import type { ProgrammeCollectionStatus } from "@tranmere-web/lib/src/d1-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import {
  getCollectionEntry,
  saveCollectionEntry,
} from "@/lib/programmeCollections";
import { ensureUserProfile } from "@/lib/userProfiles";

const statuses = new Set<ProgrammeCollectionStatus>([
  "owned",
  "wanted",
  "trade",
]);

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function PUT(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return error("Please log in to update your collection.", 401);
  const body = (await request.json()) as {
    gameId?: string;
    status?: ProgrammeCollectionStatus;
    conditionNotes?: string;
    purchaseNotes?: string;
  };
  if (!body.gameId || !body.status || !statuses.has(body.status)) {
    return error("Choose a valid collection status.", 400);
  }
  const conditionNotes = body.conditionNotes?.trim().slice(0, 1000) || null;
  const purchaseNotes = body.purchaseNotes?.trim().slice(0, 1000) || null;
  const db = getCloudflareContext().env.DB;
  const game = await db
    .prepare(
      `SELECT id FROM Games
       WHERE id = ?
         AND no_programme_issued = 0
       LIMIT 1`,
    )
    .bind(body.gameId)
    .first();
  if (!game) return error("That programme could not be found.", 404);
  const { id: accountId } = await resolveAccount(db, session.user.sub);
  await ensureUserProfile(db, accountId);
  const entry = await saveCollectionEntry(
    db,
    accountId,
    body.gameId,
    body.status,
    conditionNotes,
    purchaseNotes,
  );
  return NextResponse.json({ entry });
}

export async function DELETE(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return error("Please log in to update your collection.", 401);
  const body = (await request.json()) as { gameId?: string };
  if (!body.gameId) return error("Choose a programme to remove.", 400);
  const db = getCloudflareContext().env.DB;
  const { id: accountId } = await resolveAccount(db, session.user.sub);
  if (!(await getCollectionEntry(db, accountId, body.gameId))) {
    return error("That programme is not in your collection.", 404);
  }
  await db
    .prepare(
      "DELETE FROM ProgrammeCollections WHERE account_id = ? AND game_id = ?",
    )
    .bind(accountId, body.gameId)
    .run();
  return NextResponse.json({
    message: "Programme removed from your collection.",
  });
}
