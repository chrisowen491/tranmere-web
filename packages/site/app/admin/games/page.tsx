import { GameAdmin } from "@/components/apps/admin/GameAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import { queryGameRows } from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage games | Admin",
  description:
    "Edit published Tranmere match records in the Tranmere-Web database.",
};

export default async function GameAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  await requireAdminPage("/admin/games");
  const seasons = GetSeasons().sort((a, b) => b - a);
  const requestedSeason = Number((await searchParams).season);
  const selectedSeason = seasons.includes(requestedSeason)
    ? requestedSeason
    : seasons[0];
  const games = await queryGameRows(getCloudflareContext().env.DB, {
    season: selectedSeason,
    sort: "date-asc",
    includeKit: true,
  });

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Tranmere-Web · Admin
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Match archive
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Find a season, then update the published match record without
            leaving the Tranmere-Web database.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <GameAdmin
          key={selectedSeason}
          games={games}
          seasons={seasons}
          selectedSeason={selectedSeason}
        />
      </section>
    </main>
  );
}
