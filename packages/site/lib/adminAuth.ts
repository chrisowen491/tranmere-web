import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound, redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";

function configuredAdminEmail() {
  const env = getCloudflareContext().env;
  return env.AUTH0_ADMIN_EMAIL || process.env.AUTH0_ADMIN_EMAIL;
}

export async function getAdminSession() {
  const session = await auth0.getSession();
  if (!session) return null;

  const adminEmail = configuredAdminEmail();
  return adminEmail && session.user.email === adminEmail
    ? { ...session, user: { ...session.user, email: adminEmail } }
    : null;
}

export async function requireAdminPage(returnTo: string) {
  const session = await auth0.getSession();
  if (!session) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const adminEmail = configuredAdminEmail();
  if (!adminEmail || session.user.email !== adminEmail) notFound();
  return { ...session, user: { ...session.user, email: adminEmail } };
}
