import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  url.host = getRequestContext().env.API_DOMAIN;
  url.protocol = getRequestContext().env.API_PROTOCOL;
  url.port = getRequestContext().env.API_PORT;

  const new_request = new Request(url, req);
  new_request.headers.set('x-api-key', getRequestContext().env.API_KEY);

  return await fetch(new_request);
}
