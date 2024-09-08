"use client";

import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/20/solid";
import {
  Competition,
  H2HResult,
  H2HTotal,
  Manager,
  Match,
  PlayerSeasonSummary,
  Team,
  Transfer,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { ResultTable } from "./partials/ResultTable";
import { LinkButton } from "../forms/LinkButton";
import { BlogItem } from "@/lib/types";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SeasonReview(props: {
  results: Match[];
  h2hresults: H2HResult[];
  h2htotal: H2HTotal[];
  players: PlayerSeasonSummary[];
  competition?: string;
  manager?: string;
  venue?: string;
  opposition?: string;
  pens?: string;
  sort?: string;
  season: string;
  competitions: Competition[];
  managers: Manager[];
  teams: Team[];
  transfers: Transfer[];
  articles: BlogItem[];
}) {
  const seasonInt = parseInt(props.season);

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
                  className="h-12 w-12 text-indigo-600"
                />
                <h1>
                  <div className="text-sm leading-6 text-gray-500">
                    Season Summary
                  </div>
                  <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                    {props.season}
                  </div>
                </h1>
              </div>
              <div className="flex items-center gap-x-4 sm:gap-x-6">
                {seasonInt > 1920 ? (
                  <>
                    <ChevronLeftIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-indigo-600"
                    />
                    <a
                      href={`/season/${seasonInt - 1}`}
                      className="text-sm font-semibold leading-6 text-indigo-900 sm:block"
                    >
                      Previous Season
                    </a>
                  </>
                ) : (
                  ""
                )}

                {seasonInt < 2024 ? (
                  <>
                    <a
                      href={`/season/${seasonInt + 1}`}
                      className="text-sm font-semibold leading-6 text-indigo-900 sm:block"
                    >
                      Next Season
                    </a>
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-indigo-600"
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
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl px-2">
                  Player Data
                </h2>
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="thead-dark text-sm font-semibold">
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
                  <tbody className="divide-y divide-gray-200  text-sm">
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
                                ""
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
              <p>
                <a
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  href={`/player-records/${props.season}`}
                >
                  Full Player Records
                </a>
              </p>
            </div>

            {/* Invoice */}
            <div className="px-2 py-2 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-2 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2">
              <ResultTable
                title="Results"
                results={props.results}
                h2hresults={props.h2hresults}
                h2htotal={props.h2htotal}
              ></ResultTable>
            </div>

            <div className="lg:col-start-3">
              {/* Activity feed */}
              <h2 className="text-sm font-semibold leading-6 text-gray-900">
                Transfers
              </h2>
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
                      <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                        <span className="font-medium text-gray-900">
                          {transfer.name}
                        </span>{" "}
                        {transfer.type === "in" ? (
                          <>from {transfer.from}</>
                        ) : (
                          <>to {transfer.to}</>
                        )}
                      </p>
                      {transfer.value ? <>({transfer.value})</> : ""}
                    </>
                  </li>
                ))}
              </ul>

              <h2 className="text-sm font-semibold leading-6 text-gray-900">
                Articles
              </h2>
              {props.articles && props.articles.length > 0 ? (
                <div className=" border-gray-200 pt-8">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    Articles
                  </h2>
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
