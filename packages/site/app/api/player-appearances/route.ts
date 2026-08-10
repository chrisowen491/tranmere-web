import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import {
  countPlayerAppearanceRows,
  queryGoalRows,
  queryPlayerAppearanceRows,
} from "@tranmere-web/lib/src/d1-queries";
import { goalCountsByDate, mapPlayerAppearance } from "@/lib/playerAppearances";

const PAGE_SIZE = 25;
const MAX_PAGE = 1_000;

function readPage(value: string | null) {
  const page = Number(value ?? "1");
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, MAX_PAGE) : 1;
}

export async function GET(request: NextRequest) {
  const player = request.nextUrl.searchParams.get("player")?.trim();
  if (!player || player.length > 120) {
    return NextResponse.json(
      { error: "A valid player name is required." },
      { status: 400 },
    );
  }

  try {
    const env = (await getCloudflareContext({ async: true })).env;
    const page = readPage(request.nextUrl.searchParams.get("page"));
    const offset = (page - 1) * PAGE_SIZE;
    const [rows, total, goals] = await Promise.all([
      queryPlayerAppearanceRows(env.DB, player, { limit: PAGE_SIZE, offset }),
      countPlayerAppearanceRows(env.DB, player),
      queryGoalRows(env.DB, { scorer: player, scorerMatch: "exact" }),
    ]);
    const goalsByDate = goalCountsByDate(goals);

    return NextResponse.json({
      records: rows.map((row) =>
        mapPlayerAppearance(row, player, goalsByDate.get(row.match_date) ?? 0),
      ),
      total,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch {
    return NextResponse.json(
      { error: "Player appearances could not be loaded." },
      { status: 502 },
    );
  }
}
