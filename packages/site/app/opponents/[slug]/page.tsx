import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getClubByName } from "@/lib/clubs";
import { getOpponentDossier } from "@/lib/opponentDossier";
import { getTransfers } from "@/lib/transfers";
import { matchOutcome, outcomeClass } from "@/lib/seasonMatchUtils";
import { pageMetadata } from "@/lib/seo";
import type { SlugParams } from "@/lib/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

function seasonLabel(season: string) {
  const start = Number(season);
  return Number.isFinite(start)
    ? `${start}/${String(start + 1).slice(-2)}`
    : season;
}

function matchHref(season: string, date: string) {
  return `/match/${season}/${date.slice(0, 10)}`;
}

function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(parsed);
}

export async function generateMetadata(props: {
  params: SlugParams;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const club = decodeURIComponent(slug);
  return pageMetadata({
    title: `${club} opponent dossier`,
    description: `Tranmere Rovers' competitive record, key meetings and leading scorers against ${club}.`,
    pathname: `/opponents/${encodeURIComponent(club)}`,
  });
}

export default async function OpponentDossierPage(props: {
  params: SlugParams;
}) {
  const { slug } = await props.params;
  const requestedName = decodeURIComponent(slug);
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const club = await getClubByName(db, requestedName);
  if (!club || club.name === "Tranmere Rovers") notFound();

  const [dossier, transfers] = await Promise.all([
    getOpponentDossier(db, club.name),
    getTransfers(db, { club: club.name }),
  ]);
  if (!dossier.matches.length) notFound();

  const linkedPlayers = [
    ...new Map(transfers.map((transfer) => [transfer.name, transfer])).values(),
  ];

  const total = dossier.record.h2htotal[0]!;
  const primary = club.primaryColour || "#1d4ed8";
  const secondary = club.secondaryColour || "#60a5fa";
  const runLabel = (length: number, fallback: string) =>
    length ? `${length} matches` : fallback;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-25" />
        <div
          className="absolute inset-y-0 right-0 w-2/5 opacity-25"
          style={{
            background: `linear-gradient(135deg, ${primary} 0 50%, ${secondary} 50% 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <Link
            href="/head-to-head"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            All opponents
          </Link>
          <p className="mt-14 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Opponent dossier
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl">
            Tranmere Rovers
            <span className="block text-white/30">vs</span>
            {club.name}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Every competitive meeting in the archive, with the numbers, streaks
            and names that tell the story of this fixture.
          </p>
          <div className="mt-10 flex w-48 gap-1">
            <span className="h-2 flex-1" style={{ backgroundColor: primary }} />
            <span
              className="h-2 flex-1"
              style={{ backgroundColor: secondary }}
            />
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="mx-auto grid max-w-7xl border-l border-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Meetings", total.pld, ChartBarIcon],
            ["Rovers wins", total.wins, TrophyIcon],
            ["Goals scored", total.for, FireIcon],
            ["Shared players", linkedPlayers.length, UserGroupIcon],
          ].map(([label, value, Icon]) => {
            const StatIcon = Icon as typeof ChartBarIcon;
            return (
              <div
                className="border-b border-r border-[#071a2b]/15 p-6 last:border-r-0 lg:border-b-0"
                key={label as string}
              >
                <StatIcon
                  className="h-5 w-5 text-blue-700"
                  aria-hidden="true"
                />
                <p className="mt-7 font-display text-4xl font-semibold">
                  {value as number}
                </p>
                <p className="mt-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                  {label as string}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="section-kicker">The record</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">
              How the fixture has gone
            </h2>
            <div className="mt-8 overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
              {dossier.record.h2hresults.concat([total]).map((record) => (
                <div
                  className="grid grid-cols-[1fr_repeat(4,auto)] items-center gap-4 border-b border-[#071a2b]/10 px-5 py-4 last:border-0"
                  key={record.venue}
                >
                  <span className="font-semibold">{record.venue}</span>
                  <span className="font-mono text-xs text-[#071a2b]/45">
                    P {record.pld}
                  </span>
                  <span className="font-mono text-xs text-emerald-700">
                    W {record.wins}
                  </span>
                  <span className="font-mono text-xs text-[#071a2b]/55">
                    D {record.draws}
                  </span>
                  <span className="font-mono text-xs text-red-700">
                    L {record.lost}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [
                  "Longest winning run",
                  dossier.longestWinningRun,
                  "bg-emerald-50 border-emerald-600",
                ],
                [
                  "Longest winless run",
                  dossier.longestWinlessRun,
                  "bg-rose-50 border-rose-600",
                ],
              ].map(([title, run, style]) => {
                const streak = run as typeof dossier.longestWinningRun;
                return (
                  <div
                    className={`border-l-4 p-5 ${style as string}`}
                    key={title as string}
                  >
                    <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                      {title as string}
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold">
                      {runLabel(streak.length, "No run recorded")}
                    </p>
                    {streak.start && streak.end && (
                      <p className="mt-2 text-xs text-[#071a2b]/55">
                        {formatDate(streak.start.date)} –{" "}
                        {formatDate(streak.end.date)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="section-kicker">Fixture landmarks</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">
              The games that stand out
            </h2>
            <div className="mt-8 space-y-3">
              {[
                ["First meeting", dossier.firstMeeting],
                ["Biggest victory", dossier.biggestWin],
                ["Heaviest defeat", dossier.heaviestDefeat],
                ["Latest meeting", dossier.latestMeeting],
              ].map(
                ([label, match]) =>
                  match && (
                    <Link
                      href={matchHref(
                        (match as typeof dossier.firstMeeting).season,
                        (match as typeof dossier.firstMeeting).date,
                      )}
                      key={label as string}
                      className="group grid grid-cols-[1fr_auto] gap-4 border border-[#071a2b]/15 bg-[#fffdf8] p-5 transition hover:border-blue-700 hover:bg-blue-50"
                    >
                      <span>
                        <span className="block font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-blue-700">
                          {label as string} ·{" "}
                          {seasonLabel(
                            (match as typeof dossier.firstMeeting).season,
                          )}
                        </span>
                        <span className="mt-2 block font-display text-2xl font-semibold">
                          {(match as typeof dossier.firstMeeting).opposition}
                        </span>
                        <span className="mt-1 block text-sm text-[#071a2b]/55">
                          {formatDate(
                            (match as typeof dossier.firstMeeting).date,
                          )}{" "}
                          · {(match as typeof dossier.firstMeeting).venue}
                        </span>
                      </span>
                      <span className="self-center bg-[#071a2b] px-3 py-2 font-mono text-sm font-bold text-white group-hover:bg-blue-700">
                        {(match as typeof dossier.firstMeeting).ft}
                      </span>
                    </Link>
                  ),
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <section>
            <p className="section-kicker">Rovers scorers</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">
              Who enjoys this fixture?
            </h2>
            <div className="mt-8 divide-y divide-[#071a2b]/10 border-y border-[#071a2b]/15">
              {dossier.scorers.length ? (
                dossier.scorers.map((scorer, index) => (
                  <Link
                    key={scorer.name}
                    href={`/page/player/${encodeURIComponent(scorer.name)}`}
                    className="group flex items-center justify-between py-4"
                  >
                    <span>
                      <span className="mr-4 font-mono text-xs text-[#071a2b]/35">
                        0{index + 1}
                      </span>
                      <strong className="group-hover:text-blue-700">
                        {scorer.name}
                      </strong>
                    </span>
                    <span className="font-display text-2xl font-semibold text-blue-700">
                      {scorer.goals}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="py-5 text-sm text-[#071a2b]/55">
                  No individual scorer data is recorded for this fixture.
                </p>
              )}
            </div>
          </section>

          <section>
            <p className="section-kicker">Recent meetings</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">
              The latest chapters
            </h2>
            <div className="mt-8 divide-y divide-[#071a2b]/10 border-y border-[#071a2b]/15">
              {dossier.recentMatches.map((match) => {
                const result = matchOutcome(match);
                return (
                  <Link
                    href={matchHref(match.season, match.date)}
                    key={`${match.season}-${match.date}`}
                    className="group grid grid-cols-[2.7rem_1fr_auto] items-center gap-4 py-4"
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center font-mono text-xs font-bold text-white ${outcomeClass(result)}`}
                    >
                      {result}
                    </span>
                    <span>
                      <strong className="block group-hover:text-blue-700">
                        {match.opposition}
                      </strong>
                      <span className="block text-xs text-[#071a2b]/50">
                        {formatDate(match.date)} · {match.competition} ·{" "}
                        {match.venue}
                      </span>
                    </span>
                    <span className="font-mono font-bold">
                      {match.ft}
                      <ArrowRightIcon className="ml-2 inline h-3.5 w-3.5 text-blue-700" />
                    </span>
                  </Link>
                );
              })}
            </div>
            <Link
              href={`/games/${encodeURIComponent(club.name)}`}
              className="mt-6 inline-flex items-center gap-2 bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071a2b]"
            >
              Browse every meeting <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </section>
        </div>

        <section className="mt-16 border-t border-[#071a2b]/15 pt-14">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-8">
            <div>
              <p className="section-kicker">Rovers connections</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">
                Players who crossed the divide
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#071a2b]/55">
              Recorded arrivals and departures linking Tranmere and {club.name}.
            </p>
          </div>

          {linkedPlayers.length ? (
            <div className="mt-8 grid border-l border-t border-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
              {linkedPlayers.map((player) => {
                const playerTransfers = transfers.filter(
                  (transfer) => transfer.name === player.name,
                );

                return (
                  <Link
                    key={player.name}
                    href={`/page/player/${encodeURIComponent(player.name)}`}
                    className="group min-h-48 border-b border-r border-[#071a2b]/15 bg-[#fffdf8] p-5 transition hover:bg-[#071a2b] hover:text-white"
                  >
                    <div className="flex items-start justify-between">
                      <ArrowsRightLeftIcon className="h-5 w-5 text-blue-700 group-hover:text-blue-300" />
                      <ArrowUpRightIcon className="h-4 w-4 opacity-35 group-hover:opacity-100" />
                    </div>
                    <h3 className="mt-12 font-display text-2xl font-semibold">
                      {player.name}
                    </h3>
                    <p className="mt-2 text-xs text-[#071a2b]/50 group-hover:text-white/55">
                      {playerTransfers
                        .map(
                          (transfer) =>
                            `${seasonLabel(String(transfer.season))} · ${
                              transfer.type === "in"
                                ? `Joined from ${club.name}`
                                : `Left for ${club.name}`
                            }`,
                        )
                        .join(" · ")}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 border border-[#071a2b]/15 bg-[#fffdf8] p-7 text-sm text-[#071a2b]/55">
              No player movements between these clubs are currently recorded.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
