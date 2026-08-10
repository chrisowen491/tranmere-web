import { getTransfers } from "@/lib/transfers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { createSearchPage, readSearchPagination } from "@/lib/searchPagination";

export async function GET(request: NextRequest) {
  const pagination = readSearchPagination(request.nextUrl.searchParams);
  const filters = {
    season: request.nextUrl.searchParams.get("season") || undefined,
    club: request.nextUrl.searchParams.get("club") || undefined,
    filter: request.nextUrl.searchParams.get("filter") || undefined,
    playerName: request.nextUrl.searchParams.get("player") || undefined,
  };
  const transfers = await getTransfers(getCloudflareContext().env.DB, {
    ...filters,
    limit: pagination.limit + 1,
    offset: pagination.cursor,
    sort: Object.values(filters).some(Boolean) ? undefined : "fee-desc",
  });
  const page = createSearchPage(transfers, pagination);
  return NextResponse.json({
    transfers: page.rows,
    pagination: page.pagination,
  });
}
