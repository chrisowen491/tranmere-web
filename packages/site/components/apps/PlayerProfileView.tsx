"use client";

import { Fragment } from "react";
import { PlayerProfile } from "@/lib/types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";
import type { Comment } from "@/lib/comments";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { PlayerStatsTable } from "@/components/apps//partials/PlayerStatsTable";
import { PlayerTransfersTable } from "@/components/apps/partials/PlayerTransfersTable";
import { PlayerAppsTable } from "@/components/apps/partials/PlayerAppTable";
import { LinkButton } from "@/components/forms/LinkButton";
import { BreadcrumbLinks } from "@/components/fragments/BreadcrumbLinks";
import { Reviews } from "@/components/comments/Reviews";
import CommentPanel from "@/components/comments/CommentPanel";

const breadcrumbs = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "Players", href: "/playersearch" },
];

export default function PlayerProfileView(props: {
  player: PlayerProfile;
  comments: Comment[];
  avg: number;
}) {
  const player = props.player;
  const comments = props.comments;

  return (
    <div>
      <div className="pt-6 dark:text-gray-50 text-gray-500">
        <BreadcrumbLinks
          breadcrumbs={breadcrumbs}
          currentpage={player.player.name}
          currenthref={`/page/player/${player.player.name}`}
        />
        <div className="mx-auto px-4 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-16 lg:max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
            {/* Image gallery */}
            <div className="lg:col-span-4 lg:row-end-1">
              <h2 className="sr-only">Images</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
                <img
                  alt={player.player.name}
                  src={player.player.picLink}
                  className={"lg:col-span-2 lg:row-span-2"}
                />
              </div>
            </div>

            <div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
              <div className="flex justify-between">
                <h1 className="text-xl font-medium text-gray-900 dark:text-gray-50">
                  {player.player.name}
                </h1>
              </div>

              <Reviews
                text={"Reviews"}
                avg={props.avg}
                count={props.comments.length}
              ></Reviews>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Primary Position
                </h2>
                <p>{player.player.position}</p>
              </div>

              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Description
                </h2>

                <div className="prose prose-sm mt-4 dark:text-gray-50">
                  {documentToReactComponents(
                    player.player.biography as unknown as Document,
                  )}
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Debut
                </h2>
                <p>
                  {player.debut.Opposition} ({player.debut.Date})
                </p>
              </div>

              {player.player.dateOfBirth ? (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    Born
                  </h2>
                  <p>
                    {player.player.dateOfBirth} ({player.player.placeOfBirth})
                  </p>
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
              <TabGroup>
                <div className="border-b border-gray-200">
                  <TabList className="-mb-px flex space-x-8">
                    <Tab className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium hover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600">
                      Stats
                    </Tab>
                    <Tab className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium hover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600">
                      Transfers
                    </Tab>
                    <Tab className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium hover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600">
                      Links
                    </Tab>
                    <Tab className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium hover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600">
                      Apps
                    </Tab>
                    <Tab className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium hover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600">
                      Ratings
                    </Tab>
                  </TabList>
                </div>
                <TabPanels as={Fragment}>
                  <TabPanel className="">
                    <PlayerStatsTable
                      records={player.seasons}
                      title="Player Stats"
                    ></PlayerStatsTable>
                  </TabPanel>

                  <TabPanel className="">
                    <PlayerTransfersTable
                      records={player.transfers}
                      title="Transfers"
                    ></PlayerTransfersTable>
                  </TabPanel>

                  <TabPanel className="text-sm text-gray-500">
                    <h3 className="sr-only">Links</h3>

                    <dl>
                      {player.links.map((link, idx) => (
                        <Fragment key={idx}>
                          <dd className="prose prose-sm mt-2 max-w-none text-gray-500">
                            <p>
                              <LinkButton
                                text={link.description}
                                href={link.link}
                              ></LinkButton>
                            </p>
                          </dd>
                        </Fragment>
                      ))}
                    </dl>
                  </TabPanel>

                  <TabPanel className="">
                    <PlayerAppsTable
                      records={player.appearances}
                      title="Apps"
                    ></PlayerAppsTable>
                  </TabPanel>

                  <TabPanel className="">
                    <CommentPanel
                      comments={comments}
                      url={`/page/player/${player.player.name}`}
                    ></CommentPanel>
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
