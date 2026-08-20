import { resolveAccount } from "@/lib/accounts";
import {
  listAccountIdentities,
  removeLinkedIdentity,
} from "@/lib/accountLinking";
import { auth0 } from "@/lib/auth0";
import { unlinkAuth0Identity } from "@/lib/auth0Management";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  const body = (await request.json()) as { providerSub?: string };
  if (!body.providerSub)
    return NextResponse.json(
      { message: "Choose a sign-in method to remove." },
      { status: 400 },
    );
  const db = getCloudflareContext().env.DB;
  const account = await resolveAccount(db, session.user.sub);
  const identities = await listAccountIdentities(db, account.id);
  const target = identities.find(
    (identity) => identity.providerSub === body.providerSub,
  );
  if (!target)
    return NextResponse.json(
      { message: "That sign-in method is not linked." },
      { status: 404 },
    );
  if (target.isPrimary || identities.length < 2)
    return NextResponse.json(
      { message: "The primary sign-in method cannot be removed." },
      { status: 409 },
    );
  try {
    await unlinkAuth0Identity(session.user.sub, target.providerSub);
    await removeLinkedIdentity(db, account.id, target.providerSub);
    return NextResponse.json({ message: "Sign-in method removed." });
  } catch (reason) {
    console.error("Unable to unlink Auth0 identity", reason);
    return NextResponse.json(
      { message: "The sign-in method could not be removed." },
      { status: 502 },
    );
  }
}
