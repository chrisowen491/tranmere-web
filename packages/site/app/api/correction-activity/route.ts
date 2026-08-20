import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import {
  withdrawCorrection,
  type CorrectionKind,
} from "@/lib/correctionActivity";
import { ensureUserProfile, supporterUsername } from "@/lib/userProfiles";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

const kinds = new Set<CorrectionKind>([
  "attendance",
  "formation",
  "player-profile",
  "kit",
  "goal",
  "goal-submission",
  "appearance",
]);

export async function DELETE(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  const body = (await request.json()) as { id?: string; kind?: CorrectionKind };
  if (!body.id || !body.kind || !kinds.has(body.kind))
    return NextResponse.json(
      { message: "Choose a correction to withdraw." },
      { status: 400 },
    );
  const db = getCloudflareContext().env.DB;
  const account = await resolveAccount(db, session.user.sub);
  const withdrawn = await withdrawCorrection(
    db,
    account.id,
    body.kind,
    body.id,
  );
  if (!withdrawn)
    return NextResponse.json(
      { message: "That pending correction could not be withdrawn." },
      { status: 409 },
    );
  return NextResponse.json({ message: "Correction withdrawn." });
}

export async function PUT(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  const body = (await request.json()) as { visible?: boolean };
  const db = getCloudflareContext().env.DB;
  const account = await resolveAccount(db, session.user.sub);
  await ensureUserProfile(db, account.id);
  const username = supporterUsername(session.user);
  if (body.visible === true && !username)
    return NextResponse.json(
      {
        message: "Add a username to your account before enabling recognition.",
      },
      { status: 400 },
    );
  await db
    .prepare(
      `UPDATE UserProfiles
       SET correction_recognition_visible = ?, correction_username = ?
       WHERE account_id = ?`,
    )
    .bind(body.visible === true ? 1 : 0, username ?? null, account.id)
    .run();
  return NextResponse.json({ visible: body.visible === true });
}
