import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { getPlayerStatistics } from "@/lib/playerStatistics";
import { createSearchPage, readSearchPagination } from "@/lib/searchPagination";

export async function GET(request: NextRequest) {
  try {
    const env = (await getCloudflareContext({ async: true })).env;
    const query = request.nextUrl.searchParams.get("query")?.trim();
    const pagination = readSearchPagination(request.nextUrl.searchParams);
    const players = await getPlayerStatistics(env.DB, {
      player: query || undefined,
      season: query ? "" : (request.nextUrl.searchParams.get("season") ?? ""),
      sort: request.nextUrl.searchParams.get("sort") ?? "",
      filter: request.nextUrl.searchParams.get("filter") ?? "",
      limit: pagination.limit + 1,
      offset: pagination.cursor,
    });
    const page = createSearchPage(players, pagination);
    return NextResponse.json({
      players: page.rows,
      pagination: page.pagination,
    });
  } catch {
    return NextResponse.json(
      { error: "Player statistics could not be loaded." },
      { status: 502 },
    );
  }
}
