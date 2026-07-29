import { auth0 } from "@/lib/auth0";
import {
  createClub,
  getClubById,
  updateClub,
  type ClubInput,
} from "@/lib/clubs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface ClubRequest {
  id?: string;
  name?: string;
  shortName?: string;
  threeLetterName?: string;
  nicknames?: string;
  primaryColour?: string;
  secondaryColour?: string;
  highestDivision?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function requireAdmin() {
  const session = await auth0.getSession();
  const env = getCloudflareContext().env;
  const adminEmail = env.AUTH0_ADMIN_EMAIL || process.env.AUTH0_ADMIN_EMAIL;
  return session && adminEmail && session.user.email === adminEmail;
}

function optionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function validateClub(body: ClubRequest): ClubInput | null {
  const name = body.name?.trim().slice(0, 200);
  const highestDivision = optionalNumber(body.highestDivision);
  const latitude = optionalNumber(body.latitude);
  const longitude = optionalNumber(body.longitude);

  if (
    !name ||
    highestDivision === undefined ||
    latitude === undefined ||
    longitude === undefined ||
    (highestDivision !== null &&
      (!Number.isInteger(highestDivision) ||
        highestDivision < 1 ||
        highestDivision > 20)) ||
    (latitude !== null && (latitude < -90 || latitude > 90)) ||
    (longitude !== null && (longitude < -180 || longitude > 180))
  ) {
    return null;
  }

  return {
    name,
    shortName: body.shortName?.trim().slice(0, 100) || "",
    threeLetterName: body.threeLetterName?.trim().slice(0, 10) || "",
    nicknames: body.nicknames?.trim().slice(0, 500) || "",
    primaryColour: body.primaryColour?.trim().slice(0, 100) || "",
    secondaryColour: body.secondaryColour?.trim().slice(0, 100) || "",
    highestDivision,
    latitude,
    longitude,
  };
}

function databaseError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "";
  if (message.includes("UNIQUE constraint failed")) {
    return error("A club with that name already exists.", 409);
  }
  return error("The club could not be saved.", 500);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage clubs.", 403);
  }

  const club = validateClub((await request.json()) as ClubRequest);
  if (!club) {
    return error("Enter a valid club name, division and coordinates.", 400);
  }

  try {
    const created = await createClub(
      getCloudflareContext().env.DB,
      crypto.randomUUID(),
      club,
    );
    revalidatePath("/head-to-head");
    revalidatePath("/results");
    revalidatePath("/transfer-central");
    return NextResponse.json({ club: created }, { status: 201 });
  } catch (cause) {
    return databaseError(cause);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage clubs.", 403);
  }

  const body = (await request.json()) as ClubRequest;
  const club = validateClub(body);
  if (!body.id || !club) {
    return error("Enter a valid club name, division and coordinates.", 400);
  }

  const db = getCloudflareContext().env.DB;
  if (!(await getClubById(db, body.id))) {
    return error("That club could not be found.", 404);
  }

  try {
    const updated = await updateClub(db, body.id, club);
    revalidatePath("/head-to-head");
    revalidatePath("/results");
    revalidatePath("/transfer-central");
    return NextResponse.json({ club: updated });
  } catch (cause) {
    return databaseError(cause);
  }
}
