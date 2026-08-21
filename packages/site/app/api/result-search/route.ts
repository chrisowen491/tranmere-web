import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import {
  getHeadToHead,
  searchGames,
  type GameSearchOptions,
} from "@/lib/games";
import { createSearchPage, readSearchPagination } from "@/lib/searchPagination";

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
  const pagination = readSearchPagination(params);
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
    statisticsOnly: params.get("statisticsOnly") === "true",
    sort: sort(params.get("sort")),
    limit: pagination.limit + 1,
    offset: pagination.cursor,
  };
  const env = (await getCloudflareContext({ async: true })).env;
  const search = await searchGames(env.DB, options);
  const page = createSearchPage(search.results, pagination);
  return NextResponse.json({
    results: page.rows,
    ...getHeadToHead(page.rows),
    pagination: page.pagination,
  });
}
