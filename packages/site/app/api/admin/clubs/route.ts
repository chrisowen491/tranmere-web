import {
  adminError,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import {
  createClub,
  getClubById,
  updateClub,
  type ClubInput,
} from "@/lib/clubs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { upsertClubSearchEntry } from "@/lib/searchIndex";

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
    return adminError("A club with that name already exists.", 409);
  }
  return adminError("The club could not be saved.", 500);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("clubs");
  if (forbidden) return forbidden;

  const club = validateClub((await request.json()) as ClubRequest);
  if (!club) {
    return adminError(
      "Enter a valid club name, division and coordinates.",
      400,
    );
  }

  try {
    const created = await createClub(
      getCloudflareContext().env.DB,
      crypto.randomUUID(),
      club,
    );
    if (!created) return adminError("The club could not be created.", 500);
    await upsertClubSearchEntry(getCloudflareContext().env.DB, created);
    revalidateAdminPaths(["/head-to-head", "/results", "/transfer-central"]);
    return NextResponse.json({ club: created }, { status: 201 });
  } catch (cause) {
    return databaseError(cause);
  }
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("clubs");
  if (forbidden) return forbidden;

  const body = (await request.json()) as ClubRequest;
  const club = validateClub(body);
  if (!body.id || !club) {
    return adminError(
      "Enter a valid club name, division and coordinates.",
      400,
    );
  }

  const db = getCloudflareContext().env.DB;
  if (!(await getClubById(db, body.id))) {
    return adminError("That club could not be found.", 404);
  }

  try {
    const updated = await updateClub(db, body.id, club);
    if (!updated) return adminError("The club could not be updated.", 500);
    await upsertClubSearchEntry(db, updated);
    revalidateAdminPaths(["/head-to-head", "/results", "/transfer-central"]);
    return NextResponse.json({ club: updated });
  } catch (cause) {
    return databaseError(cause);
  }
}
