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
import {
  buildImagePath,
  replaceSeasonsKit,
} from "@tranmere-web/lib/src/apiFunctions";
import { areIntervalsOverlapping } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { SeasonStory } from "./SeasonStory";
import { SeasonTimeline } from "./SeasonTimeline";
import type { PlayerStatisticsView } from "@/lib/playerStatistics";

function managerImageSource(imagePath: string, width: number, height: number) {
  if (imagePath.startsWith("/") || /^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return buildImagePath(imagePath, width, height);
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
}) {
  const seasonInt = parseInt(props.season);

  const managers = props.managers.filter((manager) =>
    areIntervalsOverlapping(
      {
        start: new Date(seasonInt, 6, 20),
        end: new Date(seasonInt + 1, 4, 15),
      },
      {
        start: new Date(manager.dateJoined),
        end: manager.dateLeft.toLowerCase().startsWith("now")
          ? new Date()
          : new Date(manager.dateLeft),
      },
    ),
  );

  let division = 0;
  let divisionName = "";
  props.results.forEach((result) => {
    if (
      result.competition === "League" ||
      result.competition === "Conference"
    ) {
      if (result.tier && result.tier != 0) {
        division = result.tier;
      }
    }
  });

  if (division == 5) {
    divisionName = "National League";
  } else if (seasonInt > 1991 && seasonInt < 2004) {
    if (division == 4) {
      divisionName = "Division 3";
    } else if (division == 3) {
      divisionName = "Division 2";
    } else if (division == 2) {
      divisionName = "Division 1";
    }
  } else if (seasonInt < 1992) {
    if (division == 4) {
      divisionName = "Division 4";
    } else if (division == 3) {
      divisionName = "Division 3";
    } else if (division == 2) {
      divisionName = "Division 2";
    }
  } else if (seasonInt > 2003) {
    if (division == 4) {
      divisionName = "League 2";
    } else if (division == 3) {
      divisionName = "League 1";
    } else if (division == 2) {
      divisionName = "The Championship";
    }
  }

  const topScorers = props.players.filter((player) => player.goals > 0);
  topScorers.sort((a, b) => b.goals - a.goals);

  const facup = props.results.filter(
    (result) => result.competition === "FA Cup",
  );

  let facupround = 0;
  facup.forEach((result) => {
    if (result.round && result.round > facupround) {
      facupround = result.round;
    }
  });

  const leaguecup = props.results.filter(
    (result) => result.competition === "League Cup",
  );

  let leaguecupround = 0;
  leaguecup.forEach((result) => {
    if (result.round && result.round > leaguecupround) {
      leaguecupround = result.round;
    }
  });

  return (
    <>
      <main>
        <SeasonStory
          season={props.season}
          results={props.results}
          players={props.players}
          managers={managers}
          transfers={props.transfers}
          shirts={props.shirts}
          seasons={props.seasons}
        />
        <SeasonTimeline
          season={props.season}
          results={props.results}
          managers={managers}
          transfers={props.transfers}
          articles={props.articles}
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
                    <div className="text-sm leading-6 text-gray-500">
                      FA Cup:
                    </div>
                    <div className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
                      Round: {facupround}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm leading-6 text-gray-500">
                      Lg Cup:
                    </div>
                    <div className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
                      Round: {leaguecupround}
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
            aria-label={`Explore the ${props.season} season`}
            className="mx-auto grid max-w-7xl gap-px border-x border-b border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Link
              href={`/results?season=${props.season}`}
              className="bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
            >
              All results
            </Link>
            <Link
              href={`/players/records/${props.season}`}
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
                                        src={managerImageSource(
                                          manager.imagePath,
                                          200,
                                          200,
                                        )}
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
                  {props.shirts && props.shirts.length > 0 ? (
                    <h3
                      id="season-shirts"
                      className="mt-6 border-t border-[#071a2b]/15 pt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65"
                    >
                      Shirts
                    </h3>
                  ) : (
                    ""
                  )}
                  <ul role="list" className="mt-6 space-y-6 mb-6">
                    {props.shirts.map((shirt) => (
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
                  {topScorers && topScorers.length > 0 ? (
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
                                  {topScorers[0].profile.picLink ? (
                                    <Image
                                      width={200}
                                      height={200}
                                      unoptimized={true}
                                      alt={topScorers[0].Player}
                                      src={replaceSeasonsKit(
                                        topScorers[0].profile.picLink,
                                      )}
                                      className="h-11 w-11 bg-[#e8e2d6] object-cover"
                                    />
                                  ) : (
                                    ""
                                  )}
                                </div>
                                <div className="ml-4">
                                  <LinkButton
                                    text={topScorers[0].Player}
                                    href={`/page/player/${topScorers[0].Player}`}
                                  ></LinkButton>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                              {topScorers[0].starts}
                            </td>
                            <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                              {topScorers[0].goals}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  ) : (
                    ""
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
                      {props.players.map((player, idx) => (
                        <tr key={idx}>
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
                                      props.season,
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
                                <LinkButton
                                  text={player.Player}
                                  href={`/page/player/${player.Player}`}
                                ></LinkButton>
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
                    href={`/players/records/${props.season}`}
                  >
                    Full Player Records
                  </Link>
                </p>
              </div>

              <div className="px-2 py-2 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-2 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2  text-xs">
                <ResultTable
                  title="Results"
                  results={props.results}
                  h2hresults={props.h2hresults}
                  h2htotal={props.h2htotal}
                ></ResultTable>
              </div>

              <div className="lg:col-start-3">
                {props.articles && props.articles.length > 0 ? (
                  <h2 className="text-sm font-semibold leading-6 text-gray-900">
                    Articles
                  </h2>
                ) : (
                  ""
                )}

                {props.articles && props.articles.length > 0 ? (
                  <div className=" border-gray-200 pt-2">
                    {props.articles.map((article) => (
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
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
