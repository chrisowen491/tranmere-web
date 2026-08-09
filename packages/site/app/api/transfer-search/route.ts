import { getTransfers } from "@/lib/transfers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const filters = {
    season: request.nextUrl.searchParams.get("season") || undefined,
    club: request.nextUrl.searchParams.get("club") || undefined,
    filter: request.nextUrl.searchParams.get("filter") || undefined,
    playerName: request.nextUrl.searchParams.get("player") || undefined,
  };
  const transfers = await getTransfers(getCloudflareContext().env.DB, {
    ...filters,
    ...(Object.values(filters).some(Boolean)
      ? {}
      : { limit: 50, sort: "fee-desc" as const }),
  });

  return NextResponse.json({ transfers });
}
