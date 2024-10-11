"use client";

import { Fragment, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { MatchPageData } from "@/lib/types";
import { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { ResultTable } from "@/components/apps/partials/ResultTable";
import CommentPanel from "@/components/comments/CommentPanel";
import type { Comment } from "@/lib/comments";
import { Reviews } from "@/components/comments/Reviews";
import { LinkButton } from "@/components/forms/LinkButton";
import { BreadcrumbLinks } from "@/components/fragments/BreadcrumbLinks";
import { PencilSquareIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function MatchReport(props: {
  match: MatchPageData;
  next: Match[];
  previous: Match[];
  comments: Comment[];
  url: string;
  avg: number;
}) {
  const match = props.match;
  const next = props.next;
  const previous = props.previous;

  match.apps.sort((a, b) => {
    if (a.bio?.position === b.bio?.position) {
      return 0;
    } else if (a.bio?.position === "Goalkeeper") {
      return -1;
    } else if (b.bio?.position === "Goalkeeper") {
      return 1;
    } else if (a.bio?.position === "Full Back") {
      return -1;
    } else if (b.bio?.position === "Full Back") {
      return 1;
    } else if (a.bio?.position === "Central Defender") {
      return -1;
    } else if (b.bio?.position === "Central Defender") {
      return 1;
    } else if (a.bio?.position === "Central Midfielder") {
      return -1;
    } else if (b.bio?.position === "Central Midfielder") {
      return 1;
    } else if (a.bio?.position === "Winger") {
      return -1;
    } else if (b.bio?.position === "Winger") {
      return 1;
    } else if (a.bio?.position === "Striker") {
      return -1;
    } else if (b.bio?.position === "Striker") {
      return 1;
    } else {
      return 1;
    }
  });
  const breadcrumbs = [
    { id: 1, name: "Home", href: "/" },
    { id: 2, name: match.season, href: "/season/" + match.season },
  ];

  return (
    <div className="mx-auto px-4 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-16 lg:max-w-7xl lg:px-8 dark:text-gray-50 text-gray-500">
      <BreadcrumbLinks
        breadcrumbs={breadcrumbs}
        currentpage={match.date}
        currenthref={`/match/${match.season}/${match.date}`}
      />
      <div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16 mt-4">
        <div className="lg:col-span-4 lg:row-end-1">
          <div className="rounded-lg">
            {match.programme ? (
              <img
                alt="Match Programme"
                src={`https://images.tranmere-web.com/${match.programme}`}
              />
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
          <div className="flex flex-col-reverse">
            <div className="mt-4">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {match.homeTeam} {match.score} {match.awayTeam}
              </h1>

              <h2 id="information-heading" className="sr-only">
                Match information
              </h2>
              <p className="mt-2 text-sm">
                Venue: <strong>{match.venue}</strong>
              </p>
              {match.attendance ? (
                <p className="mt-2 text-sm">
                  Attendance: <strong>{match.attendance}</strong>
                </p>
              ) : (
                ""
              )}
              {match.referee ? (
                <p className="mt-2 text-sm">
                  Referee: <strong>{match.referee}</strong>
                </p>
              ) : (
                ""
              )}
            </div>

            <Reviews
              text={"Reviews"}
              avg={props.avg}
              count={props.comments.length}
            ></Reviews>
          </div>

          <p className="mt-6 dark:text-gray-50 text-gray-500">
            <span dangerouslySetInnerHTML={{ __html: match.report }} />
          </p>

          <div className="mt-10 border-t border-gray-200 pt-10">
            <h3 className="text-sm font-medium">Scorers</h3>
            <div className="prose prose-sm mt-4 dark:text-gray-50 text-gray-500">
              {match.formattedGoals}
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-10">
            <h3 className="text-sm font-medium">Rovers Team</h3>
            <p className="mt-4 text-sm">
              {match.apps!.map((p, idx) => (
                <span key={idx}>
                  <LinkButton
                    text={p.Name}
                    href={`/page/player/${p.Name}`}
                  ></LinkButton>
                  {p.SubbedBy ? (
                    <>
                      {" "}
                      (
                      <LinkButton
                        text={p.SubbedBy}
                        href={`/page/player/${p.SubbedBy}`}
                      ></LinkButton>{" "}
                      {p.SubTime}),{" "}
                    </>
                  ) : (
                    ", "
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
          <TabGroup>
            <div className="border-b border-gray-200">
              <TabList className="-mb-px flex space-x-8">
                <Tab className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-mediumhover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600">
                  Comments & Ratings
                </Tab>
                {match.apps && match.apps.length > 0 ? (
                  <Tab className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium hover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600">
                    Team
                  </Tab>
                ) : (
                  ""
                )}
              </TabList>
            </div>
            <TabPanels as={Fragment}>
              <TabPanel className="-mb-10">
                <CommentPanel
                  comments={props.comments}
                  url={props.url}
                ></CommentPanel>
              </TabPanel>

              <TabPanel className="">
                <div className="mt-6">
                  <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Starting 11
                      </h2>
                    </div>
                    <ul
                      role="list"
                      className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-3 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-3"
                    >
                      {match.apps.map((player) => (
                        <li key={player.Name}>
                          <img
                            alt=""
                            src={player.bio!.picLink}
                            className="mx-auto h-24 w-24 rounded-full"
                          />
                          <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight">
                            {player.Name}
                          </h3>
                          {player.YellowCard ? (
                            <PencilSquareIcon
                              aria-hidden="true"
                              className="h-6 w-6 mx-auto text-yellow-400"
                            />
                          ) : (
                            ""
                          )}
                          {player.RedCard ? (
                            <PencilSquareIcon
                              aria-hidden="true"
                              className="h-6 w-6 mx-auto text-red-400"
                            />
                          ) : (
                            ""
                          )}
                          {player.SubbedBy ? (
                            <ArrowPathIcon
                              aria-hidden="true"
                              className="h-6 w-6 mx-auto"
                            />
                          ) : (
                            ""
                          )}
                          <p className="text-sm leading-6">
                            {player.bio?.position}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      <div className="mx-auto max-w-2xl lg:max-w-none">
        {previous && previous.length > 0 ? (
          <>
            <div id="previous-five-content">
              <ResultTable
                title="Previous 5 Matches"
                results={previous}
              ></ResultTable>
            </div>
          </>
        ) : (
          ""
        )}
      </div>

      <div className="mx-auto max-w-2xl lg:max-w-none">
        {next && next.length > 0 ? (
          <>
            <div id="previous-five-content">
              <ResultTable title="Next 5 Matches" results={next}></ResultTable>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
