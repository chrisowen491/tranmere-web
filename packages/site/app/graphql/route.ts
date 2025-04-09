import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  url.host = "api.tranmere-web.com";
  url.protocol = "https";
  url.port = "443";

  const data = await fetch(url, {
    headers: {
      "x-api-key": "da2-upnumdu7inamne5prs2wsuxfnq",
    },
  });
  const results = await data.json();
  return new NextResponse(JSON.stringify(results));
}
