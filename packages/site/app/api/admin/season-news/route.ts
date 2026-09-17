import {
  adminError,
  isIsoDate,
  revalidateAdminPaths,
  requireAdminApi,
  requiredText,
} from "@/lib/adminCrud";
import {
  createSeasonNewsSnippet,
  deleteSeasonNewsSnippet,
  getSeasonNewsSnippetById,
  updateSeasonNewsSnippet,
  type SeasonNewsSnippetInput,
} from "@/lib/seasonNews";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  id?: string;
  season?: number;
  date?: string;
  placement?: string;
  title?: string;
  body?: string;
  tags?: string[];
}

function validate(body: RequestBody): SeasonNewsSnippetInput | null {
  const season = Number(body.season);
  const date = requiredText(body.date, 10);
  const tags = Array.isArray(body.tags)
    ? [
        ...new Set(
          body.tags.map((tag) => requiredText(tag, 100)).filter(Boolean),
        ),
      ]
    : [];
  const placement = body.placement;
  if (
    !Number.isInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !isIsoDate(date) ||
    (placement !== "pre-season" && placement !== "timeline") ||
    !requiredText(body.body, 4000) ||
    tags.length > 12
  )
    return null;
  return {
    season,
    date,
    placement,
    title: requiredText(body.title, 200) || null,
    body: requiredText(body.body, 4000),
    tags,
  };
}

function pathsFor(input: SeasonNewsSnippetInput) {
  return [
    `/season/${input.season}`,
    ...input.tags.map((tag) => `/page/player/${encodeURIComponent(tag)}`),
  ];
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("season news");
  if (forbidden) return forbidden;
  const input = validate((await request.json()) as RequestBody);
  if (!input) return adminError("Enter a valid season, date and snippet.", 400);
  const snippet = await createSeasonNewsSnippet(
    getCloudflareContext().env.DB,
    crypto.randomUUID(),
    input,
  );
  revalidateAdminPaths(pathsFor(input));
  return NextResponse.json({ snippet }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("season news");
  if (forbidden) return forbidden;
  const body = (await request.json()) as RequestBody;
  const input = validate(body);
  if (!body.id || !input) return adminError("Enter a valid news snippet.", 400);
  const db = getCloudflareContext().env.DB;
  const previous = await getSeasonNewsSnippetById(db, body.id);
  if (!previous)
    return adminError("That news snippet could not be found.", 404);
  const snippet = await updateSeasonNewsSnippet(db, body.id, input);
  revalidateAdminPaths([
    `/season/${previous.season}`,
    ...previous.tags.map((tag) => `/page/player/${encodeURIComponent(tag)}`),
    ...pathsFor(input),
  ]);
  return NextResponse.json({ snippet });
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("season news");
  if (forbidden) return forbidden;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return adminError("Choose a news snippet to delete.", 400);
  const db = getCloudflareContext().env.DB;
  const previous = await getSeasonNewsSnippetById(db, id);
  await deleteSeasonNewsSnippet(db, id);
  if (previous)
    revalidateAdminPaths([
      `/season/${previous.season}`,
      ...previous.tags.map((tag) => `/page/player/${encodeURIComponent(tag)}`),
    ]);
  return NextResponse.json({ ok: true });
}
