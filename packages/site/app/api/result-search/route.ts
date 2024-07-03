import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = new URL(req.url.replace("/api", ""));
  url.host = getRequestContext().env.API_DOMAIN;
  url.protocol = getRequestContext().env.API_PROTOCOL;
  url.port = getRequestContext().env.API_PORT;

  const new_request = new Request(url, req);
  new_request.headers.set("x-api-key", getRequestContext().env.API_KEY);

  const data = await fetch(url);
  const results = await data.json();
  return new NextResponse(JSON.stringify(results));
}
