import { querySearchDocuments } from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query =
    request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit"));
  const limit = Number.isInteger(requestedLimit)
    ? Math.max(1, Math.min(requestedLimit, 10))
    : 8;

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await querySearchDocuments(
      getCloudflareContext().env.DB,
      query,
      { limit },
    );
    return NextResponse.json(
      {
        results: results.map((result) => ({
          objectId: result.object_id,
          type: result.entity_type,
          entityId: result.entity_id,
          title: result.title,
          description: result.description,
          href: result.href,
          imageUrl: result.image_url,
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (cause) {
    console.error("Archive search failed", cause);
    return NextResponse.json(
      { error: "The archive search is temporarily unavailable." },
      { status: 503 },
    );
  }
}
