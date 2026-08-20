import { NextRequest, NextResponse } from "next/server";

import { accountLinkAuth0, auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth/link/")) {
    const primarySession = await auth0.getSession(request);
    if (!primarySession) {
      return NextResponse.redirect(
        new URL("/auth/login?returnTo=%2Fprofile", request.url),
      );
    }
    if (request.nextUrl.pathname === "/auth/link/login") {
      if (
        primarySession.user.email_verified !== true ||
        typeof primarySession.user.email !== "string"
      ) {
        return NextResponse.redirect(
          new URL("/profile?link=mismatch", request.url),
        );
      }
      const linkState = new URLSearchParams({
        primary_sub: primarySession.user.sub,
        primary_email: primarySession.user.email,
      });
      const linkUrl = request.nextUrl.clone();
      linkUrl.searchParams.set("returnTo", `/profile?${linkState}`);
      linkUrl.searchParams.set("prompt", "login");
      return accountLinkAuth0.middleware(new NextRequest(linkUrl, request));
    }
    return accountLinkAuth0.middleware(request);
  }
  const authRes = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/api/comment")) {
    const { origin } = new URL(request.url);
    const session = await auth0.getSession(request);

    // user does not have a session — redirect to login
    if (!session) {
      return NextResponse.redirect(`${origin}/auth/login`);
    }
  }

  return authRes;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
