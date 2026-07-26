"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";
import { BlogItem, PlayerProfile } from "@/lib/types";
import type { Comment } from "@/lib/comments";
import { PlayerStatsTable } from "@/components/apps/partials/PlayerStatsTable";
import { PlayerTransfersTable } from "@/components/apps/partials/PlayerTransfersTable";
import { PlayerAppsTable } from "@/components/apps/partials/PlayerAppTable";
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
  articles: BlogItem[];
  avg: number;
}) {
  const profile = props.player;
  const { player } = profile;
  const seasons = profile.seasons
    .filter((season) => /^\d{4}$/.test(season.Season))
    .sort((a, b) => Number(a.Season) - Number(b.Season));
  const totalStarts = seasons.reduce(
    (total, season) => total + season.starts,
    0,
  );
  const totalSubs = seasons.reduce((total, season) => total + season.subs, 0);
  const totalGoals = seasons.reduce((total, season) => total + season.goals, 0);
  const firstSeason = seasons.at(0)?.Season;
  const lastSeason = seasons.at(-1)?.Season;
  const careerSpan =
    firstSeason && lastSeason
      ? firstSeason === lastSeason
        ? firstSeason
        : `${firstSeason}–${lastSeason}`
      : "—";

  const profileLinks = [
    {
      description: "Transfermarkt",
      link: `https://www.transfermarkt.co.uk/schnellsuche/ergebnis/schnellsuche?query=${player.name}`,
    },
    ...profile.links,
  ];

  return (
    <main className="pb-24 text-[#071a2b]">
      <div className="border-b border-[#071a2b]/10 pt-6">
        <BreadcrumbLinks
          breadcrumbs={breadcrumbs}
          currentpage={player.name}
          currenthref={`/page/player/${player.name}`}
        />

        <section className="mx-auto grid max-w-7xl gap-0 px-6 pb-14 pt-8 sm:px-10 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)] lg:px-12 lg:pt-12">
          <div className="relative min-h-[420px] overflow-hidden bg-[#132c82] sm:min-h-[520px]">
            <div
              aria-hidden="true"
              className="absolute inset-5 border border-white/20"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full border border-white/15"
            />
            {player.picLink && (
              <Image
                alt={player.name}
                width={720}
                height={720}
                unoptimized
                priority
                src={player.picLink}
                className="absolute inset-0 h-full w-full object-contain object-bottom p-8 pb-0 sm:p-12 sm:pb-0"
              />
            )}
            <p className="absolute left-5 top-5 bg-[#071a2b] px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white">
              Player archive
            </p>
          </div>

          <div className="flex flex-col justify-center border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-10 lg:border-l-0 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {careerSpan} · {player.position || "Tranmere Rovers"}
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              {player.name}
            </h1>

            <div className="mt-6">
              <Reviews
                text="Supporter rating"
                avg={props.avg}
                count={props.comments.length}
              />
            </div>

            <dl className="mt-8 grid grid-cols-3 border-y border-[#071a2b]/15">
              <div className="py-5 pr-3">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
                  Appearances
                </dt>
                <dd className="mt-2 font-mono text-3xl font-bold">
                  {totalStarts + totalSubs}
                </dd>
                <p className="mt-1 text-xs text-[#071a2b]/50">
                  {totalSubs} as substitute
                </p>
              </div>
              <div className="border-x border-[#071a2b]/15 px-4 py-5">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
                  Goals
                </dt>
                <dd className="mt-2 font-mono text-3xl font-bold">
                  {totalGoals}
                </dd>
              </div>
              <div className="py-5 pl-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
                  Seasons
                </dt>
                <dd className="mt-2 font-mono text-3xl font-bold">
                  {seasons.length}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/55">
                Tranmere story
              </p>
              <div className="prose prose-sm mt-3 max-w-none leading-7 text-[#071a2b]/75">
                {documentToReactComponents(
                  player.biography as unknown as Document,
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-12">
        <div className="min-w-0">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Career record
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Rovers by the numbers
            </h2>
          </div>

          <TabGroup>
            <TabList className="flex gap-1 overflow-x-auto border-b border-[#071a2b]/15">
              {["Stats", "Transfers", "Apps", "Ratings"].map((tab) => (
                <Tab
                  key={tab}
                  className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 text-sm font-bold text-[#071a2b]/55 outline-none transition hover:text-[#071a2b] data-[selected]:border-blue-700 data-[selected]:text-blue-700"
                >
                  {tab}
                </Tab>
              ))}
            </TabList>
            <TabPanels as={Fragment}>
              <TabPanel>
                <PlayerStatsTable records={seasons} title="Season by season" />
              </TabPanel>
              <TabPanel>
                <PlayerTransfersTable
                  records={profile.transfers}
                  title="Transfers"
                />
              </TabPanel>
              <TabPanel>
                <PlayerAppsTable
                  records={profile.appearances!}
                  title="Appearances"
                />
              </TabPanel>
              <TabPanel>
                <CommentPanel
                  comments={props.comments}
                  url={`/page/player/${player.name}`}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>

        <aside className="space-y-6">
          <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Profile
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Career details
            </h2>
            <dl className="mt-5 divide-y divide-[#071a2b]/10">
              <div className="py-4 first:pt-0">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                  Primary position
                </dt>
                <dd className="mt-1 font-semibold">{player.position || "—"}</dd>
              </div>
              <div className="py-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                  Debut
                </dt>
                <dd className="mt-1 font-semibold">
                  {profile.debut.Opposition}
                </dd>
                <dd className="mt-1 font-mono text-xs text-[#071a2b]/55">
                  {profile.debut.Date}
                </dd>
              </div>
              {player.dateOfBirth && (
                <div className="py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                    Born
                  </dt>
                  <dd className="mt-1 font-semibold">{player.dateOfBirth}</dd>
                  {player.placeOfBirth && (
                    <dd className="mt-1 text-sm text-[#071a2b]/60">
                      {player.placeOfBirth}
                    </dd>
                  )}
                </div>
              )}
            </dl>
          </div>

          {props.articles.length > 0 && (
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                From the archive
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Stories
              </h2>
              <div className="mt-4 divide-y divide-[#071a2b]/10">
                {props.articles.map((article) => (
                  <article key={article.sys.id} className="py-4 first:pt-0">
                    <time
                      dateTime={article.datePosted}
                      className="font-mono text-xs text-[#071a2b]/45"
                    >
                      {new Date(article.datePosted).toDateString()}
                    </time>
                    <h3 className="mt-2 font-display text-lg font-semibold">
                      <Link
                        href={`/page/blog/${article.slug}`}
                        className="hover:text-blue-700"
                      >
                        {article.title}
                      </Link>
                    </h3>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-[#071a2b]/15 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/55">
              External links
            </p>
            <div className="mt-3 space-y-2">
              {profileLinks.map((link, index) => (
                <a
                  key={`${link.link}-${index}`}
                  href={link.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border-b border-[#071a2b]/10 py-2 text-sm font-semibold hover:text-blue-700"
                >
                  {link.description}
                  <ArrowUpRightIcon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
