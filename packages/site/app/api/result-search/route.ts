import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { searchGames, type GameSearchOptions } from "@/lib/games";

function text(value: string | null) {
  return value?.trim() || undefined;
}

function sort(value: string | null): GameSearchOptions["sort"] {
  if (value === "Top Attendance") return "attendance-desc";
  if (value?.toLowerCase().includes("descending")) return "date-desc";
  return "date-asc";
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const manager = text(params.get("manager"));
  const [dateFrom, dateTo] = manager?.split(",") || [];
  const season = Number(text(params.get("season")));
  const options: GameSearchOptions = {
    season: Number.isInteger(season) ? season : undefined,
    competition: text(params.get("competition")),
    venue: text(params.get("venue")),
    opposition: text(params.get("opposition")),
    penalties: text(params.get("pens")),
    dateFrom,
    dateTo: dateTo?.toLowerCase().startsWith("now")
      ? new Date().toISOString().slice(0, 10)
      : dateTo,
    sort: sort(params.get("sort")),
  };
  const env = (await getCloudflareContext({ async: true })).env;
  return NextResponse.json(await searchGames(env.DB, options));
}
