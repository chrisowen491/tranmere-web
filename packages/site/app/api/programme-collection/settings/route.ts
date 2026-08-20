import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { updateCollectionVisibility } from "@/lib/programmeCollections";
import { ensureUserProfile } from "@/lib/userProfiles";

export async function PUT(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  }
  const body = (await request.json()) as { visible?: boolean };
  const db = getCloudflareContext().env.DB;
  const { id: accountId } = await resolveAccount(db, session.user.sub);
  await ensureUserProfile(db, accountId);
  const publicId = await updateCollectionVisibility(
    db,
    accountId,
    body.visible === true,
  );
  return NextResponse.json({ publicId });
}
