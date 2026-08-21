import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { ManagerFingerprints } from "@/components/apps/ManagerFingerprints";
import { searchGames } from "@/lib/games";
import { getManagers } from "@/lib/managers";
import { getManagerTrustedXi } from "@/lib/managerTrustedXi";

export const metadata: Metadata = {
  title: "Manager Fingerprints",
  description:
    "Reveal the results DNA and most trusted players of Tranmere Rovers managers.",
};

export default async function ManagerFingerprintsPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const managers = await getManagers(env.DB);
  const initialManager =
    managers.find((manager) => manager.name === "Nigel Adkins") ||
    managers.find(
      (manager) => !manager.dateLeft.toLowerCase().startsWith("now"),
    )!;
  const dateLeft = initialManager.dateLeft.toLowerCase().startsWith("now")
    ? new Date().toISOString().slice(0, 10)
    : initialManager.dateLeft;
  const [initialResults, initialXi] = await Promise.all([
    searchGames(env.DB, {
      dateFrom: initialManager.dateJoined,
      dateTo: dateLeft,
      statisticsOnly: true,
    }),
    getManagerTrustedXi(env.DB, initialManager),
  ]);
  const initialMatches = initialResults.results;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            The shape of a tenure
          </p>
          <h1 className="mt-7 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
            Every manager leaves
            <br />a fingerprint.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Turn a spell in the dugout into a visual identity—how often Rovers
            won, scored, shut teams out, travelled well and who the manager
            trusted most.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-7 font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            <span>Results-led</span>
            <span>Home and away DNA</span>
            <span>Exact tenure dates</span>
          </div>
        </div>
      </header>
      <ManagerFingerprints
        managers={managers}
        initialManager={initialManager}
        initialMatches={initialMatches}
        initialXi={initialXi}
      />
    </main>
  );
}
