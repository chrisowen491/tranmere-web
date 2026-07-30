import { PlayerProfileCorrectionReview } from "@/components/apps/admin/PlayerProfileCorrectionReview";
import { auth0 } from "@/lib/auth0";
import { getPlayerProfileCorrections } from "@/lib/playerProfileCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Player profile corrections",
  description: "Review supporter-submitted player profile corrections.",
};

export default async function PlayerProfileCorrectionsAdminPage() {
  const session = await auth0.getSession();
  if (!session) {
    redirect(
      `/auth/login?returnTo=${encodeURIComponent(
        "/admin/player-profile-corrections",
      )}`,
    );
  }

  const env = getCloudflareContext().env;
  const adminEmail = env.AUTH0_ADMIN_EMAIL || process.env.AUTH0_ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) notFound();

  const corrections = await getPlayerProfileCorrections(env.DB, "pending");

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Overview
            </Link>
            <span className="text-blue-300">Player profiles</span>
            <Link
              href="/admin/attendance-corrections"
              className="text-white/45 hover:text-white"
            >
              Match attendances
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Profile corrections
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Compare the submitted fields with the current player record and
                check the source. Approved corrections are published directly to
                the D1 player profile.
              </p>
            </div>
            <div className="border border-white/15 px-5 py-4">
              <span className="block font-mono text-3xl font-bold">
                {corrections.length}
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-white/50">
                Awaiting review
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <PlayerProfileCorrectionReview initialCorrections={corrections} />
      </section>
    </main>
  );
}
