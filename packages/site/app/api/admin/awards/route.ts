import {
  adminError,
  revalidateAdminPaths,
  requireAdminApi,
  requiredText,
} from "@/lib/adminCrud";
import {
  createAward,
  createPlayerAward,
  deleteAward,
  deletePlayerAward,
  getAwardById,
  getPlayerAwardById,
  updateAward,
  updatePlayerAward,
  type AwardInput,
  type PlayerAwardInput,
} from "@/lib/awards";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

interface Body {
  resource?: "award" | "assignment";
  id?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
  awardId?: string;
  season?: number;
  playerName?: string;
  notes?: string;
}
const awardInput = (body: Body): AwardInput | null => {
  const name = requiredText(body.name, 200);
  const sortOrder = Number(body.sortOrder ?? 0);
  return name && Number.isInteger(sortOrder)
    ? {
        name,
        description: requiredText(body.description, 1000) || null,
        sortOrder,
      }
    : null;
};
const assignmentInput = (body: Body): PlayerAwardInput | null => {
  const awardId = requiredText(body.awardId, 100);
  const playerName = requiredText(body.playerName, 200);
  const season = Number(body.season);
  return awardId &&
    playerName &&
    Number.isInteger(season) &&
    season >= 1800 &&
    season <= 2200
    ? {
        awardId,
        playerName,
        season,
        notes: requiredText(body.notes, 500) || null,
      }
    : null;
};
const pathsFor = (record: { season: number; playerName: string }) => [
  `/season/${record.season}`,
  `/page/player/${encodeURIComponent(record.playerName)}`,
];

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("awards");
  if (forbidden) return forbidden;
  const body = (await request.json()) as Body;
  const db = getCloudflareContext().env.DB;
  try {
    if (body.resource === "award") {
      const input = awardInput(body);
      if (!input) return adminError("Enter a valid award name.", 400);
      return NextResponse.json(
        { award: await createAward(db, crypto.randomUUID(), input) },
        { status: 201 },
      );
    }
    if (body.resource === "assignment") {
      const input = assignmentInput(body);
      if (!input || !(await getAwardById(db, input.awardId)))
        return adminError(
          "Choose an award and enter a valid season and player.",
          400,
        );
      const assignment = await createPlayerAward(
        db,
        crypto.randomUUID(),
        input,
      );
      revalidateAdminPaths(pathsFor(input));
      return NextResponse.json({ assignment }, { status: 201 });
    }
    return adminError("Choose what to create.", 400);
  } catch {
    return adminError("That record already exists.", 409);
  }
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("awards");
  if (forbidden) return forbidden;
  const body = (await request.json()) as Body;
  if (!body.id) return adminError("Choose a record to edit.", 400);
  const db = getCloudflareContext().env.DB;
  try {
    if (body.resource === "award") {
      const input = awardInput(body);
      if (!input || !(await getAwardById(db, body.id)))
        return adminError("That award could not be found.", 404);
      return NextResponse.json({
        award: await updateAward(db, body.id, input),
      });
    }
    if (body.resource === "assignment") {
      const input = assignmentInput(body);
      const previous = await getPlayerAwardById(db, body.id);
      if (!input || !previous || !(await getAwardById(db, input.awardId)))
        return adminError("That award assignment could not be found.", 404);
      const assignment = await updatePlayerAward(db, body.id, input);
      revalidateAdminPaths([...pathsFor(previous), ...pathsFor(input)]);
      return NextResponse.json({ assignment });
    }
    return adminError("Choose what to edit.", 400);
  } catch {
    return adminError("That record already exists.", 409);
  }
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("awards");
  if (forbidden) return forbidden;
  const params = new URL(request.url).searchParams;
  const id = params.get("id");
  const resource = params.get("resource");
  if (!id) return adminError("Choose a record to delete.", 400);
  const db = getCloudflareContext().env.DB;
  if (resource === "award") await deleteAward(db, id);
  else if (resource === "assignment") {
    const record = await getPlayerAwardById(db, id);
    await deletePlayerAward(db, id);
    if (record) revalidateAdminPaths(pathsFor(record));
  } else return adminError("Choose what to delete.", 400);
  return NextResponse.json({ ok: true });
}
