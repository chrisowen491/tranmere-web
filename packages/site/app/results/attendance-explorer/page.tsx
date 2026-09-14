import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { searchGames } from "@/lib/games";
import {
  buildAttendanceExplorer,
  type AttendanceVenue,
} from "@/lib/attendanceExplorer";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers attendance explorer",
  description:
    "Explore Tranmere Rovers crowd trends by season, venue, competition and opposition.",
  pathname: "/results/attendance-explorer",
});

type SearchParams = Promise<{
  from?: string;
  to?: string;
  venue?: string;
  competition?: string;
}>;

const number = new Intl.NumberFormat("en-GB");

function seasonLabel(value: string | number) {
  const season = Number(value);
  return Number.isFinite(season)
    ? `${season}/${String(season + 1).slice(-2)}`
    : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function matchHref(match: { season: string; date: string }) {
  return `/match/${match.season}/${match.date.slice(0, 10)}`;
}

function venueValue(value?: string): AttendanceVenue | undefined {
  return value === "H" || value === "A" || value === "N" ? value : undefined;
}

export default async function AttendanceExplorerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const params = await searchParams;
  const { results: matches } = await searchGames(db, {
    playedOnly: true,
    statisticsOnly: true,
  });
  const seasons = [...new Set(matches.map((match) => Number(match.season)))]
    .filter(Number.isFinite)
    .sort((left, right) => right - left);
  const competitions = [
    ...new Set(matches.map((match) => match.competition).filter(Boolean)),
  ].sort((left, right) => left!.localeCompare(right!)) as string[];
  const seasonFrom = seasons.includes(Number(params.from))
    ? Number(params.from)
    : undefined;
  const seasonTo = seasons.includes(Number(params.to))
    ? Number(params.to)
    : undefined;
  const competition = competitions.includes(params.competition ?? "")
    ? params.competition
    : undefined;
  const venue = venueValue(params.venue);
  const explorer = buildAttendanceExplorer(matches, {
    seasonFrom,
    seasonTo,
    competition,
    venue,
  });
  const maxSeasonAverage = Math.max(
    ...explorer.bySeason.map((season) => season.average),
    1,
  );
  const activeFilters = [seasonFrom, seasonTo, competition, venue].filter(
    Boolean,
  ).length;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Tranmere Rovers attendance explorer",
          description:
            "Recorded Tranmere Rovers attendances grouped by season, venue, competition and opposition.",
          url: absoluteUrl("/results/attendance-explorer"),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Results", pathname: "/results" },
          {
            name: "Attendance explorer",
            pathname: "/results/attendance-explorer",
          },
        ])}
      />

      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Results archive
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Through the turnstiles
              </p>
              <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
                The Attendance Explorer.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Follow Rovers&rsquo; crowds across the decades and compare gates
                by venue, competition and opposition. Figures use competitive
                matches with a recorded attendance.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              {[
                [number.format(explorer.summary.average), "Average crowd"],
                [number.format(explorer.summary.median), "Median crowd"],
                [number.format(explorer.summary.recorded), "Recorded gates"],
                [`${explorer.summary.coverage}%`, "Archive coverage"],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={`${index < 2 ? "border-b" : ""} ${index % 2 === 0 ? "border-r" : ""} border-white/15 p-5`}
                >
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    {label}
                  </dt>
                  <dd className="mt-2 font-display text-4xl font-semibold">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <form
          className="mx-auto grid max-w-7xl gap-5 px-6 py-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-5 lg:px-12"
          action="/results/attendance-explorer"
        >
          <label className="text-sm font-bold">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/50">
              From season
            </span>
            <select
              name="from"
              defaultValue={seasonFrom ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold focus:border-blue-700 focus:ring-blue-700"
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
              defaultValue={seasonTo ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold focus:border-blue-700 focus:ring-blue-700"
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
              Venue
            </span>
            <select
              name="venue"
              defaultValue={venue ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="">All venues</option>
              <option value="H">Home</option>
              <option value="A">Away</option>
              <option value="N">Neutral</option>
            </select>
          </label>
          <label className="text-sm font-bold">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/50">
              Competition
            </span>
            <select
              name="competition"
              defaultValue={competition ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="">All competitions</option>
              {competitions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Explore
            </button>
            {activeFilters > 0 && (
              <Link
                href="/results/attendance-explorer"
                className="border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-bold hover:text-blue-700"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </section>

      {explorer.recordedMatches.length === 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
          <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              No recorded gates
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold">
              Try a broader set of filters.
            </h2>
          </div>
        </section>
      ) : (
        <>
          <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
            <div className="flex items-end justify-between gap-6 border-b border-[#071a2b]/15 pb-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  Season by season
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  How the crowds changed.
                </h2>
              </div>
              <ChartBarIcon
                className="h-9 w-9 text-blue-700"
                aria-hidden="true"
              />
            </div>
            <div className="mt-8 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
              <div className="min-w-[720px] divide-y divide-[#071a2b]/10">
                {explorer.bySeason.map((season) => (
                  <div
                    key={season.label}
                    className="grid grid-cols-[100px_minmax(240px,1fr)_100px_100px] items-center gap-4 px-5 py-3 hover:bg-blue-50/60"
                  >
                    <Link
                      href={`/season/${season.label}`}
                      className="font-bold hover:text-blue-700"
                    >
                      {seasonLabel(season.label)}
                    </Link>
                    <div className="h-5 bg-[#e8e2d6]">
                      <div
                        className="h-full bg-blue-700"
                        style={{
                          width: `${Math.max(1, (season.average / maxSeasonAverage) * 100)}%`,
                        }}
                      />
                    </div>
                    <strong className="text-right font-mono text-sm">
                      {number.format(season.average)}
                    </strong>
                    <span className="text-right text-xs text-[#071a2b]/50">
                      {season.recorded}/{season.matches} games
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-[#071a2b]/15 bg-[#e8e2d6]">
            <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-10 lg:grid-cols-2 lg:px-12 lg:py-20">
              {[
                {
                  eyebrow: "Venue comparison",
                  title: "Home, away and neutral.",
                  rows: explorer.byVenue,
                },
                {
                  eyebrow: "Competition comparison",
                  title: "Where the crowds gathered.",
                  rows: explorer.byCompetition.slice(0, 8),
                },
              ].map((section) => (
                <div
                  key={section.eyebrow}
                  className="border border-[#071a2b]/15 bg-[#fffdf8]"
                >
                  <div className="border-b border-[#071a2b]/15 p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                      {section.eyebrow}
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-semibold">
                      {section.title}
                    </h2>
                  </div>
                  <dl className="divide-y divide-[#071a2b]/10">
                    {section.rows.map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[1fr_auto] gap-5 px-6 py-4 hover:bg-blue-50/60"
                      >
                        <div>
                          <dt className="font-bold">{row.label}</dt>
                          <dd className="mt-1 text-xs text-[#071a2b]/50">
                            {row.recorded} recorded · high{" "}
                            {number.format(row.highest)}
                          </dd>
                        </div>
                        <dd className="text-right">
                          <strong className="block font-display text-2xl">
                            {number.format(row.average)}
                          </strong>
                          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#071a2b]/40">
                            Average
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:px-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:px-12 lg:py-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Record gates
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                The largest selected crowds.
              </h2>
              <div className="mt-8 overflow-x-auto border border-[#071a2b]/15">
                <table className="w-full min-w-[650px] border-collapse bg-[#fffdf8] text-left">
                  <thead className="bg-[#071a2b] text-white">
                    <tr className="font-mono text-[9px] uppercase tracking-[0.14em]">
                      <th className="px-4 py-4">Match</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Venue</th>
                      <th className="px-4 py-4 text-right">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#071a2b]/10">
                    {explorer.records.slice(0, 10).map((match) => (
                      <tr
                        key={`${match.season}-${match.date}-${match.opposition}`}
                        className="hover:bg-blue-50/70"
                      >
                        <td className="px-4 py-4">
                          <Link
                            href={matchHref(match)}
                            className="font-bold hover:text-blue-700"
                          >
                            {match.home} {match.hgoal}–{match.vgoal}{" "}
                            {match.visitor}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#071a2b]/60">
                          {formatDate(match.date)}
                        </td>
                        <td className="px-4 py-4 text-sm text-[#071a2b]/60">
                          {match.venue ||
                            (match.location === "H" ? "Home" : "Away")}
                        </td>
                        <td className="px-4 py-4 text-right font-display text-2xl font-semibold">
                          {number.format(Number(match.attendance))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Crowd pullers
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
                Highest average opposition.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#071a2b]/60">
                Opponents with at least three recorded attendances in the
                selected period.
              </p>
              <div className="mt-8 border border-[#071a2b]/15 bg-[#fffdf8]">
                {explorer.byOpposition.slice(0, 10).map((opponent, index) => (
                  <Link
                    key={opponent.label}
                    href={`/games/${encodeURIComponent(opponent.label)}`}
                    className="group grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-[#071a2b]/10 px-4 py-4 last:border-b-0 hover:bg-blue-50/70"
                  >
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {index + 1}
                    </span>
                    <span>
                      <strong className="block group-hover:text-blue-700">
                        {opponent.label}
                      </strong>
                      <span className="text-xs text-[#071a2b]/45">
                        {opponent.recorded} matches
                      </span>
                    </span>
                    <span className="flex items-center gap-2 font-mono text-sm font-bold">
                      {number.format(opponent.average)}
                      <ArrowRightIcon
                        className="h-4 w-4 text-blue-700"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}
