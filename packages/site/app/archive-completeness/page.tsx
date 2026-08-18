import {
  ARCHIVE_COMPLETENESS_CATEGORIES,
  isArchiveCompletenessCategory,
} from "@tranmere-web/lib/src/archive-completeness";
import {
  queryArchiveCompletenessGaps,
  queryArchiveCompletenessRows,
} from "@tranmere-web/lib/src/d1-queries";
import type {
  ArchiveCompletenessCategory,
  ArchiveCompletenessRow,
} from "@tranmere-web/lib/src/d1-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CircleStackIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Archive completeness",
  description:
    "Explore the completeness of the Tranmere Rovers archive by season and discover where supporter knowledge can help.",
  pathname: "/archive-completeness",
});

type SearchParams = Promise<{
  season?: string;
  category?: string;
}>;

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

function percentage(row: ArchiveCompletenessRow | undefined) {
  if (!row?.total_count) return 0;
  return Math.round((row.complete_count / row.total_count) * 100);
}

function coverageClass(value: number) {
  if (value === 100) return "bg-emerald-50 text-emerald-800";
  if (value >= 75) return "bg-blue-50 text-blue-800";
  if (value >= 40) return "bg-amber-50 text-amber-900";
  return "bg-rose-50 text-rose-800";
}

function gapHref(
  season: number,
  category: ArchiveCompletenessCategory,
  name: string,
  date: string | null,
) {
  if (category === "player-profiles") {
    return `/page/player/${encodeURIComponent(name)}`;
  }
  return date ? `/match/${season}/${date.slice(0, 10)}` : "/contact";
}

function contributionCopy(category: ArchiveCompletenessCategory) {
  if (category === "attendances" || category === "formations") {
    return "Open a match to suggest a correction. Signed-in submissions are reviewed before the archive is updated.";
  }
  if (category === "player-profiles") {
    return "Open a player to suggest profile information. Signed-in submissions follow the existing approval workflow.";
  }
  return "Know something we are missing? Open the archive record to check its details, then share your evidence with the site.";
}

export default async function ArchiveCompletenessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const rows = await queryArchiveCompletenessRows(db);
  const seasons = [...new Set(rows.map((row) => row.season))].sort(
    (a, b) => b - a,
  );
  const requestedSeason = Number(params.season);
  const selectedSeason = seasons.includes(requestedSeason)
    ? requestedSeason
    : seasons[0];
  const selectedCategory = isArchiveCompletenessCategory(params.category)
    ? params.category
    : "lineups";
  const gaps = selectedSeason
    ? await queryArchiveCompletenessGaps(
        db,
        selectedSeason,
        selectedCategory,
        50,
      )
    : [];
  const selectedDefinition = ARCHIVE_COMPLETENESS_CATEGORIES.find(
    (category) => category.key === selectedCategory,
  )!;
  const selectedRow = rows.find(
    (row) => row.season === selectedSeason && row.category === selectedCategory,
  );
  const totalItems = rows.reduce((total, row) => total + row.total_count, 0);
  const completedItems = rows.reduce(
    (total, row) => total + row.complete_count,
    0,
  );
  const overall = totalItems
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Built by supporters
          </p>
          <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
                Help complete the Rovers archive.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                See what is recorded, where the gaps remain and which pieces of
                Tranmere history could benefit from supporter knowledge.
              </p>
            </div>
            <div className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-6">
                <p className="font-display text-5xl font-semibold">
                  {overall}%
                </p>
                <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                  Overall coverage
                </p>
              </div>
              <div className="p-6">
                <p className="font-display text-5xl font-semibold">
                  {seasons.length}
                </p>
                <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                  Seasons measured
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        {!rows.length ? (
          <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-8 sm:p-12">
            <CircleStackIcon className="h-8 w-8 text-blue-700" />
            <h2 className="mt-6 font-display text-3xl font-semibold">
              Coverage figures are being prepared.
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-[#071a2b]/60">
              The daily archive job will publish the first aggregate snapshot.
              No private contribution or moderation data is shown here.
            </p>
          </section>
        ) : (
          <>
            <section>
              <div className="flex flex-col gap-5 border-b border-[#071a2b]/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    Coverage by season
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                    What the archive knows
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-[#071a2b]/55">
                  Percentages are generated from published archive data. They do
                  not include pending or rejected submissions.
                </p>
              </div>

              <div className="mt-8 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <thead className="bg-[#071a2b] text-white">
                    <tr>
                      <th className="sticky left-0 z-10 bg-[#071a2b] px-5 py-4 text-xs font-bold uppercase tracking-[0.14em]">
                        Season
                      </th>
                      {ARCHIVE_COMPLETENESS_CATEGORIES.map((category) => (
                        <th
                          key={category.key}
                          className="px-3 py-4 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-white/70"
                        >
                          {category.shortLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seasons.map((season) => (
                      <tr key={season} className="border-t border-[#071a2b]/10">
                        <th className="sticky left-0 z-10 whitespace-nowrap bg-[#fffdf8] px-5 py-3 font-display text-lg font-semibold">
                          {seasonLabel(season)}
                        </th>
                        {ARCHIVE_COMPLETENESS_CATEGORIES.map((category) => {
                          const row = rows.find(
                            (item) =>
                              item.season === season &&
                              item.category === category.key,
                          );
                          const value = percentage(row);
                          return (
                            <td
                              key={category.key}
                              className="p-1.5 text-center"
                            >
                              <Link
                                href={`/archive-completeness?season=${season}&category=${category.key}#gaps`}
                                className={`block px-2 py-3 font-mono text-xs font-bold transition hover:ring-2 hover:ring-blue-600 ${coverageClass(value)}`}
                                aria-label={`${seasonLabel(season)} ${category.label}: ${value}% complete`}
                              >
                                {value}%
                              </Link>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="gaps" className="mt-16 scroll-mt-8">
              <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
                <aside className="border border-[#071a2b]/15 bg-[#071a2b] p-7 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                    {selectedSeason ? seasonLabel(selectedSeason) : "Season"}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold">
                    {selectedDefinition.label}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-white/60">
                    {selectedDefinition.description}
                  </p>
                  <div className="mt-8 border-t border-white/15 pt-7">
                    <p className="font-display text-5xl font-semibold">
                      {percentage(selectedRow)}%
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                      {selectedRow?.complete_count ?? 0} of{" "}
                      {selectedRow?.total_count ?? 0} complete
                    </p>
                  </div>
                  <p className="mt-8 text-sm leading-6 text-white/60">
                    {contributionCopy(selectedCategory)}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-300 hover:text-white"
                  >
                    Share archive evidence
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </aside>

                <div className="border border-[#071a2b]/15 bg-[#fffdf8]">
                  <div className="flex items-center justify-between border-b border-[#071a2b]/15 px-6 py-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                        Recorded gaps
                      </p>
                      <p className="mt-1 text-sm text-[#071a2b]/50">
                        Showing up to 50 public archive records
                      </p>
                    </div>
                    {gaps.length ? (
                      <ExclamationCircleIcon className="h-7 w-7 text-amber-600" />
                    ) : (
                      <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
                    )}
                  </div>
                  {gaps.length ? (
                    <div className="divide-y divide-[#071a2b]/10">
                      {gaps.map((gap) => (
                        <Link
                          key={`${gap.entity_id}-${gap.match_date ?? "player"}`}
                          href={gapHref(
                            selectedSeason!,
                            selectedCategory,
                            gap.entity_name,
                            gap.match_date,
                          )}
                          className="group flex items-center justify-between gap-5 px-6 py-4 transition hover:bg-blue-50"
                        >
                          <div>
                            <p className="font-semibold">{gap.entity_name}</p>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                              {gap.match_date
                                ? new Intl.DateTimeFormat("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }).format(new Date(gap.match_date))
                                : "Player profile"}
                            </p>
                          </div>
                          <ArrowRightIcon className="h-4 w-4 shrink-0 text-blue-700 transition group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-600" />
                      <p className="mt-4 font-display text-2xl font-semibold">
                        This category is complete.
                      </p>
                      <p className="mt-2 text-sm text-[#071a2b]/55">
                        No published-data gaps were found for this season.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
