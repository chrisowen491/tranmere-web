import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getPlayerStatistics } from "@/lib/playerStatistics";
import { getUniquePlayers } from "@/lib/players";

export async function GET(request: NextRequest) {
  try {
    const env = (await getCloudflareContext({ async: true })).env;
    const query = request.nextUrl.searchParams.get("query")?.trim();
    if (query) {
      const profiles = await getUniquePlayers(env.DB, query);
      return NextResponse.json({
        players: profiles.map((player) => ({
          Season: "",
          Player: player.name,
          Apps: 0,
          goals: 0,
          assists: 0,
          yellow: 0,
          red: 0,
          penalties: 0,
          headers: 0,
          starts: 0,
          subs: 0,
          freekicks: 0,
          profile: {
            picLink: player.picLink ?? "",
            position: player.position,
            secondaryPosition: player.secondaryPosition,
          },
        })),
      });
    }
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
