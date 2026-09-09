import {
  adminError,
  revalidateAdminPaths,
  requireAdminApi,
  requiredText,
} from "@/lib/adminCrud";
import {
  createClubCaptain,
  deleteClubCaptain,
  getClubCaptainById,
  updateClubCaptain,
  type ClubCaptainInput,
} from "@/lib/clubCaptains";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  id?: string;
  season?: number;
  playerName?: string;
  notes?: string;
  sortOrder?: number;
}

function validate(body: RequestBody): ClubCaptainInput | null {
  const season = Number(body.season);
  const playerName = requiredText(body.playerName, 200);
  const sortOrder = Number(body.sortOrder ?? 0);
  if (
    !Number.isInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !playerName ||
    !Number.isInteger(sortOrder)
  )
    return null;
  return {
    season,
    playerName,
    notes: requiredText(body.notes, 500) || null,
    sortOrder,
  };
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("club captains");
  if (forbidden) return forbidden;
  const input = validate((await request.json()) as RequestBody);
  if (!input) return adminError("Enter a valid season and captain name.", 400);
  try {
    const captain = await createClubCaptain(
      getCloudflareContext().env.DB,
      crypto.randomUUID(),
      input,
    );
    revalidateAdminPaths(["/players/club-captains", `/season/${input.season}`]);
    return NextResponse.json({ captain }, { status: 201 });
  } catch {
    return adminError(
      "That player is already listed as a captain for this season.",
      409,
    );
  }
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("club captains");
  if (forbidden) return forbidden;
  const body = (await request.json()) as RequestBody;
  const input = validate(body);
  if (!body.id || !input)
    return adminError("Enter a valid captain record.", 400);
  const db = getCloudflareContext().env.DB;
  const previous = await getClubCaptainById(db, body.id);
  if (!previous)
    return adminError("That captain record could not be found.", 404);
  try {
    const captain = await updateClubCaptain(db, body.id, input);
    revalidateAdminPaths([
      "/players/club-captains",
      `/season/${previous.season}`,
      `/season/${input.season}`,
    ]);
    return NextResponse.json({ captain });
  } catch {
    return adminError(
      "That player is already listed as a captain for this season.",
      409,
    );
  }
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("club captains");
  if (forbidden) return forbidden;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return adminError("Choose a captain record to delete.", 400);
  const db = getCloudflareContext().env.DB;
  const previous = await getClubCaptainById(db, id);
  await deleteClubCaptain(db, id);
  revalidateAdminPaths([
    "/players/club-captains",
    ...(previous ? [`/season/${previous.season}`] : []),
  ]);
  return NextResponse.json({ ok: true });
}
