import { ArrowRightIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { GetTopScorersBySeason } from "@tranmere-web/lib/src/apiFunctions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { enrichPlayerStatistics } from "@/lib/playerStatistics";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Top Scorers By Season",
  description: "Tranmere Rovers leading goalscorer for every season",
};

function seasonLabel(season: string) {
  const start = Number(season);
  return Number.isNaN(start)
    ? season
    : `${start}/${String(start + 1).slice(-2)}`;
}

export default async function TopScorersBySeason() {
  const env = (await getCloudflareContext({ async: true })).env;
  const topScorers = await enrichPlayerStatistics(
    env.DB,
    await GetTopScorersBySeason(),
  );
  const newestFirst = [...topScorers].reverse();
  const highestTotal = Math.max(...topScorers.map((player) => player.goals));
  const recordScorer = topScorers.find(
    (player) => player.goals === highestTotal,
  );
  const titleCounts = topScorers.reduce<Map<string, number>>(
    (totals, player) => {
      totals.set(player.Player, (totals.get(player.Player) ?? 0) + 1);
      return totals;
    },
    new Map(),
  );
  const repeatLeaders = [...titleCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3);
  const firstSeason = topScorers[0]?.Season;
  const latestSeason = topScorers.at(-1)?.Season;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Player records
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[1fr_430px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-6xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-8xl">
                The men who led the scoring.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65">
                The leading Tranmere goalscorer in every recorded season, from{" "}
                {firstSeason ? seasonLabel(firstSeason) : "the archive"} to{" "}
                {latestSeason ? seasonLabel(latestSeason) : "today"}.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Seasons
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {topScorers.length}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Best total
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {highestTotal}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_1.4fr] lg:items-stretch lg:px-12">
          {recordScorer && (
            <Link
              href={`/page/player/${encodeURIComponent(recordScorer.Player)}`}
              className="group flex items-center gap-5 border border-[#071a2b]/15 bg-[#071a2b] p-5 text-white"
            >
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden bg-white/10">
                <Image
                  src={recordScorer.profile.picLink}
                  alt={recordScorer.Player}
                  width={160}
                  height={160}
                  unoptimized
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-blue-300">
                  Highest season total
                </p>
                <h2 className="mt-1 truncate font-display text-2xl font-semibold">
                  {recordScorer.Player}
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  {recordScorer.goals} goals ·{" "}
                  {seasonLabel(recordScorer.Season)}
                </p>
              </div>
            </Link>
          )}

          <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-3">
            {repeatLeaders.map(([player, seasons], index) => (
              <Link
                key={player}
                href={`/page/player/${encodeURIComponent(player)}`}
                className="group flex items-center justify-between bg-[#fffdf8] px-5 py-5 transition hover:bg-blue-700 hover:text-white"
              >
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-blue-700 group-hover:text-blue-100">
                    {index === 0 ? "Most titles" : `Rank ${index + 1}`}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold">
                    {player}
                  </h3>
                </div>
                <strong className="font-display text-3xl font-semibold">
                  {seasons}
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Season by season
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Golden boots through the years.
            </h2>
          </div>
          <Link
            href="/players/lethal-finishers"
            className="inline-flex items-center gap-2 border-b border-[#071a2b] pb-1 text-sm font-bold"
          >
            Goals-per-game leaders
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <ol className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2">
          {newestFirst.map((player) => (
            <li
              key={`${player.Season}-${player.Player}`}
              className="group bg-[#fffdf8] p-5 transition hover:bg-white"
            >
              <Link
                href={`/page/player/${encodeURIComponent(player.Player)}`}
                className="block"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden bg-[#071a2b]">
                    <Image
                      alt={player.Player}
                      width={160}
                      height={160}
                      unoptimized
                      src={player.profile.picLink}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-blue-700">
                      {seasonLabel(player.Season)}
                    </p>
                    <h3 className="mt-1 truncate font-display text-2xl font-semibold tracking-[-0.03em]">
                      {player.Player}
                    </h3>
                  </div>
                  <div className="text-right">
                    <strong className="block font-display text-4xl font-semibold text-blue-700">
                      {player.goals}
                    </strong>
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/45">
                      Goals
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#071a2b]/15 pt-4 text-xs text-[#071a2b]/55">
                  <span className="inline-flex items-center gap-1.5">
                    <ChartBarIcon className="h-4 w-4" />
                    {player.Apps} appearances
                  </span>
                  <span className="font-bold text-blue-700">
                    Player profile →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
