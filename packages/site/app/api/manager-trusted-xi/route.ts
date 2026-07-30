import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getManagerById } from "@/lib/managers";
import { getManagerTrustedXi } from "@/lib/managerTrustedXi";

export async function GET(request: NextRequest) {
  const managerId = request.nextUrl.searchParams.get("manager");
  if (!managerId) {
    return NextResponse.json({ error: "Choose a manager." }, { status: 400 });
  }

  try {
    const env = (await getCloudflareContext({ async: true })).env;
    const manager = await getManagerById(env.DB, managerId);
    if (!manager) {
      return NextResponse.json(
        { error: "Manager not found." },
        { status: 404 },
      );
    }
    return NextResponse.json(
      await getManagerTrustedXi(env.DB, GetBaseUrl(env), manager),
    );
  } catch {
    return NextResponse.json(
      { error: "The trusted XI could not be calculated." },
      { status: 502 },
    );
  }
}
