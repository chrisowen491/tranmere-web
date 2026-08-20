import {
  Auth0Client,
  filterDefaultIdTokenClaims,
} from "@auth0/nextjs-auth0/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { attachLinkedIdentity } from "@/lib/accountLinking";
import { linkAuth0Identity } from "@/lib/auth0Management";
import { resolveAccount } from "@/lib/accounts";

const usernameClaim = "https://www.tranmere-web.com/username";

export const auth0 = new Auth0Client({
  beforeSessionSaved: async (session) => ({
    ...session,
    user: {
      ...filterDefaultIdTokenClaims(session.user),
      ...(typeof session.user[usernameClaim] === "string"
        ? { [usernameClaim]: session.user[usernameClaim] }
        : {}),
      ...(typeof session.user.username === "string"
        ? { username: session.user.username }
        : {}),
      ...(typeof session.user.preferred_username === "string"
        ? { preferred_username: session.user.preferred_username }
        : {}),
    },
  }),
});

export const accountLinkAuth0 = new Auth0Client({
  routes: {
    login: "/auth/link/login",
    callback: "/auth/link/callback",
  },
  authorizationParameters: {
    prompt: "login",
  },
  signInReturnToPath: "/profile",
  session: {
    absoluteDuration: 300,
    inactivityDuration: 300,
    rolling: false,
    cookie: { name: "__account_link_session", transient: true },
  },
  transactionCookie: {
    prefix: "__account_link_txn_",
    maxAge: 300,
  },
  onCallback: async (error, context, secondarySession) => {
    const destination = new URL(
      "/profile",
      context.appBaseUrl || "http://localhost:3001",
    );
    if (error || !secondarySession) {
      destination.searchParams.set("link", "failed");
      return NextResponse.redirect(destination);
    }
    const linkState = new URL(
      context.returnTo || "/profile",
      "https://account-link.invalid",
    ).searchParams;
    const primarySub = linkState.get("primary_sub");
    const primaryEmail = linkState.get("primary_email");
    if (!primarySub || !primaryEmail) {
      destination.searchParams.set("link", "expired");
      return NextResponse.redirect(destination);
    }
    const secondary = secondarySession.user;
    if (
      primarySub === secondary.sub ||
      secondary.email_verified !== true ||
      primaryEmail.toLowerCase() !== String(secondary.email).toLowerCase()
    ) {
      destination.searchParams.set("link", "mismatch");
      return NextResponse.redirect(destination);
    }
    try {
      const db = getCloudflareContext().env.DB;
      const account = await resolveAccount(db, primarySub);
      await linkAuth0Identity(primarySub, secondary.sub);
      await attachLinkedIdentity(db, account.id, secondary.sub);
      destination.searchParams.set("link", "success");
    } catch (reason) {
      console.error("Unable to link Auth0 identities", reason);
      destination.searchParams.set("link", "failed");
    }
    return NextResponse.redirect(destination);
  },
});
