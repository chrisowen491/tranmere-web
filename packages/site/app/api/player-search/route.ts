import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getPlayerStatistics } from "@/lib/playerStatistics";

export async function GET(request: NextRequest) {
  try {
    const env = (await getCloudflareContext({ async: true })).env;
    const players = await getPlayerStatistics(env.DB, GetBaseUrl(env), {
      season: request.nextUrl.searchParams.get("season") ?? "",
      sort: request.nextUrl.searchParams.get("sort") ?? "",
      filter: request.nextUrl.searchParams.get("filter") ?? "",
    });
    return NextResponse.json({ players });
  } catch {
    return NextResponse.json(
      { error: "Player statistics could not be loaded." },
      { status: 502 },
    );
  }
}
