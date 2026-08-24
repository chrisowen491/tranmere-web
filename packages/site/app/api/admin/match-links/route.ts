import {
  adminError,
  optionalText,
  requiredText,
  requireAdminApi,
} from "@/lib/adminCrud";
import { getGameBySeasonAndDate } from "@/lib/games";
import { MATCH_LINK_TYPES } from "@/lib/matchLinks";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
function validUrl(value: string) {
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
export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("match links");
  if (forbidden) return forbidden;
  const body = (await request.json()) as Record<string, unknown>;
  const season = requiredText(body.season, 4);
  const matchDate = requiredText(body.matchDate, 10);
  const label = requiredText(body.label);
  const url = requiredText(body.url, 2000);
  const linkType = requiredText(body.linkType, 20);
  if (
    !/^\d{4}$/.test(season) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(matchDate) ||
    !label ||
    !validUrl(url) ||
    !MATCH_LINK_TYPES.includes(linkType as (typeof MATCH_LINK_TYPES)[number])
  )
    return adminError("Please provide a valid match link.", 400);
  const db = getCloudflareContext().env.DB;
  if (!(await getGameBySeasonAndDate(db, season, matchDate)))
    return adminError("That match could not be found.", 404);
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO MatchLinks (id, season, match_date, label, url, link_type, publisher, published_at, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      crypto.randomUUID(),
      season,
      matchDate,
      label,
      url,
      linkType,
      optionalText(body.publisher, 100),
      optionalText(body.publishedAt, 10),
      Number(body.sortOrder) || 0,
      now,
      now,
    )
    .run();
  revalidatePath(`/match/${season}/${matchDate}`);
  return NextResponse.json({ message: "Link published." }, { status: 201 });
}
