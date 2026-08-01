import { auth0 } from "@/lib/auth0";
import {
  createPlayer,
  getPlayerById,
  getPlayerByName,
  updatePlayer,
  type PlayerInput,
} from "@/lib/players";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const positions = new Set([
  "Goalkeeper",
  "Striker",
  "Winger",
  "Central Defender",
  "Central Midfielder",
  "Full Back",
]);
const feet = new Set(["Left", "Right"]);

interface PlayerRequest {
  id?: string;
  name?: string;
  dateOfBirth?: string | null;
  biographyMarkdown?: string | null;
  picLink?: string | null;
  foot?: string | null;
  height?: string | null;
  placeOfBirth?: string | null;
  position?: string | null;
  links?: string[];
}

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function requireAdmin() {
  const session = await auth0.getSession();
  const env = getCloudflareContext().env;
  const adminEmail = env.AUTH0_ADMIN_EMAIL || process.env.AUTH0_ADMIN_EMAIL;
  return session && adminEmail && session.user.email === adminEmail
    ? session
    : null;
}

function optional(value: string | null | undefined, limit: number) {
  return value?.trim().slice(0, limit) || null;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function validWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validatePlayer(body: PlayerRequest): PlayerInput | null {
  const name = body.name?.trim().slice(0, 200);
  const dateOfBirth = optional(body.dateOfBirth, 10);
  const foot = optional(body.foot, 20);
  const position = optional(body.position, 100);
  const picLink = optional(body.picLink, 2000);
  const links = [...new Set(body.links || [])]
    .map((link) => link.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (
    !name ||
    (dateOfBirth && !validDate(dateOfBirth)) ||
    (foot && !feet.has(foot)) ||
    (position && !positions.has(position)) ||
    (picLink && !validWebUrl(picLink)) ||
    links.some((link) => !validWebUrl(link))
  ) {
    return null;
  }

  return {
    name,
    dateOfBirth,
    biographyMarkdown: optional(body.biographyMarkdown, 50000),
    picLink,
    foot,
    height: optional(body.height, 100),
    placeOfBirth: optional(body.placeOfBirth, 300),
    position,
    links,
  };
}

function revalidatePlayerPages(name: string) {
  revalidatePath(`/page/player/${name}`);
  revalidatePath("/players");
  revalidatePath("/fantasy-team");
  revalidatePath("/who-am-i");
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage players.", 403);
  }

  const body = (await request.json()) as PlayerRequest;
  const player = validatePlayer(body);
  if (!player) {
    return error("Enter valid player profile details.", 400);
  }

  const db = getCloudflareContext().env.DB;
  if (await getPlayerByName(db, player.name)) {
    return error(`A player named ${player.name} already exists.`, 409);
  }

  const created = await createPlayer(db, player);
  if (!created) return error("The player could not be created.", 500);

  revalidatePlayerPages(created.name);
  return NextResponse.json({ player: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage players.", 403);
  }

  const body = (await request.json()) as PlayerRequest;
  const player = validatePlayer(body);
  if (!body.id || !player) {
    return error("Enter valid player profile details.", 400);
  }

  const db = getCloudflareContext().env.DB;
  const existing = await getPlayerById(db, body.id);
  if (!existing) return error("That player could not be found.", 404);

  const updated = await updatePlayer(db, body.id, player);
  revalidatePlayerPages(existing.name);
  if (existing.name !== player.name) {
    revalidatePlayerPages(player.name);
  }
  return NextResponse.json({ player: updated });
}
