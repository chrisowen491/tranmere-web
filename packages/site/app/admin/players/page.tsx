import { PlayerAdmin } from "@/components/apps/admin/PlayerAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { getPlayers } from "@/lib/players";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage players",
  description: "Create and edit Tranmere player records.",
};

export default async function PlayerAdminPage() {
  await requireAdminPage("/admin/players");
  const env = getCloudflareContext().env;
  const players = await getPlayers(env.DB);
  const completeProfiles = players.filter(
    (player) =>
      player.dateOfBirth &&
      player.biographyMarkdown &&
      player.picLink &&
      player.foot &&
      player.height &&
      player.placeOfBirth &&
      player.position,
  ).length;

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Admin overview
            </Link>
            <span className="text-blue-300">Players</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Manage players
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Create player profiles and maintain the records stored in D1.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 px-6 py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-white/50">
                  Players
                </dt>
                <dd className="mt-1 font-mono text-3xl font-bold">
                  {players.length}
                </dd>
              </div>
              <div className="px-6 py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-white/50">
                  Complete
                </dt>
                <dd className="mt-1 font-mono text-3xl font-bold">
                  {completeProfiles}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <PlayerAdmin initialPlayers={players} />
      </section>
    </main>
  );
}
