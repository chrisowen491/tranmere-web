import { HatTrickAdmin } from "@/components/apps/admin/HatTrickAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import { queryHatTrickRows } from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manage hat-tricks | Admin",
  description:
    "Manage Tranmere hat-trick records in the Tranmere-Web database.",
};

export default async function HatTrickAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; date?: string }>;
}) {
  await requireAdminPage("/admin/hat-tricks");
  const params = await searchParams;
  const seasons = GetSeasons().sort((a, b) => b - a);
  const requestedSeason = Number(params.season);
  const selectedSeason = seasons.includes(requestedSeason)
    ? requestedSeason
    : seasons[0];
  const selectedDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : undefined;
  const hatTricks = await queryHatTrickRows(getCloudflareContext().env.DB, {
    season: selectedSeason,
    matchDate: selectedDate,
  });

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Admin overview
            </Link>
            <span className="text-blue-300">Hat-tricks</span>
          </div>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Hat-trick archive
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Filter a campaign, then maintain the players and matches behind the
            club&apos;s three-goal performances.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <HatTrickAdmin
          key={`${selectedSeason}-${selectedDate ?? "all"}`}
          initialHatTricks={hatTricks}
          seasons={seasons}
          selectedSeason={selectedSeason}
          selectedDate={selectedDate}
        />
      </section>
    </main>
  );
}
