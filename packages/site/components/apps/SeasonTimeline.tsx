import {
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  NewspaperIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  Manager,
  Match,
  Transfer,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { BlogItem } from "@/lib/types";
import Link from "next/link";

type Outcome = "W" | "D" | "L";

interface MonthChapter {
  key: string;
  date: Date;
  matches: Match[];
  managersJoining: Manager[];
  managersLeaving: Manager[];
  transfers: Transfer[];
}

function parseDate(value?: string) {
  if (!value || value.toLowerCase().startsWith("now")) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isTranmereHome(match: Match) {
  return (
    match.location === "H" ||
    match.venue?.toLowerCase() === "home" ||
    match.home?.toLowerCase().includes("tranmere")
  );
}

function goalsFor(match: Match) {
  return isTranmereHome(match) ? match.hgoal : match.vgoal;
}

function goalsAgainst(match: Match) {
  return isTranmereHome(match) ? match.vgoal : match.hgoal;
}

function outcome(match: Match): Outcome {
  const recorded = match.ft?.trim().charAt(0).toUpperCase();
  if (recorded === "W" || recorded === "D" || recorded === "L") {
    return recorded;
  }
  if (goalsFor(match) > goalsAgainst(match)) return "W";
  if (goalsFor(match) < goalsAgainst(match)) return "L";
  return "D";
}

function resultLabel(match: Match) {
  if (match.ft?.trim()) return match.ft;
  return `${goalsFor(match)}–${goalsAgainst(match)}`;
}

function dayLabel(value: string) {
  const date = parseDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function managerDateInSeason(
  value: string,
  seasonStart: Date,
  seasonEnd: Date,
) {
  const date = parseDate(value);
  return date && date >= seasonStart && date <= seasonEnd ? date : null;
}

function buildChapters(
  season: string,
  results: Match[],
  managers: Manager[],
  transfers: Transfer[],
) {
  const firstYear = Number(season);
  const seasonStart = new Date(firstYear, 5, 1);
  const seasonEnd = new Date(firstYear + 1, 5, 30);
  const chapters = new Map<string, MonthChapter>();

  function ensureChapter(date: Date) {
    const key = monthKey(date);
    const existing = chapters.get(key);
    if (existing) return existing;
    const chapter: MonthChapter = {
      key,
      date: new Date(date.getFullYear(), date.getMonth(), 1),
      matches: [],
      managersJoining: [],
      managersLeaving: [],
      transfers: [],
    };
    chapters.set(key, chapter);
    return chapter;
  }

  results.forEach((match) => {
    const date = parseDate(match.date);
    if (date) ensureChapter(date).matches.push(match);
  });

  managers.forEach((manager) => {
    const joined = managerDateInSeason(
      manager.dateJoined,
      seasonStart,
      seasonEnd,
    );
    const left = managerDateInSeason(manager.dateLeft, seasonStart, seasonEnd);
    if (joined) ensureChapter(joined).managersJoining.push(manager);
    if (left) ensureChapter(left).managersLeaving.push(manager);
  });

  transfers.forEach((transfer) => {
    const date = parseDate(transfer.date);
    if (date && date >= seasonStart && date <= seasonEnd) {
      ensureChapter(date).transfers.push(transfer);
    }
  });

  return [...chapters.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((chapter) => ({
      ...chapter,
      matches: chapter.matches.sort(
        (a, b) =>
          (parseDate(a.date)?.getTime() ?? 0) -
          (parseDate(b.date)?.getTime() ?? 0),
      ),
    }));
}

export function SeasonTimeline(props: {
  season: string;
  results: Match[];
  managers: Manager[];
  transfers: Transfer[];
  articles: BlogItem[];
}) {
  const chapters = buildChapters(
    props.season,
    props.results,
    props.managers,
    props.transfers,
  );
  const undatedTransfers = props.transfers.filter(
    (transfer) => !parseDate(transfer.date),
  );
  const completedMatches = props.results.filter(
    (match) =>
      typeof match.hgoal === "number" && typeof match.vgoal === "number",
  );
  const wins = completedMatches.filter(
    (match) => outcome(match) === "W",
  ).length;
  if (chapters.length === 0 && undatedTransfers.length === 0) return null;

  return (
    <section
      id="season-timeline"
      className="border-b border-[#071a2b]/15 bg-[#fffdf8] text-[#071a2b]"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.36fr_0.64fr] lg:gap-20">
          <header className="lg:sticky lg:top-8 lg:self-start">
            <p className="section-kicker">Season timeline</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              The campaign, month by month
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#071a2b]/60">
              Follow the rhythm of the season through every result, change in
              the dugout and recorded player movement.
            </p>

            <dl className="mt-8 grid grid-cols-3 border-y border-[#071a2b]/15">
              {[
                ["Months", chapters.length],
                ["Matches", completedMatches.length],
                ["Wins", wins],
              ].map(([label, value]) => (
                <div
                  className="border-r border-[#071a2b]/15 py-4 last:border-r-0"
                  key={label}
                >
                  <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                    {label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href={`/results?season=${props.season}`}
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-[#071a2b]"
            >
              Open the complete results archive
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </header>

          <div>
            {undatedTransfers.length > 0 && (
              <article className="relative border-l border-[#071a2b]/20 pb-12 pl-8 sm:pl-12">
                <span className="absolute -left-4 top-0 grid h-8 w-8 place-items-center rounded-full bg-blue-700 text-white ring-8 ring-[#fffdf8]">
                  <ArrowsRightLeftIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                  Opening chapter
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">
                  The squad takes shape
                </h3>
                <details className="group mt-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between border-b border-[#071a2b]/15 pb-4 text-sm text-[#071a2b]/55 [&::-webkit-details-marker]:hidden">
                    <span>
                      {undatedTransfers.length} recorded{" "}
                      {undatedTransfers.length === 1 ? "move" : "moves"}. Exact
                      dates are not held in the archive.
                    </span>
                    <span className="shrink-0 pl-4 font-bold text-blue-700 group-open:hidden">
                      View moves +
                    </span>
                    <span className="hidden shrink-0 pl-4 font-bold text-blue-700 group-open:inline">
                      Hide moves −
                    </span>
                  </summary>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {undatedTransfers.map((transfer) => (
                      <Link
                        href={`/page/player/${encodeURIComponent(transfer.name)}`}
                        key={transfer.id}
                        className="group border border-[#071a2b]/15 bg-[#f4f0e8] p-4 transition hover:border-blue-700"
                      >
                        <span
                          className={`text-[0.62rem] font-bold uppercase tracking-[0.14em] ${
                            transfer.type === "in"
                              ? "text-emerald-700"
                              : "text-red-700"
                          }`}
                        >
                          {transfer.type === "in" ? "Arrival" : "Departure"}
                        </span>
                        <span className="mt-1 block font-semibold group-hover:text-blue-700">
                          {transfer.name}
                        </span>
                        <span className="mt-1 block text-xs text-[#071a2b]/50">
                          {transfer.type === "in"
                            ? `From ${transfer.from}`
                            : `To ${transfer.to}`}
                          {transfer.value ? ` · ${transfer.value}` : ""}
                        </span>
                      </Link>
                    ))}
                  </div>
                </details>
              </article>
            )}

            <ol>
              {chapters.map((chapter, chapterIndex) => {
                const monthWins = chapter.matches.filter(
                  (match) => outcome(match) === "W",
                ).length;
                const monthDraws = chapter.matches.filter(
                  (match) => outcome(match) === "D",
                ).length;
                const monthLosses = chapter.matches.filter(
                  (match) => outcome(match) === "L",
                ).length;

                return (
                  <li
                    className="relative border-l border-[#071a2b]/20 pb-12 pl-8 last:pb-0 sm:pl-12"
                    key={chapter.key}
                  >
                    <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-4 border-[#fffdf8] bg-emerald-500 ring-1 ring-[#071a2b]/20" />
                    <details className="group" open={chapterIndex === 0}>
                      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#071a2b]/40">
                              Chapter{" "}
                              {String(chapterIndex + 1).padStart(2, "0")}
                            </p>
                            <h3 className="mt-1 font-display text-3xl font-semibold">
                              {monthLabel(chapter.date)}
                            </h3>
                          </div>
                          {chapter.matches.length > 0 && (
                            <div
                              className="flex gap-1"
                              aria-label="Monthly form"
                            >
                              {chapter.matches.map((match) => {
                                const result = outcome(match);
                                return (
                                  <span
                                    key={`${match.date}-${match.opposition}`}
                                    title={`${match.opposition}: ${resultLabel(match)}`}
                                    className={`grid h-7 w-7 place-items-center text-[0.65rem] font-bold text-white ${
                                      result === "W"
                                        ? "bg-emerald-600"
                                        : result === "D"
                                          ? "bg-slate-500"
                                          : "bg-red-600"
                                    }`}
                                  >
                                    {result}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-b border-[#071a2b]/15 pb-4 text-xs">
                          <span className="font-bold uppercase tracking-[0.12em] text-[#071a2b]/45">
                            {chapter.matches.length} matches · {monthWins}W{" "}
                            {monthDraws}D {monthLosses}L
                          </span>
                          <span className="font-bold text-blue-700 group-open:hidden">
                            Open chapter +
                          </span>
                          <span className="hidden font-bold text-blue-700 group-open:inline">
                            Close chapter −
                          </span>
                        </div>
                      </summary>

                      {(chapter.managersJoining.length > 0 ||
                        chapter.managersLeaving.length > 0) && (
                        <div className="mt-5 border-l-4 border-blue-700 bg-blue-50 p-4">
                          {[...chapter.managersJoining].map((manager) => (
                            <p
                              className="flex items-center gap-2 text-sm"
                              key={`joined-${manager.name}`}
                            >
                              <UserIcon
                                className="h-4 w-4 text-blue-700"
                                aria-hidden="true"
                              />
                              <strong>{manager.name}</strong> took charge
                            </p>
                          ))}
                          {[...chapter.managersLeaving].map((manager) => (
                            <p
                              className="flex items-center gap-2 text-sm"
                              key={`left-${manager.name}`}
                            >
                              <UserIcon
                                className="h-4 w-4 text-blue-700"
                                aria-hidden="true"
                              />
                              <strong>{manager.name}</strong> left the role
                            </p>
                          ))}
                        </div>
                      )}

                      {chapter.transfers.length > 0 && (
                        <div className="mt-5 border-l-4 border-emerald-600 bg-emerald-50 p-4">
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-emerald-700">
                            Squad movement
                          </p>
                          <div className="mt-3 space-y-2">
                            {chapter.transfers.map((transfer) => (
                              <Link
                                href={`/page/player/${encodeURIComponent(transfer.name)}`}
                                key={transfer.id}
                                className="flex items-center justify-between gap-4 text-sm hover:text-blue-700"
                              >
                                <span>
                                  <strong>{transfer.name}</strong>{" "}
                                  {transfer.type === "in"
                                    ? `arrived from ${transfer.from}`
                                    : `departed for ${transfer.to}`}
                                </span>
                                <span className="shrink-0 font-mono text-xs text-[#071a2b]/45">
                                  {transfer.date}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {chapter.matches.length > 0 && (
                        <div className="divide-y divide-[#071a2b]/10 border-b border-[#071a2b]/15">
                          {chapter.matches.map((match) => {
                            const result = outcome(match);
                            return (
                              <Link
                                href={`/match/${match.season}/${match.date}`}
                                key={`${match.date}-${match.opposition}`}
                                className="group grid grid-cols-[3.5rem_2rem_1fr_auto] items-center gap-3 py-3 text-sm"
                              >
                                <span className="font-mono text-xs text-[#071a2b]/45">
                                  {dayLabel(match.date)}
                                </span>
                                <span
                                  className={`grid h-6 w-6 place-items-center text-[0.62rem] font-bold text-white ${
                                    result === "W"
                                      ? "bg-emerald-600"
                                      : result === "D"
                                        ? "bg-slate-500"
                                        : "bg-red-600"
                                  }`}
                                >
                                  {result}
                                </span>
                                <span>
                                  <span className="block font-semibold group-hover:text-blue-700">
                                    {match.opposition}
                                  </span>
                                  <span className="block text-xs text-[#071a2b]/45">
                                    {match.venue} · {match.competition}
                                  </span>
                                </span>
                                <span className="font-mono font-bold">
                                  {resultLabel(match)}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </details>
                  </li>
                );
              })}
            </ol>

            {props.articles.length > 0 && (
              <aside className="mt-14 border border-[#071a2b]/15 bg-[#f4f0e8] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <NewspaperIcon
                    className="h-6 w-6 text-blue-700"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-blue-700">
                      From the archive
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold">
                      Stories from the season
                    </h3>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {props.articles.slice(0, 4).map((article) => (
                    <Link
                      href={`/page/blog/${article.slug}`}
                      key={article.sys.id}
                      className="group flex items-start justify-between gap-4 border-t border-[#071a2b]/15 pt-4"
                    >
                      <span>
                        <span className="font-semibold group-hover:text-blue-700">
                          {article.title}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#071a2b]/50">
                          {article.description}
                        </span>
                      </span>
                      <ArrowRightIcon
                        className="mt-1 h-4 w-4 shrink-0 text-blue-700"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
