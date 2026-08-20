import { notFound, redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { hasAdminPermission } from "@/lib/authPermissions";

export async function getAdminSession() {
  const session = await auth0.getSession();
  if (!session) return null;

  return hasAdminPermission(session.user) ? session : null;
}

export async function requireAdminPage(returnTo: string) {
  const session = await auth0.getSession();
  if (!session) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (!hasAdminPermission(session.user)) notFound();
  return session;
}
