import { ArrowRightIcon, BoltIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { searchGames } from "@/lib/games";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers penalty shootouts",
  description:
    "Explore every Tranmere Rovers penalty shootout, from the tensest wins to the toughest exits.",
  pathname: "/games/penalty-shootouts",
});

function seasonLabel(season: string) {
  const start = Number(season);
  return Number.isFinite(start)
    ? `${start}/${String(start + 1).slice(-2)}`
    : season;
}

function formatDate(date: string) {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(value);
}

function shootoutOutcome(match: Match) {
  const detail = match.pens?.toLowerCase() ?? "";
  if (/\btranmere(?: rovers)?\s+win/.test(detail)) return "W";
  return detail.includes("win") ? "L" : "?";
}

function shootoutTotal(match: Match) {
  const score = match.pens?.match(/(\d+)\s*[-–]\s*(\d+)/);
  return score ? Number(score[1]) + Number(score[2]) : 0;
}

export default async function PenaltyShootoutsPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const { results } = await searchGames(env.DB, {
    penalties: "Penalty Shootout",
    sort: "date-desc",
  });
  const matches = results;
  const won = matches.filter((match) => shootoutOutcome(match) === "W").length;
  const lost = matches.filter((match) => shootoutOutcome(match) === "L").length;
  const winRate = matches.length ? Math.round((won / matches.length) * 100) : 0;
  const drama = [...matches]
    .sort(
      (a, b) =>
        shootoutTotal(b) - shootoutTotal(a) || b.date.localeCompare(a.date),
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Results", pathname: "/results" },
          { name: "Penalty shootouts", pathname: "/games/penalty-shootouts" },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Match archive
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
                From twelve yards,
                <br />
                everything changes.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                The Tranmere Rovers archive of penalty shootouts: the nerve, the
                noise and the finest margins.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-b border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Shootouts
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {matches.length}
                </dd>
              </div>
              <div className="border-b border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Won
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold text-emerald-300">
                  {won}
                </dd>
              </div>
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Lost
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold text-rose-300">
                  {lost}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Win rate
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {winRate}%
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Most dramatic
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              The longest shootouts.
            </h2>
          </div>
          <BoltIcon className="h-8 w-8 text-blue-700" />
        </div>

        <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 md:grid-cols-3">
          {drama.map((match) => {
            const outcome = shootoutOutcome(match);
            return (
              <article
                key={`${match.season}-${match.date}`}
                className="bg-[#fffdf8] p-6"
              >
                <div className="flex gap-5">
                  {match.programme && (
                    <Image
                      width={144}
                      height={200}
                      src={`https://img.tranmere-web.com/${match.programme}`}
                      alt={`${match.home} v ${match.visitor} programme cover`}
                      className="h-32 w-24 shrink-0 border border-[#071a2b]/15 object-cover shadow-sm"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                      {seasonLabel(match.season)}
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">
                      {outcome === "W"
                        ? "Won on penalties"
                        : "Lost on penalties"}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[#071a2b]/60">
                      {match.pens}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/match/${match.season}/${match.date}`}
                  className="mt-5 block border-t border-[#071a2b]/10 pt-4 text-sm font-bold text-blue-700 hover:text-[#071a2b]"
                >
                  <span className="block text-[#071a2b]">
                    {match.home} {match.hgoal}–{match.vgoal} {match.visitor}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-xs">
                    {formatDate(match.date)} · {match.competition}
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Complete archive
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Every shootout in the archive.
            </h2>
          </div>
          <div className="overflow-x-auto border border-[#071a2b]/15">
            <table className="min-w-[680px] w-full text-left">
              <thead className="border-b border-[#071a2b]/15 bg-[#f4f0e8] text-xs font-bold uppercase tracking-[0.13em] text-[#071a2b]/55">
                <tr>
                  <th className="px-5 py-4">Season</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Match</th>
                  <th className="px-5 py-4">Outcome</th>
                  <th className="px-5 py-4">Shootout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071a2b]/10">
                {matches.map((match) => {
                  const outcome = shootoutOutcome(match);
                  return (
                    <tr
                      key={`${match.season}-${match.date}`}
                      className="hover:bg-[#f4f0e8]"
                    >
                      <td className="px-5 py-4 font-semibold">
                        <Link
                          href={`/season/${match.season}`}
                          className="hover:text-blue-700"
                        >
                          {seasonLabel(match.season)}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#071a2b]/65">
                        {formatDate(match.date)}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/match/${match.season}/${match.date}`}
                          className="font-semibold hover:text-blue-700"
                        >
                          {match.home} {match.hgoal}–{match.vgoal}{" "}
                          {match.visitor}
                        </Link>
                      </td>
                      <td
                        className={`px-5 py-4 text-sm font-bold ${
                          outcome === "W" ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {outcome === "W" ? "Won" : "Lost"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#071a2b]/65">
                        {match.pens}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
