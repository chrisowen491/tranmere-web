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
  PlayerSeasonSummary,
  Transfer,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { ResultTable } from "./partials/ResultTable";
import { LinkButton } from "../forms/LinkButton";
import { BlogItem } from "@/lib/types";
import { buildImagePath } from "@/lib/apiFunctions";
import { areIntervalsOverlapping } from "date-fns";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SeasonReview(props: {
  results: Match[];
  h2hresults: H2HResult[];
  h2htotal: H2HTotal[];
  players: PlayerSeasonSummary[];
  season: string;
  managers: Manager[];
  transfers: Transfer[];
  articles: BlogItem[];
}) {
  const seasonInt = parseInt(props.season);

  props.managers.forEach((manager) => {
    if (manager.dateLeft == "now()") {
      manager.dateLeft = new Date().toISOString();
    }
  });

  const managers = props.managers.filter((manager) =>
    areIntervalsOverlapping(
      {
        start: new Date(seasonInt, 6, 20),
        end: new Date(seasonInt + 1, 4, 15),
      },
      { start: new Date(manager.dateJoined), end: new Date(manager.dateLeft) },
    ),
  );

  let division = 0;
  let divisionName = "";
  props.results.forEach((result) => {
    if (
      result.competition === "League" ||
      result.competition === "Conference"
    ) {
      if (result.tier && parseInt(result.tier) != 0) {
        division = parseInt(result.tier);
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
    if (result.round && parseInt(result.round) > facupround) {
      facupround = parseInt(result.round);
    }
  });

  const leaguecup = props.results.filter(
    (result) => result.competition === "League Cup",
  );

  let leaguecupround = 0;
  leaguecup.forEach((result) => {
    if (result.round && parseInt(result.round) > leaguecupround) {
      leaguecupround = parseInt(result.round);
    }
  });

  return (
    <>
      <main>
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
                    Round: {facupround}
                  </div>
                </div>
                <div>
                  <div className="text-sm leading-6 text-gray-500">Lg Cup:</div>
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
                    <a
                      href={`/season/${seasonInt - 1}`}
                      className="text-sm font-semibold leading-6 text-indigo-900 sm:block dark:text-indigo-400"
                    >
                      Previous
                    </a>
                  </>
                ) : (
                  ""
                )}

                {seasonInt < 2024 ? (
                  <>
                    <a
                      href={`/season/${seasonInt + 1}`}
                      className="text-sm font-semibold leading-6 text-indigo-900 sm:block dark:text-indigo-400"
                    >
                      Next
                    </a>
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

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="lg:col-start-3 lg:row-end-1">
              <h2 className="sr-only">Summary</h2>
              <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 mb-2">
                {managers && managers.length > 0 ? (
                  <>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl px-2">
                      Managers
                    </h2>
                    <table className="min-w-full divide-y divide-gray-300  text-xs">
                      <thead className="thead-dark  text-xs font-semibold">
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
                                  {manager.programmePath ? (
                                    <img
                                      src={buildImagePath(
                                        manager.programmePath!,
                                        200,
                                        200,
                                      )}
                                      className="h-11 w-11 rounded-full"
                                    />
                                  ) : (
                                    <PhotoIcon
                                      aria-hidden="true"
                                      className="h-11 w-11 text-indigo-600  rounded-full dark:text-indigo-50"
                                    />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <LinkButton
                                    text={manager.name}
                                    href={`a`}
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
                {topScorers && topScorers.length > 0 ? (
                  <>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl px-2">
                      Top Scorer
                    </h2>
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="thead-dark  text-xs font-semibold">
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
                                {topScorers[0].bio?.picLink ? (
                                  <img
                                    src={topScorers[0].bio.picLink}
                                    className="h-11 w-11 rounded-full"
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
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl px-2">
                  Player Data
                </h2>
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="thead-dark  text-xs font-semibold">
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
                  <tbody className="divide-y divide-gray-200  text-xs">
                    {props.players.map((player, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-1 md:px-3 py-4">
                          <div className="flex items-center">
                            <div className="h-11 w-11 flex-shrink-0">
                              {player.bio?.picLink ? (
                                <img
                                  src={player.bio.picLink}
                                  className="h-11 w-11 rounded-full"
                                />
                              ) : (
                                <UserIcon
                                  aria-hidden="true"
                                  className="h-11 w-11 text-indigo-600  rounded-full dark:text-indigo-50"
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
                          {player.starts}
                        </td>
                        <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                          {player.goals}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6">
                <a
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  href={`/player-records/${props.season}`}
                >
                  Full Player Records
                </a>
              </p>
            </div>

            {/* Invoice */}
            <div className="px-2 py-2 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-2 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2  text-xs">
              <ResultTable
                title="Results"
                results={props.results}
                h2hresults={props.h2hresults}
                h2htotal={props.h2htotal}
              ></ResultTable>
            </div>

            <div className="lg:col-start-3">
              {/* Activity feed */}
              {props.transfers && props.transfers.length > 0 ? (
                <h2 className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50">
                  Transfers
                </h2>
              ) : (
                ""
              )}
              <ul role="list" className="mt-6 space-y-6 mb-6">
                {props.transfers.map((transfer, idx) => (
                  <li key={transfer.id} className="relative flex gap-x-4">
                    <div
                      className={classNames(
                        idx === props.transfers.length - 1
                          ? "h-6"
                          : "-bottom-6",
                        "absolute left-0 top-0 flex w-6 justify-center",
                      )}
                    >
                      <div className="w-px bg-gray-200" />
                    </div>
                    <>
                      <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                        {transfer.type === "in" ? (
                          <ChevronRightIcon
                            aria-hidden="true"
                            className="h-12 w-12 text-green-300"
                          />
                        ) : (
                          <ChevronLeftIcon
                            aria-hidden="true"
                            className="h-12 w-12 text-red-300"
                          />
                        )}
                      </div>
                      <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-50">
                        <span className="font-medium text-gray-900 dark:text-gray-50">
                          {transfer.name}
                        </span>{" "}
                        {transfer.type === "in" ? (
                          <>from {transfer.from}</>
                        ) : (
                          <>to {transfer.to}</>
                        )}
                        {transfer.value ? <> ({transfer.value})</> : ""}
                      </p>
                    </>
                  </li>
                ))}
              </ul>

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
                          <a href={`/page/blog/${article.slug}`}>
                            <span className="absolute inset-0" />
                            {article.title}
                          </a>
                        </h3>
                        <p className="mt-5 mb-5 line-clamp-3 text-sm leading-6 text-gray-600">
                          {article.description}
                        </p>
                        <a
                          href={`/page/blog/${article.slug}`}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-gray-50"
                        >
                          Read
                        </a>
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
      </main>
    </>
  );
}
