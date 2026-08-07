import { ArrowRightIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { searchGames } from "@/lib/games";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 7200;

export const metadata = pageMetadata({
  title: "Tranmere Rovers FA Cup record",
  description:
    "Explore Tranmere Rovers' FA Cup results, season-by-season records and best runs through the archive.",
  pathname: "/results/fa-cup",
});

interface CupSeason {
  season: string;
  matches: Match[];
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface CupArchiveConfig {
  competition: string;
  pathname: string;
}

function isHome(match: Match) {
  return match.location === "H" || match.home === "Tranmere Rovers";
}

function scoreFor(match: Match) {
  return isHome(match) ? match.hgoal : match.vgoal;
}

function scoreAgainst(match: Match) {
  return isHome(match) ? match.vgoal : match.hgoal;
}

function result(match: Match) {
  if (scoreFor(match) > scoreAgainst(match)) return "W";
  if (scoreFor(match) < scoreAgainst(match)) return "L";
  return "D";
}

function goalMargin(match: Match) {
  return Math.abs(scoreFor(match) - scoreAgainst(match));
}

function seasonLabel(season: string) {
  const start = Number(season);
  return Number.isFinite(start)
    ? `${start}/${String(start + 1).slice(-2)}`
    : season;
}

function isLastQualifyingRound(
  competition: string,
  season: string,
  round?: number,
) {
  return (
    competition === "FA Cup" &&
    (round === undefined || round === null) &&
    ["2015", "2016"].includes(season)
  );
}

function inferredRound(competition: string, season: string, round?: number) {
  if (round !== undefined && round !== null) return round;
  if (isLastQualifyingRound(competition, season, round)) return 0.5;

  const historicalLeagueCupRounds: Record<string, number> = {
    "1993": 6,
    "1999": 7,
    "2026": 0,
  };
  return competition === "League Cup"
    ? (historicalLeagueCupRounds[season] ?? -1)
    : -1;
}

export default function FaCupPage() {
  return <CupArchivePage competition="FA Cup" pathname="/results/fa-cup" />;
}

function roundLabel(
  round: number | undefined,
  season: string,
  competition: string,
) {
  if (isLastQualifyingRound(competition, season, round)) {
    return "Final qualifying round";
  }
  const resolvedRound = inferredRound(competition, season, round);
  if (resolvedRound === -1) return "Not recorded";

  const labels: Record<number, string> =
    competition === "League Cup"
      ? { 5: "Quarter-final", 6: "Semi-final", 7: "Final" }
      : {
          0: "Preliminary round",
          6: "Quarter-final",
          7: "Semi-final",
          8: "Final",
        };
  return labels[resolvedRound] ?? `Round ${resolvedRound}`;
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

function furthestRound(season: CupSeason, competition: string) {
  const finalTie = season.matches.at(-1);
  if (!finalTie) return -1;
  return inferredRound(competition, season.season, finalTie.round);
}

function buildCupSeasons(matches: Match[]) {
  const seasons = new Map<string, Match[]>();
  matches.forEach((match) => {
    const seasonMatches = seasons.get(match.season) ?? [];
    seasonMatches.push(match);
    seasons.set(match.season, seasonMatches);
  });

  return [...seasons.entries()]
    .map<CupSeason>(([season, seasonMatches]) => ({
      season,
      matches: seasonMatches.sort((a, b) => a.date.localeCompare(b.date)),
      wins: seasonMatches.filter((match) => result(match) === "W").length,
      draws: seasonMatches.filter((match) => result(match) === "D").length,
      losses: seasonMatches.filter((match) => result(match) === "L").length,
      goalsFor: seasonMatches.reduce(
        (total, match) => total + scoreFor(match),
        0,
      ),
      goalsAgainst: seasonMatches.reduce(
        (total, match) => total + scoreAgainst(match),
        0,
      ),
    }))
    .sort((a, b) => Number(b.season) - Number(a.season));
}

export async function CupArchivePage({
  competition,
  pathname,
}: CupArchiveConfig) {
  const env = (await getCloudflareContext({ async: true })).env;
  const archive = await searchGames(env.DB, {
    competition,
    sort: "date-desc",
  });
  const seasons = buildCupSeasons(archive.results);
  const record = archive.h2htotal[0];
  const biggestWin = archive.results
    .filter((match) => result(match) === "W")
    .sort((a, b) => goalMargin(b) - goalMargin(a))[0];
  const heaviestDefeat = archive.results
    .filter((match) => result(match) === "L")
    .sort((a, b) => goalMargin(b) - goalMargin(a))[0];
  const bestRuns = [...seasons]
    .sort(
      (a, b) =>
        furthestRound(b, competition) - furthestRound(a, competition) ||
        b.wins - a.wins ||
        Number(b.season) - Number(a.season),
    )
    .slice(0, 3);
  const latestSeason = seasons[0];

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Results", pathname: "/results" },
          { name: competition, pathname },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Cup archive
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
                The Rovers
                <br />
                {competition} story.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Every recorded {competition} tie, from the early rounds to the
                big occasions—season-by-season and across the full archive.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Ties played
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {record?.pld ?? archive.results.length}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Seasons
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {seasons.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto grid max-w-7xl gap-px px-6 py-8 sm:grid-cols-3 sm:px-10 lg:px-12">
          {[
            ["Won", record?.wins ?? 0],
            ["Drawn", record?.draws ?? 0],
            ["Lost", record?.lost ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#fffdf8] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                {label}
              </p>
              <p className="mt-2 font-display text-4xl font-semibold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-[#071a2b]/15 bg-[#071a2b] text-white">
        <div className="mx-auto grid max-w-7xl gap-px px-6 py-8 sm:grid-cols-2 sm:px-10 lg:px-12">
          {[
            {
              label: `Biggest ${competition} win`,
              match: biggestWin,
              tone: "text-emerald-300",
            },
            {
              label: `Heaviest ${competition} defeat`,
              match: heaviestDefeat,
              tone: "text-rose-300",
            },
          ].map(({ label, match, tone }) =>
            match ? (
              <Link
                key={label}
                href={`/match/${match.season}/${match.date}`}
                className="group border border-white/15 bg-white/[0.04] p-6 transition hover:bg-white/[0.1]"
              >
                <p
                  className={`text-xs font-bold uppercase tracking-[0.16em] ${tone}`}
                >
                  {label}
                </p>
                <p className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  {match.home} {match.hgoal}–{match.vgoal} {match.visitor}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
                  {formatDate(match.date)} · {match.competition}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            ) : null,
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Deepest cup journeys
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              The deepest {competition} runs.
            </h2>
          </div>
          <TrophyIcon className="h-8 w-8 text-blue-700" />
        </div>

        <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 md:grid-cols-3">
          {bestRuns.map((season) => {
            const finalTie = season.matches.at(-1)!;
            return (
              <article key={season.season} className="bg-[#fffdf8] p-6">
                <div className="flex gap-5">
                  {finalTie.programme && (
                    <Image
                      width={144}
                      height={200}
                      src={`https://images.tranmere-web.com/${finalTie.programme}`}
                      alt={`${finalTie.home} v ${finalTie.visitor} programme cover`}
                      className="h-32 w-24 shrink-0 border border-[#071a2b]/15 object-cover shadow-sm"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                      {seasonLabel(season.season)}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-semibold">
                      {roundLabel(finalTie.round, season.season, competition)}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#071a2b]/60">
                      {season.wins} progression wins
                      <br />
                      {season.goalsFor} scored · {season.goalsAgainst} conceded
                    </p>
                  </div>
                </div>
                <Link
                  href={`/match/${finalTie.season}/${finalTie.date}`}
                  className="mt-5 block border-t border-[#071a2b]/10 pt-4 text-sm font-bold text-blue-700 hover:text-[#071a2b]"
                >
                  <span className="block text-[#071a2b]">
                    {finalTie.home} {finalTie.hgoal}–{finalTie.vgoal}{" "}
                    {finalTie.visitor}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-xs">
                    {formatDate(finalTie.date)} · {finalTie.venue}
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
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Season by season
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Every {competition} campaign.
              </h2>
            </div>
            {latestSeason && (
              <Link
                href={`/season/${latestSeason.season}`}
                className="inline-flex items-center gap-2 border-b border-[#071a2b] pb-1 text-sm font-bold hover:text-blue-700"
              >
                Latest season
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="overflow-x-auto border border-[#071a2b]/15">
            <table className="min-w-[680px] w-full text-left">
              <thead className="border-b border-[#071a2b]/15 bg-[#f4f0e8] text-xs font-bold uppercase tracking-[0.13em] text-[#071a2b]/55">
                <tr>
                  <th className="px-5 py-4">Season</th>
                  <th className="px-5 py-4 text-center">Pld</th>
                  <th className="px-5 py-4 text-center">W</th>
                  <th className="px-5 py-4 text-center">D</th>
                  <th className="px-5 py-4 text-center">L</th>
                  <th className="px-5 py-4 text-center">Goals</th>
                  <th className="px-5 py-4">Round reached</th>
                  <th className="px-5 py-4">Last tie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071a2b]/10">
                {seasons.map((season) => {
                  const finalTie = season.matches.at(-1)!;
                  return (
                    <tr key={season.season} className="hover:bg-[#f4f0e8]">
                      <td className="px-5 py-4 font-semibold">
                        <Link
                          href={`/season/${season.season}`}
                          className="hover:text-blue-700"
                        >
                          {seasonLabel(season.season)}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {season.matches.length}
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {season.wins}
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {season.draws}
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {season.losses}
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {season.goalsFor}–{season.goalsAgainst}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold">
                        {roundLabel(finalTie.round, season.season, competition)}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/match/${finalTie.season}/${finalTie.date}`}
                          className="font-semibold hover:text-blue-700"
                        >
                          {finalTie.opposition} · {finalTie.ft}
                        </Link>
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
