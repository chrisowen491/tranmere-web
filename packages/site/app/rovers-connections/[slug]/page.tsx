import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import type {
  H2HResult,
  H2HTotal,
  Match,
} from "@tranmere-web/lib/src/tranmere-web-types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { searchGames } from "@/lib/games";
import { getClubByName } from "@/lib/clubs";
import { getManagers } from "@/lib/managers";
import { getTransfers } from "@/lib/transfers";
import type { SlugParams } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface ResultsResponse {
  results: Match[];
  h2hresults: H2HResult[];
  h2htotal: H2HTotal[];
}

function resultFor(match: Match) {
  const isHome = match.home === "Tranmere Rovers";
  const scored = isHome ? match.hgoal : match.vgoal;
  const conceded = isHome ? match.vgoal : match.hgoal;
  return {
    label: scored > conceded ? "W" : scored < conceded ? "L" : "D",
    scored,
    conceded,
  };
}

function formatSeason(season: string | number) {
  const start = Number(season);
  return Number.isFinite(start)
    ? `${start}/${String(start + 1).slice(-2)}`
    : season;
}

function matchHref(match: Match) {
  return `/match/${match.season}/${match.date.slice(0, 10)}`;
}

export async function generateMetadata(props: {
  params: SlugParams;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const club = decodeURIComponent(slug);
  return pageMetadata({
    title: `${club} connections`,
    description: `Explore the players, transfers and matches connecting ${club} with Tranmere Rovers.`,
    pathname: `/rovers-connections/${encodeURIComponent(club)}`,
  });
}

export default async function RoversConnectionPage(props: {
  params: SlugParams;
}) {
  const { slug } = await props.params;
  const clubName = decodeURIComponent(slug);
  await connection();
  const env = (await getCloudflareContext({ async: true })).env;
  const [club, transfers, managers] = await Promise.all([
    getClubByName(env.DB, clubName),
    getTransfers(env.DB, { club: clubName }),
    getManagers(env.DB),
  ]);

  if (!club || club.name === "Tranmere Rovers") notFound();

  const matchData: ResultsResponse = await searchGames(env.DB, {
    opposition: club.name,
  });
  const matches = [...matchData.results].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const record = matches.reduce(
    (total, match) => {
      const result = resultFor(match).label;
      total[result.toLowerCase() as "w" | "d" | "l"] += 1;
      return total;
    },
    { w: 0, d: 0, l: 0 },
  );
  const linkedPlayers = [
    ...new Map(transfers.map((transfer) => [transfer.name, transfer])).values(),
  ];
  const linkedManagers = managers.filter((manager) =>
    linkedPlayers.some((player) => player.name === manager.name),
  );
  const recentMatches = matches.slice(0, 6);
  const firstMeeting = matches.at(-1);
  const latestMeeting = matches.at(0);
  const primary = club.primaryColour || "#1d4ed8";
  const secondary = club.secondaryColour || "#60a5fa";

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-25" />
        <div
          className="absolute inset-y-0 right-0 w-2/5 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${primary} 0 50%, ${secondary} 50% 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <Link
            href="/rovers-connections"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            All connections
          </Link>
          <p className="mt-14 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Rovers connections
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl">
            Tranmere Rovers
            <span className="block text-white/30">×</span>
            {club.name}
          </h1>
          <div className="mt-10 flex w-48 gap-1">
            <span className="h-2 flex-1" style={{ backgroundColor: primary }} />
            <span
              className="h-2 flex-1"
              style={{ backgroundColor: secondary }}
            />
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15">
        <div className="mx-auto grid max-w-7xl border-l border-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Meetings",
              value: matches.length,
              icon: CalendarDaysIcon,
            },
            { label: "Rovers wins", value: record.w, icon: TrophyIcon },
            {
              label: "Shared players",
              value: linkedPlayers.length,
              icon: UserGroupIcon,
            },
            {
              label: "Transfers",
              value: transfers.length,
              icon: ArrowsRightLeftIcon,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="border-b border-r border-[#071a2b]/15 bg-[#fffdf8] p-6"
            >
              <Icon className="h-5 w-5 text-blue-700" />
              <p className="mt-8 font-display text-4xl font-semibold">
                {value}
              </p>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <nav
        aria-label={`Explore ${club.name} archive links`}
        className="mx-auto grid max-w-7xl gap-px border-x border-b border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-3"
      >
        <Link
          href={`/games/${encodeURIComponent(club.name)}`}
          className="bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
        >
          Complete head-to-head
        </Link>
        {latestMeeting ? (
          <Link
            href={matchHref(latestMeeting)}
            className="bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
          >
            Latest meeting
          </Link>
        ) : (
          <span className="bg-[#fffdf8] px-5 py-4 text-sm font-bold text-[#071a2b]/35">
            No meeting recorded yet
          </span>
        )}
        {linkedPlayers[0] ? (
          <Link
            href={`/page/player/${encodeURIComponent(linkedPlayers[0].name)}`}
            className="bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
          >
            Notable shared player · {linkedPlayers[0].name}
          </Link>
        ) : (
          <span className="bg-[#fffdf8] px-5 py-4 text-sm font-bold text-[#071a2b]/35">
            No shared players recorded
          </span>
        )}
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#071a2b]/15 pb-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                People
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
                Players who crossed the divide.
              </h2>
            </div>
            <span className="font-mono text-xs text-[#071a2b]/40">
              {linkedPlayers.length} recorded
            </span>
          </div>

          {linkedPlayers.length > 0 ? (
            <div className="grid border-l border-t border-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
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
                      <UserGroupIcon className="h-5 w-5 text-blue-700 group-hover:text-blue-300" />
                      <ArrowUpRightIcon className="h-4 w-4 opacity-35 group-hover:opacity-100" />
                    </div>
                    <h3 className="mt-12 font-display text-2xl font-semibold">
                      {player.name}
                    </h3>
                    <p className="mt-2 text-xs text-[#071a2b]/50 group-hover:text-white/55">
                      {playerTransfers
                        .map(
                          (transfer) =>
                            `${formatSeason(transfer.season)} · ${transfer.type === "in" ? "Arrived" : "Departed"}`,
                        )
                        .join(" · ")}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-8 text-[#071a2b]/55">
              No player movements between these clubs are currently recorded.
            </div>
          )}
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.5fr_0.75fr]">
          <div>
            <div className="border-b border-[#071a2b]/15 pb-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Match archive
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
                Recent meetings.
              </h2>
            </div>
            <div className="border-x border-[#071a2b]/15">
              {recentMatches.map((match) => {
                const result = resultFor(match);
                return (
                  <Link
                    key={`${match.season}-${match.date}`}
                    href={matchHref(match)}
                    className="group grid grid-cols-[44px_1fr_auto] items-center gap-4 border-b border-[#071a2b]/15 bg-[#fffdf8] p-4 transition hover:bg-blue-50"
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center font-mono text-xs font-bold text-white ${
                        result.label === "W"
                          ? "bg-blue-700"
                          : result.label === "L"
                            ? "bg-red-700"
                            : "bg-[#64748b]"
                      }`}
                    >
                      {result.label}
                    </span>
                    <span>
                      <span className="block font-display text-lg font-semibold">
                        {match.home} {match.hgoal}–{match.vgoal} {match.visitor}
                      </span>
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-[#071a2b]/40">
                        {formatSeason(match.season)} ·{" "}
                        {match.competition || match.division}
                      </span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-[#071a2b]/30 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                  </Link>
                );
              })}
              {recentMatches.length === 0 && (
                <p className="border-b border-[#071a2b]/15 bg-[#fffdf8] p-7 text-sm text-[#071a2b]/55">
                  No meetings are currently recorded in the match archive.
                </p>
              )}
            </div>
            <Link
              href={`/games/${encodeURIComponent(club.name)}`}
              className="mt-5 inline-flex items-center gap-2 border-b border-[#071a2b] pb-1 text-sm font-bold"
            >
              Open the complete head-to-head record
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <aside className="space-y-5">
            <div className="bg-[#071a2b] p-6 text-white">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
                The record
              </p>
              <div className="mt-7 grid grid-cols-3 divide-x divide-white/15 text-center">
                {[
                  ["Won", record.w],
                  ["Drawn", record.d],
                  ["Lost", record.l],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="font-display text-3xl font-semibold">
                      {value}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/40">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              {(firstMeeting || latestMeeting) && (
                <dl className="mt-7 space-y-4 border-t border-white/15 pt-6 text-sm">
                  {firstMeeting && (
                    <div>
                      <dt className="text-white/40">First archive meeting</dt>
                      <dd className="mt-1 font-semibold">
                        {new Date(firstMeeting.date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </dd>
                    </div>
                  )}
                  {latestMeeting && (
                    <div>
                      <dt className="text-white/40">Latest meeting</dt>
                      <dd className="mt-1 font-semibold">
                        {new Date(latestMeeting.date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>

            {linkedManagers.length > 0 && (
              <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                  Player to manager
                </p>
                {linkedManagers.map((manager) => (
                  <Link
                    key={manager.name}
                    href="/managers"
                    className="mt-4 flex items-center justify-between font-display text-xl font-semibold hover:text-blue-700"
                  >
                    {manager.name}
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
