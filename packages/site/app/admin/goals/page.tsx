import { GoalAdmin } from "@/components/apps/admin/GoalAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import { queryGoalRows } from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage goals | Admin",
  description: "Manage Tranmere goals in the Tranmere-Web database.",
};

function validDate(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export default async function GoalAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; date?: string }>;
}) {
  await requireAdminPage("/admin/goals");
  const params = await searchParams;
  const seasons = GetSeasons().sort((a, b) => b - a);
  const requestedSeason = Number(params.season);
  const selectedSeason = seasons.includes(requestedSeason)
    ? requestedSeason
    : seasons[0];
  const selectedDate = validDate(params.date) ? params.date! : undefined;
  const goals = await queryGoalRows(getCloudflareContext().env.DB, {
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
            <span className="text-blue-300">Goals</span>
          </div>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Goal archive
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Filter a campaign or match date, then maintain scoring and assist
            details in the Tranmere-Web database.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <GoalAdmin
          key={`${selectedSeason}-${selectedDate ?? "all"}`}
          initialGoals={goals}
          seasons={seasons}
          selectedSeason={selectedSeason}
          selectedDate={selectedDate}
        />
      </section>
    </main>
  );
}
