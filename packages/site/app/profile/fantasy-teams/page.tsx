import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listFantasyTeams } from "@/lib/fantasyTeams";
import { FantasyTeamManager } from "@/components/apps/FantasyTeamManager";
import { SupporterAvatar } from "@/components/apps/SupporterAvatar";
import { ensureUserProfile } from "@/lib/userProfiles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your saved Fantasy XIs" };

export default async function SavedFantasyTeamsPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=%2Fprofile%2Ffantasy-teams");
  const db = getCloudflareContext().env.DB;
  const account = await resolveAccount(db, session.user.sub);
  const [teams, profile] = await Promise.all([
    listFantasyTeams(db, account.id),
    ensureUserProfile(db, account.id),
  ]);
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
          <div className="flex items-center gap-4">
            <SupporterAvatar
              avatarUrl={profile?.avatar_url}
              label="Your supporter avatar"
              className="h-16 w-16 border-white/20"
            />
            <p className="section-kicker text-blue-300">
              Supporter account · Fantasy XI
            </p>
          </div>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em]">
            Your saved XIs
          </h1>
          <p className="mt-4 max-w-2xl text-white/65">
            Private by default. Duplicate a favourite, refine the selections, or
            explicitly publish a read-only version.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="mb-7 flex flex-wrap justify-between gap-3">
          <Link href="/profile" className="text-sm font-bold text-blue-700">
            ← Your profile
          </Link>
          <Link
            href="/fantasy-team"
            className="bg-blue-700 px-5 py-3 text-sm font-bold text-white"
          >
            Create another XI
          </Link>
        </div>
        <FantasyTeamManager initialTeams={teams} />
      </section>
    </main>
  );
}
