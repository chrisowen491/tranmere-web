import { getCloudflareContext } from "@opennextjs/cloudflare";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProgrammeCollectionSettings } from "@/components/apps/ProgrammeCollectionSettings";
import { auth0 } from "@/lib/auth0";
import {
  getProgrammeTotals,
  getUserCollection,
} from "@/lib/programmeCollections";
import { ensureUserProfile } from "@/lib/userProfiles";

export const dynamic = "force-dynamic";

const labels = {
  owned: "Owned",
  wanted: "Wanted",
  trade: "Available to trade",
};

export default async function ProgrammeCollectionPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=%2Fprofile%2Fprogrammes");
  const db = getCloudflareContext().env.DB;
  const profile = await ensureUserProfile(db, session.user.sub);
  const [entries, totals] = await Promise.all([
    getUserCollection(db, session.user.sub),
    getProgrammeTotals(db),
  ]);
  const owned = entries.filter((entry) => entry.status === "owned");
  const totalProgrammes = totals.reduce((sum, item) => sum + item.total, 0);
  const ownedByGroup = new Map<string, number>();
  for (const entry of owned) {
    const key = `${entry.season}:${entry.location}`;
    ownedByGroup.set(key, (ownedByGroup.get(key) || 0) + 1);
  }
  const totalsBySeason = new Map<
    number,
    Record<"Home" | "Away", { total: number; owned: number }>
  >();
  for (const item of totals) {
    const season = totalsBySeason.get(item.season) ?? {
      Home: { total: 0, owned: 0 },
      Away: { total: 0, owned: 0 },
    };
    season[item.location] = {
      total: item.total,
      owned: ownedByGroup.get(`${item.season}:${item.location}`) || 0,
    };
    totalsBySeason.set(item.season, season);
  }
  const completion = Array.from(totalsBySeason, ([season, locations]) => ({
    season,
    ...locations,
  })).sort((a, b) => b.season - a.season);

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Supporter profile · Programme tracker
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Your programme collection
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Record what you own, build a wanted list and identify programmes
            available to trade.
          </p>
          <dl className="mt-9 grid max-w-3xl grid-cols-3 border border-white/15">
            {[
              ["Owned", owned.length],
              ["Tracked", entries.length],
              [
                "Archive completion",
                totalProgrammes
                  ? `${Math.round((owned.length / totalProgrammes) * 100)}%`
                  : "—",
              ],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`p-5 ${index < 2 ? "border-r border-white/15" : ""}`}
              >
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  {label}
                </dt>
                <dd className="mt-2 font-display text-3xl font-semibold">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-10 lg:px-12">
        <ProgrammeCollectionSettings
          initialVisible={profile?.public_collection_visible === 1}
          initialPublicId={profile?.public_collection_id || null}
        />

        <section className="border border-[#071a2b]/15 bg-[#fffdf8]">
          <div className="border-b border-[#071a2b]/15 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Collection progress
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
              Home and away by season
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#071a2b] font-mono text-[10px] uppercase tracking-[0.14em] text-white/65">
                <tr>
                  <th className="px-5 py-4">Season</th>
                  <th className="px-5 py-4">Home programmes</th>
                  <th className="px-5 py-4">Away programmes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071a2b]/10">
                {completion.map((item) => (
                  <tr key={item.season}>
                    <td className="px-5 py-4 font-mono">
                      {item.season}/{String(item.season + 1).slice(-2)}
                    </td>
                    <ProgressCell {...item.Home} />
                    <ProgressCell {...item.Away} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-[#071a2b]/15 bg-[#fffdf8]">
          <div className="border-b border-[#071a2b]/15 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Tracked editions
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
              Your programmes
            </h2>
          </div>
          {entries.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#071a2b] font-mono text-[10px] uppercase tracking-[0.14em] text-white/65">
                  <tr>
                    <th className="px-5 py-4">Programme</th>
                    <th className="px-5 py-4">Season</th>
                    <th className="px-5 py-4">Edition</th>
                    <th className="px-5 py-4">Competition</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071a2b]/10">
                  {entries.map((entry) => (
                    <tr key={entry.game_id} className="hover:bg-blue-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          {entry.programme_url ? (
                            <Image
                              src={`https://img.tranmere-web.com/${entry.programme_url}`}
                              alt=""
                              width={48}
                              height={64}
                              className="h-16 w-12 border border-[#071a2b]/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-12 items-center justify-center border border-[#071a2b]/10 bg-[#e8e2d6] px-1 text-center font-mono text-[8px] uppercase text-[#071a2b]/45">
                              Cover not recorded
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/match/${entry.season}/${entry.match_date}`}
                              className="font-bold text-blue-700"
                            >
                              {entry.match_name}
                            </Link>
                            <div className="mt-1 font-mono text-[10px] text-[#071a2b]/45">
                              {entry.match_date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono">
                        {entry.season}/{String(entry.season + 1).slice(-2)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                            entry.location === "Home"
                              ? "border-blue-700/30 bg-blue-50 text-blue-700"
                              : "border-[#071a2b]/20 bg-[#e8e2d6] text-[#071a2b]/70"
                          }`}
                        >
                          {entry.location}
                        </span>
                      </td>
                      <td className="px-5 py-4">{entry.competition}</td>
                      <td className="px-5 py-4 font-bold">
                        {labels[entry.status]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <h3 className="font-display text-3xl font-semibold">
                No programmes tracked yet.
              </h3>
              <Link
                href="/programmes"
                className="mt-4 inline-block font-bold text-blue-700"
              >
                Browse the programme archive →
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProgressCell({ owned, total }: { owned: number; total: number }) {
  const percentage = total ? Math.round((owned / total) * 100) : 0;
  return (
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="w-12 font-mono text-xs font-bold">
          {owned}/{total}
        </span>
        <div className="h-2 min-w-20 flex-1 overflow-hidden bg-[#071a2b]/10">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-10 text-right font-mono text-xs font-bold">
          {percentage}%
        </span>
      </div>
    </td>
  );
}
