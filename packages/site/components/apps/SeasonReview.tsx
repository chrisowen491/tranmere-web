"use client";

import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PhotoIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import {
  H2HResult,
  H2HTotal,
  Manager,
  Match,
  Transfer,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { ResultTable } from "./partials/ResultTable";
import { LinkButton } from "../forms/LinkButton";
import { BlogItem, Shirt } from "@/lib/types";
import { replaceSeasonsKit } from "@tranmere-web/lib/src/apiFunctions";
import { areIntervalsOverlapping } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { SeasonStory } from "./SeasonStory";
import { SeasonTimeline } from "./SeasonTimeline";
import type { PlayerStatisticsView } from "@/lib/playerStatistics";
import { HONOURS_SEASONS } from "@tranmere-web/lib/src/honours-constants";
import type { LeagueSeasonSummaryRow } from "@tranmere-web/lib/src/d1-types";

const DIVISION_NAMES: Record<number, Record<number, string>> = {
  0: { 2: "Division 2", 3: "Division 3", 4: "Division 4" },
  1: { 2: "Division 1", 3: "Division 2", 4: "Division 3" },
  2: { 2: "The Championship", 3: "League 1", 4: "League 2" },
};

function getSeasonManagers(managers: Manager[], season: number): Manager[] {
  const seasonInterval = {
    start: new Date(season, 6, 20),
    end: new Date(season + 1, 4, 15),
  };

  return managers.filter((manager) =>
    areIntervalsOverlapping(seasonInterval, {
      start: new Date(manager.dateJoined),
      end: manager.dateLeft.toLowerCase().startsWith("now")
        ? new Date()
        : new Date(manager.dateLeft),
    }),
  );
}

function getDivisionName(results: Match[], season: number): string {
  const tier = results.reduce<number | undefined>((currentTier, result) => {
    const isLeague =
      result.competition === "League" || result.competition === "Conference";
    return isLeague && result.tier ? result.tier : currentTier;
  }, undefined);

  if (tier === 5) return "National League";
  if (!tier) return "";

  const era = season < 1992 ? 0 : season < 2004 ? 1 : 2;
  return DIVISION_NAMES[era]?.[tier] ?? "";
}

function getHighestRound(results: Match[], competition: string): number {
  return Math.max(
    0,
    ...results
      .filter((result) => result.competition === competition)
      .map((result) => result.round ?? 0),
  );
}

export default function SeasonReview(props: {
  results: Match[];
  h2hresults: H2HResult[];
  h2htotal: H2HTotal[];
  players: PlayerStatisticsView[];
  season: string;
  managers: Manager[];
  transfers: Transfer[];
  articles: BlogItem[];
  shirts: Shirt[];
  seasons: number[];
  leagueSummary?: LeagueSeasonSummaryRow;
}) {
  const {
    results,
    h2hresults,
    h2htotal,
    players,
    season,
    transfers,
    articles,
    shirts,
    seasons,
    leagueSummary,
  } = props;
  const seasonInt = Number(season);
  const achievements =
    HONOURS_SEASONS.find((honours) => honours.season === seasonInt)
      ?.achievements ?? [];
  const managers = getSeasonManagers(props.managers, seasonInt);
  const divisionName = getDivisionName(results, seasonInt);
  const topScorer = players
    .filter((player) => player.goals > 0)
    .sort((a, b) => b.goals - a.goals)[0];
  const faCupRound = getHighestRound(results, "FA Cup");
  const leagueCupRound = getHighestRound(results, "League Cup");

  return (
    <main>
      <SeasonStory
        season={season}
        results={results}
        players={players}
        managers={managers}
        transfers={transfers}
        shirts={shirts}
        seasons={seasons}
        achievements={achievements}
        leagueSummary={leagueSummary}
      />
      <SeasonTimeline
        season={season}
        results={results}
        managers={managers}
        transfers={transfers}
        articles={articles}
        achievements={achievements}
      />
      <div id="season-archive">
        <header className="relative isolate">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute left-16 top-full -mt-4 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
              <div
                style={{
                  clipPath:
                    "polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
                }}
                className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FFFFFF] to-[#9089FC]"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
              <div className="flex items-center gap-x-6">
                <CalendarDaysIcon
                  aria-hidden="true"
                  className="hidden h-12 w-12 text-indigo-600 md:block dark:text-indigo-50"
                />
                <div>
                  <div className="text-sm leading-6 text-gray-500">
                    Division
                  </div>
                  <div className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
                    {divisionName}
                  </div>
                </div>

                <div>
                  <div className="text-sm leading-6 text-gray-500">FA Cup:</div>
                  <div className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
                    Round: {faCupRound}
                  </div>
                </div>
                <div>
                  <div className="text-sm leading-6 text-gray-500">Lg Cup:</div>
                  <div className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
                    Round: {leagueCupRound}
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-x-3 sm:gap-x-3">
                {seasonInt > 1920 ? (
                  <>
                    <ChevronLeftIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-indigo-600 dark:text-indigo-50"
                    />
                    <Link
                      href={`/season/${seasonInt - 1}`}
                      prefetch={false}
                      className="text-sm font-semibold leading-6 text-indigo-900 sm:block dark:text-indigo-400"
                    >
                      Previous
                    </Link>
                  </>
                ) : (
                  ""
                )}

                {seasonInt < 2024 ? (
                  <>
                    <Link
                      href={`/season/${seasonInt + 1}`}
                      prefetch={false}
                      className="text-sm font-semibold leading-6 text-indigo-900 sm:block dark:text-indigo-400"
                    >
                      Next
                    </Link>
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-indigo-600 dark:text-indigo-50"
                    />
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </header>

        <nav
          aria-label={`Explore the ${season} season`}
          className="mx-auto grid max-w-7xl gap-px border-x border-b border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Link
            href={`/results?season=${season}`}
            className="bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
          >
            All results
          </Link>
          <Link
            href={`/players/records/${season}`}
            className="bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
          >
            Season squad
          </Link>
          <Link
            href="#season-shirts"
            className="bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
          >
            Shirts worn
          </Link>
          <Link
            href="#season-managers"
            className="bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
          >
            Managers
          </Link>
        </nav>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="lg:col-start-3 lg:row-end-1">
              <h2 className="sr-only">Summary</h2>
              <aside className="mb-2 border border-[#071a2b]/15 bg-[#fffdf8] p-5">
                <div className="mb-5 border-b border-[#071a2b]/15 pb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    Season archive
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">
                    Squad &amp; staff
                  </h2>
                </div>
                {managers && managers.length > 0 ? (
                  <>
                    <h3
                      id="season-managers"
                      className="text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65"
                    >
                      Managers
                    </h3>
                    <table className="mt-2 min-w-full text-xs">
                      <thead className="border-b border-[#071a2b]/15 text-xs font-semibold">
                        <tr>
                          <th scope="col" className="px-3 py-3.5 text-left">
                            Name
                          </th>
                          <th scope="col" className="py-3.5">
                            From
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {managers.map((manager, idx) => (
                          <tr key={idx}>
                            <td className="whitespace-nowrap px-1 md:px-1 py-4">
                              <div className="flex items-center">
                                <div className="h-11 w-11 flex-shrink-0">
                                  {manager.imagePath ? (
                                    <Image
                                      alt={manager.name}
                                      height={200}
                                      width={200}
                                      src={manager.imagePath}
                                      unoptimized
                                      className="h-11 w-11 object-cover object-top"
                                    />
                                  ) : (
                                    <PhotoIcon
                                      aria-hidden="true"
                                      className="h-11 w-11 text-blue-700"
                                    />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <LinkButton
                                    text={manager.name}
                                    href={`/managers`}
                                  ></LinkButton>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                              {manager.dateJoined}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  ""
                )}
                {shirts.length > 0 && (
                  <h3
                    id="season-shirts"
                    className="mt-6 border-t border-[#071a2b]/15 pt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65"
                  >
                    Shirts
                  </h3>
                )}
                <ul role="list" className="mt-6 space-y-6 mb-6">
                  {shirts.map((shirt) => (
                    <li key={shirt.slug} className="relative flex gap-x-4">
                      <Link href={`/shirts/${shirt.slug}`}>
                        <Image
                          src={shirt.imagesCollection.items[0].url}
                          alt={shirt.name}
                          height={1024}
                          width={1568}
                          className="h-48 w-96 object-contain"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                {topScorer && (
                  <>
                    <h3 className="mt-6 border-t border-[#071a2b]/15 pt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65">
                      Top Scorer
                    </h3>
                    <table className="mt-2 min-w-full">
                      <thead className="border-b border-[#071a2b]/15 text-xs font-semibold">
                        <tr>
                          <th scope="col" className="px-3 py-3.5 text-left">
                            Name
                          </th>
                          <th scope="col" className="py-3.5">
                            Starts
                          </th>
                          <th scope="col" className="px-3 py-3.5">
                            Goals
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr>
                          <td className="whitespace-nowrap px-1 md:px-3 py-4">
                            <div className="flex items-center">
                              <div className="h-11 w-11 flex-shrink-0">
                                {topScorer.profile.picLink && (
                                  <Image
                                    width={200}
                                    height={200}
                                    unoptimized={true}
                                    alt={topScorer.Player}
                                    src={replaceSeasonsKit(
                                      topScorer.profile.picLink,
                                    )}
                                    className="h-11 w-11 bg-[#e8e2d6] object-cover"
                                  />
                                )}
                              </div>
                              <div className="ml-4">
                                <LinkButton
                                  text={topScorer.Player}
                                  href={`/page/player/${topScorer.Player}`}
                                ></LinkButton>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                            {topScorer.starts}
                          </td>
                          <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                            {topScorer.goals}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}
                <h3 className="mt-6 border-t border-[#071a2b]/15 pt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65">
                  Player Data
                </h3>
                <table className="mt-2 min-w-full">
                  <thead className="border-b border-[#071a2b]/15 text-xs font-semibold">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left">
                        Name
                      </th>
                      <th scope="col" className="py-3.5">
                        Starts
                      </th>
                      <th scope="col" className="px-3 py-3.5">
                        Goals
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#071a2b]/10 text-xs">
                    {players.map((player) => (
                      <tr key={player.Player}>
                        <td className="whitespace-nowrap px-1 md:px-3 py-4">
                          <div className="flex items-center">
                            <div className="h-11 w-11 flex-shrink-0">
                              {player.profile.picLink ? (
                                <Image
                                  width={200}
                                  height={200}
                                  unoptimized={true}
                                  alt={player.Player}
                                  src={replaceSeasonsKit(
                                    player.profile.picLink,
                                    season,
                                  )}
                                  className="h-11 w-11 bg-[#e8e2d6] object-cover"
                                />
                              ) : (
                                <UserIcon
                                  aria-hidden="true"
                                  className="h-11 w-11 text-blue-700"
                                />
                              )}
                            </div>
                            <div className="ml-4">
                              {player.profile.exists ? (
                                <LinkButton
                                  text={player.Player}
                                  href={`/page/player/${player.Player}`}
                                ></LinkButton>
                              ) : (
                                <span className="font-medium leading-6 text-[#071a2b]">
                                  {player.Player}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                          {player.starts} ({player.subs})
                        </td>
                        <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                          {player.goals}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </aside>
              <p className="mt-4">
                <Link
                  className="inline-flex w-full items-center justify-center bg-blue-700 px-3 py-3 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  prefetch={false}
                  href={`/players/records/${season}`}
                >
                  Full Player Records
                </Link>
              </p>
            </div>

            <div className="px-2 py-2 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-2 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2  text-xs">
              <ResultTable
                title="Results"
                results={results}
                h2hresults={h2hresults}
                h2htotal={h2htotal}
              />
            </div>

            <div className="lg:col-start-3">
              {articles.length > 0 && (
                <h2 className="text-sm font-semibold leading-6 text-gray-900">
                  Articles
                </h2>
              )}

              {articles.length > 0 && (
                <div className=" border-gray-200 pt-2">
                  {articles.map((article) => (
                    <article
                      key={article.sys.id}
                      className="flex max-w-xl flex-col items-start justify-between py-6"
                    >
                      <div className="flex items-center gap-x-4 text-xs">
                        <time
                          dateTime={article.datePosted}
                          className="text-gray-500 dark:text-gray-50"
                        >
                          {new Date(article.datePosted).toDateString()}
                        </time>
                      </div>
                      <div className="group relative">
                        <h3 className="mt-1 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600 dark:text-gray-50">
                          <Link href={`/page/blog/${article.slug}`}>
                            <span className="absolute inset-0" />
                            {article.title}
                          </Link>
                        </h3>
                        <p className="mt-5 mb-5 line-clamp-3 text-sm leading-6 text-gray-600">
                          {article.description}
                        </p>
                        <Link
                          href={`/page/blog/${article.slug}`}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-gray-50"
                        >
                          Read
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
