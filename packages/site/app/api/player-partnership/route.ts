import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getPlayerPartnership } from "@/lib/playerPartnership";

export async function GET(request: NextRequest) {
  const firstPlayer = request.nextUrl.searchParams.get("first")?.trim();
  const secondPlayer = request.nextUrl.searchParams.get("second")?.trim();

  if (!firstPlayer || !secondPlayer || firstPlayer === secondPlayer) {
    return NextResponse.json(
      { error: "Choose two different players." },
      { status: 400 },
    );
  }

  try {
    const env = (await getCloudflareContext({ async: true })).env;
    const partnership = await getPlayerPartnership(
      GetBaseUrl(env),
      firstPlayer,
      secondPlayer,
    );
    return NextResponse.json(partnership);
  } catch {
    return NextResponse.json(
      { error: "The partnership record could not be loaded." },
      { status: 502 },
    );
  }
}
