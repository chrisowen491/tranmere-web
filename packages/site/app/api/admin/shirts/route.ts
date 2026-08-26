import {
  adminError,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import {
  createShirt,
  deleteShirt,
  getShirtById,
  updateShirt,
  type ShirtInput,
} from "@/lib/shirts";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

interface ShirtRequest {
  id?: string;
  slug?: string;
  name?: string;
  price?: string;
  manufacturer?: string;
  descriptionJson?: string;
  use?: string;
  color?: string;
  decade?: string;
  avatarImageUrl?: string;
  images?: Array<{ url?: string; title?: string; description?: string }>;
  seasons?: string[];
  variants?: string[];
}

const usages = new Set([
  "Home",
  "Away",
  "Third",
  "Goalkeeper",
  "Goalkeeper Away",
  "Training",
  "Other",
]);

function validUrl(value: string, allowRelative = false) {
  if (allowRelative && value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function uniqueStrings(values: unknown, limit: number) {
  if (!Array.isArray(values)) return [];
  return [
    ...new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim().slice(0, limit))
        .filter(Boolean),
    ),
  ];
}

function validateShirt(body: ShirtRequest): ShirtInput | null {
  const slug = body.slug?.trim().toLowerCase().slice(0, 200) || "";
  const name = body.name?.trim().slice(0, 200) || "";
  const use = body.use?.trim().slice(0, 50) || "";
  const color = body.color?.trim().slice(0, 50) || "";
  const decade = body.decade?.trim().slice(0, 20) || "";
  const avatarImageUrl = body.avatarImageUrl?.trim().slice(0, 2000) || "";
  const seasons = uniqueStrings(body.seasons, 20);
  const variants = uniqueStrings(body.variants, 200);
  const images = (body.images ?? [])
    .map((image) => ({
      url: image.url?.trim().slice(0, 2000) || "",
      title: image.title?.trim().slice(0, 200) || "",
      description: image.description?.trim().slice(0, 500) || "",
    }))
    .filter((image) => image.url);

  let descriptionJson: string | null = null;
  if (body.descriptionJson?.trim()) {
    try {
      const description = JSON.parse(body.descriptionJson);
      if (!description || typeof description !== "object") return null;
      descriptionJson = JSON.stringify(description);
    } catch {
      return null;
    }
  }

  if (
    !name ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !usages.has(use) ||
    !color ||
    !/^\d{4}s$/.test(decade) ||
    images.length === 0 ||
    images.some((image) => !validUrl(image.url)) ||
    seasons.some((season) => !/^\d{4}$/.test(season)) ||
    (avatarImageUrl && !validUrl(avatarImageUrl, true))
  ) {
    return null;
  }

  return {
    slug,
    name,
    price: body.price?.trim().slice(0, 100) || "",
    manufacturer: body.manufacturer?.trim().slice(0, 100) || "",
    descriptionJson,
    use,
    color,
    decade,
    avatarImageUrl,
    images,
    seasons,
    variants,
  };
}

function databaseError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "";
  if (message.includes("UNIQUE constraint failed")) {
    return adminError(
      "That slug, image or ordered value is already in use.",
      409,
    );
  }
  return adminError("The shirt could not be saved.", 500);
}

function revalidateShirt(
  shirt: ShirtInput,
  previous?: Awaited<ReturnType<typeof getShirtById>>,
) {
  revalidateAdminPaths([
    "/",
    "/shirts",
    `/shirts/${shirt.slug}`,
    ...(previous ? [`/shirts/${previous.slug}`] : []),
    ...shirt.seasons.map((season) => `/season/${season}`),
    ...(previous?.seasons.map((season) => `/season/${season}`) ?? []),
  ]);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("shirts");
  if (forbidden) return forbidden;
  const shirt = validateShirt((await request.json()) as ShirtRequest);
  if (!shirt)
    return adminError(
      "Enter valid shirt details and at least one image URL.",
      400,
    );

  try {
    const created = await createShirt(
      getCloudflareContext().env.DB,
      crypto.randomUUID(),
      shirt,
    );
    if (!created) return adminError("The shirt could not be created.", 500);
    revalidateShirt(shirt);
    return NextResponse.json({ shirt: created }, { status: 201 });
  } catch (cause) {
    return databaseError(cause);
  }
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("shirts");
  if (forbidden) return forbidden;
  const body = (await request.json()) as ShirtRequest;
  const shirt = validateShirt(body);
  if (!body.id || !shirt)
    return adminError(
      "Enter valid shirt details and at least one image URL.",
      400,
    );

  const db = getCloudflareContext().env.DB;
  const previous = await getShirtById(db, body.id);
  if (!previous) return adminError("That shirt could not be found.", 404);

  try {
    const updated = await updateShirt(db, body.id, shirt);
    if (!updated) return adminError("The shirt could not be updated.", 500);
    revalidateShirt(shirt, previous);
    return NextResponse.json({ shirt: updated });
  } catch (cause) {
    return databaseError(cause);
  }
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("shirts");
  if (forbidden) return forbidden;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return adminError("Choose a shirt to delete.", 400);

  const db = getCloudflareContext().env.DB;
  const shirt = await getShirtById(db, id);
  if (!shirt) return adminError("That shirt could not be found.", 404);
  if (!(await deleteShirt(db, id)))
    return adminError("The shirt could not be deleted.", 500);

  revalidateAdminPaths([
    "/",
    "/shirts",
    `/shirts/${shirt.slug}`,
    ...shirt.seasons.map((season) => `/season/${season}`),
  ]);
  return NextResponse.json({ deleted: true });
}
