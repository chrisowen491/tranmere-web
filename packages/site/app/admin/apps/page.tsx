import { AppAdmin } from "@/components/apps/admin/AppAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import { queryAppRows } from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import Link from "next/link";

export const metadata: Metadata = {
  title: "Manage appearances | Admin",
  description:
    "Add, edit and remove Tranmere player appearance records in the Tranmere-Web database.",
};

function validDate(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export default async function AppAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; date?: string }>;
}) {
  await requireAdminPage("/admin/apps");
  const params = await searchParams;
  const seasons = GetSeasons().sort((a, b) => b - a);
  const requestedSeason = Number(params.season);
  const selectedSeason = seasons.includes(requestedSeason)
    ? requestedSeason
    : seasons[0];
  const selectedDate = validDate(params.date) ? params.date! : undefined;
  const apps = await queryAppRows(getCloudflareContext().env.DB, {
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
            <span className="text-blue-300">Appearances</span>
          </div>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Player appearances
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Filter a campaign or match date, then maintain starting XI,
            substitution and discipline records in the Tranmere-Web database.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <AppAdmin
          key={`${selectedSeason}-${selectedDate ?? "all"}`}
          initialApps={apps}
          seasons={seasons}
          selectedSeason={selectedSeason}
          selectedDate={selectedDate}
        />
      </section>
    </main>
  );
}
