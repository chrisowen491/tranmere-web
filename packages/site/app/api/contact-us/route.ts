import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";

export async function POST(req: NextRequest) {
  const url = new URL(req.url.replace("/api", ""));

  const env = getRequestContext().env.API_DOMAIN
    ? getRequestContext().env
    : (process.env as unknown as CloudflareEnv);

  url.host = env.API_DOMAIN;
  url.protocol = env.API_PROTOCOL;
  url.port = env.API_PORT;

  const new_request = new Request(url, req);
  new_request.headers.set("x-api-key", env.API_KEY);

  const data = await fetch(url, {
    method: "post",
    headers: { "Content-Type": "applications/json" },
  });
  const results = await data.json();
  return new NextResponse(JSON.stringify(results), { status: data.status });
}
