import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { searchGames } from "@/lib/games";
import { getManagers } from "@/lib/managers";
import { pageMetadata } from "@/lib/seo";
import { buildStreakExplorer } from "@/lib/streaks";

export const metadata = pageMetadata({
  title: "Tranmere Rovers streaks and sequences",
  description:
    "Explore Tranmere Rovers' longest winning, unbeaten, clean-sheet, scoring and other match sequences.",
  pathname: "/results/streaks",
});

type SearchParams = Promise<{
  from?: string;
  to?: string;
  competition?: string;
  manager?: string;
}>;

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

function matchHref(match: { season: string; date: string }) {
  return `/match/${match.season}/${match.date.slice(0, 10)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function StreaksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const params = await searchParams;
  const [{ results: allMatches }, managers] = await Promise.all([
    searchGames(db, { playedOnly: true, statisticsOnly: true }),
    getManagers(db),
  ]);
  const seasons = [...new Set(allMatches.map((match) => Number(match.season)))]
    .filter(Number.isFinite)
    .sort((left, right) => right - left);
  const competitions = [
    ...new Set(allMatches.map((match) => match.competition).filter(Boolean)),
  ].sort((left, right) => left!.localeCompare(right!)) as string[];
  const from = seasons.includes(Number(params.from))
    ? Number(params.from)
    : undefined;
  const to = seasons.includes(Number(params.to))
    ? Number(params.to)
    : undefined;
  const competition = competitions.includes(params.competition ?? "")
    ? params.competition
    : undefined;
  const manager = managers.find((item) => item.id === params.manager);
  const matches = allMatches.filter((match) => {
    const season = Number(match.season);
    return (
      (!from || season >= from) &&
      (!to || season <= to) &&
      (!competition || match.competition === competition) &&
      (!manager ||
        (match.date >= manager.dateJoined &&
          (!manager.dateLeft ||
            manager.dateLeft === "now()" ||
            match.date <= manager.dateLeft)))
    );
  });
  const streaks = buildStreakExplorer(matches);
  const activeFilters = [from, to, competition, manager].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Results", pathname: "/results" },
          { name: "Streaks & sequences", pathname: "/results/streaks" },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300 hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> Results
            archive
          </Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Match records
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
            Streaks &amp; sequences.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Trace the longest runs in the Rovers archive—from winning and
            unbeaten spells to clean sheets, goals and hard times.
          </p>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <form
          action="/results/streaks"
          className="mx-auto grid max-w-7xl gap-5 px-6 py-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-5 lg:px-12"
        >
          <label className="text-sm font-bold">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/50">
              From season
            </span>
            <select
              name="from"
              defaultValue={from ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold"
            >
              <option value="">Earliest</option>
              {seasons.toReversed().map((season) => (
                <option key={season} value={season}>
                  {seasonLabel(season)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/50">
              To season
            </span>
            <select
              name="to"
              defaultValue={to ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold"
            >
              <option value="">Latest</option>
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {seasonLabel(season)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/50">
              Competition
            </span>
            <select
              name="competition"
              defaultValue={competition ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold"
            >
              <option value="">All competitions</option>
              {competitions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/50">
              Manager
            </span>
            <select
              name="manager"
              defaultValue={manager?.id ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold"
            >
              <option value="">All managers</option>
              {managers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
            >
              Explore
            </button>
            {activeFilters ? (
              <Link
                href="/results/streaks"
                className="border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-bold hover:text-blue-700"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              The longest runs
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {matches.length
                ? "How the sequence unfolded."
                : "No matches in this selection."}
            </h2>
          </div>
          {matches.length ? (
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
              {matches.length} matches analysed
            </p>
          ) : null}
        </div>
        {streaks.length ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {streaks.map((streak) => {
              const first = streak.matches[0];
              const last = streak.matches.at(-1)!;
              return (
                <article
                  key={streak.kind}
                  className="border border-[#071a2b]/15 bg-[#fffdf8]"
                >
                  <div className="flex items-end justify-between gap-4 border-b border-[#071a2b]/15 bg-[#e8e2d6] p-6">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                        {streak.label}
                      </p>
                      <h3 className="mt-2 font-display text-3xl font-semibold">
                        {streak.matches.length} matches
                      </h3>
                    </div>
                    <p className="font-mono text-xs text-[#071a2b]/55">
                      {streak.record.W}W · {streak.record.D}D ·{" "}
                      {streak.record.L}L
                    </p>
                  </div>
                  <div className="p-6">
                    <p className="text-sm leading-6 text-[#071a2b]/60">
                      {formatDate(first.date)} to {formatDate(last.date)} ·{" "}
                      {streak.goalsFor} scored, {streak.goalsAgainst} conceded.
                    </p>
                    <ol className="mt-5 divide-y divide-[#071a2b]/10 border-t border-[#071a2b]/10">
                      {streak.matches.map((match) => (
                        <li key={`${match.season}-${match.date}-${match.id}`}>
                          <Link
                            href={matchHref(match)}
                            className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm hover:text-blue-700"
                          >
                            <span>
                              <strong>{match.home}</strong> {match.hgoal}–
                              {match.vgoal} <strong>{match.visitor}</strong>
                            </span>
                            <span className="font-mono text-xs text-[#071a2b]/50">
                              {formatDate(match.date)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 border border-[#071a2b]/15 bg-[#fffdf8] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              No sequence found
            </p>
            <p className="mt-3 text-[#071a2b]/60">
              Try broadening the seasons, competition or manager filter.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
