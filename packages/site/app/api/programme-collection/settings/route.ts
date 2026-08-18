import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
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
  await ensureUserProfile(db, session.user.sub);
  const publicId = await updateCollectionVisibility(
    db,
    session.user.sub,
    body.visible === true,
  );
  return NextResponse.json({ publicId });
}
