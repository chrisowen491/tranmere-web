import { getTransfers } from "@/lib/transfers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const transfers = await getTransfers(getCloudflareContext().env.DB, {
    season: request.nextUrl.searchParams.get("season") || undefined,
    club: request.nextUrl.searchParams.get("club") || undefined,
    filter: request.nextUrl.searchParams.get("filter") || undefined,
  });

  return NextResponse.json({ transfers });
}
