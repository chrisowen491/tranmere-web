import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { getAdminSession } from "@/lib/adminAuth";
import { getGameBySeasonAndDate } from "@/lib/games";
import { MATCH_LINK_TYPES, type MatchLinkStatus } from "@/lib/matchLinks";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
const error = (message: string, status: number) =>
  NextResponse.json({ message }, { status });
const text = (value: unknown, length: number) =>
  typeof value === "string" ? value.trim().slice(0, length) : "";
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
  const session = await auth0.getSession();
  if (!session) return error("Please log in before suggesting a link.", 401);
  const body = (await request.json()) as Record<string, unknown>;
  const season = text(body.season, 4);
  const matchDate = text(body.matchDate, 10);
  const label = text(body.label, 200);
  const url = text(body.url, 2000);
  const linkType = text(body.linkType, 20);
  if (
    !/^\d{4}$/.test(season) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(matchDate) ||
    !label ||
    !validUrl(url) ||
    !MATCH_LINK_TYPES.includes(linkType as (typeof MATCH_LINK_TYPES)[number])
  )
    return error("Please provide a valid match link.", 400);
  const db = getCloudflareContext().env.DB;
  if (!(await getGameBySeasonAndDate(db, season, matchDate)))
    return error("That match could not be found.", 404);
  const account = await resolveAccount(db, session.user.sub);
  const duplicate = await db
    .prepare(
      "SELECT id FROM MatchLinkSuggestions WHERE season = ? AND match_date = ? AND url = ? AND submitted_by_account_id = ? AND status = 'pending'",
    )
    .bind(season, matchDate, url, account.id)
    .first();
  if (duplicate) return error("You have already suggested this link.", 409);
  await db
    .prepare(
      "INSERT INTO MatchLinkSuggestions (id, season, match_date, label, url, link_type, publisher, notes, submitted_by_account_id, submitted_by_name, submitted_by_email, submitted_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
    )
    .bind(
      crypto.randomUUID(),
      season,
      matchDate,
      label,
      url,
      linkType,
      text(body.publisher, 100) || null,
      text(body.notes, 1000) || null,
      account.id,
      session.user.name || session.user.email || "Supporter",
      session.user.email || null,
      new Date().toISOString(),
    )
    .run();
  return NextResponse.json(
    { message: "Link submitted for review." },
    { status: 201 },
  );
}
export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return error("You do not have permission to review links.", 403);
  const body = (await request.json()) as {
    id?: string;
    status?: MatchLinkStatus;
  };
  if (!body.id || !["approved", "rejected"].includes(body.status || ""))
    return error("Choose whether to approve or reject this link.", 400);
  const db = getCloudflareContext().env.DB;
  const item = await db
    .prepare(
      "SELECT * FROM MatchLinkSuggestions WHERE id = ? AND status = 'pending'",
    )
    .bind(body.id)
    .first<Record<string, unknown>>();
  if (!item) return error("This suggestion has already been reviewed.", 409);
  if (body.status === "approved")
    await db
      .prepare(
        "INSERT INTO MatchLinks (id, season, match_date, label, url, link_type, publisher, published_at, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        item.season,
        item.match_date,
        item.label,
        item.url,
        item.link_type,
        item.publisher,
        item.published_at,
        new Date().toISOString(),
        new Date().toISOString(),
      )
      .run();
  await db
    .prepare(
      "UPDATE MatchLinkSuggestions SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?",
    )
    .bind(body.status, session.user.email, new Date().toISOString(), body.id)
    .run();
  revalidatePath(`/match/${item.season}/${item.match_date}`);
  return NextResponse.json({ message: `Link ${body.status}.` });
}
