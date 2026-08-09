import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import type { Metadata } from "next";
import { ManagerComparison } from "@/components/apps/ManagerComparison";
import { searchGames } from "@/lib/games";
import { getManagers } from "@/lib/managers";

export const metadata: Metadata = {
  title: "Compare Tranmere Rovers managers",
  description:
    "Compare Tranmere managers across results, win rate, goals, points per game and their best runs.",
};

export default async function ManagerComparisonPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const managers = await getManagers(env.DB);
  const initialManagerIndexes: [number, number] = [1, 2];

  async function getManagerMatches(index: number) {
    const manager = managers[index];
    if (!manager) return [];
    const dateLeft = manager.dateLeft.toLowerCase().startsWith("now")
      ? new Date().toISOString().slice(0, 10)
      : manager.dateLeft;
    return (
      await searchGames(env.DB, {
        dateFrom: manager.dateJoined,
        dateTo: dateLeft,
      })
    ).results;
  }

  const initialMatches = await Promise.all([
    getManagerMatches(initialManagerIndexes[0]),
    getManagerMatches(initialManagerIndexes[1]),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Dugout debate
          </p>
          <h1 className="mt-7 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
            Two managers.
            <br />
            One Rovers record.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Compare any two managerial tenures using every result in the
            archive—from win rates and scoring records to their strongest runs.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-7 font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            <span>{managers.length} managerial spells</span>
            <span>Home and away splits</span>
            <span>Calculated live</span>
          </div>
        </div>
      </header>
      <ManagerComparison
        managers={managers}
        initialMatches={initialMatches as [Match[], Match[]]}
        initialManagerIndexes={initialManagerIndexes}
      />
    </main>
  );
}
