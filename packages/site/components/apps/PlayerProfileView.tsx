"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";
import { BlogItem, PlayerProfile } from "@/lib/types";
import type { Comment } from "@/lib/comments";
import { PlayerStatsTable } from "@/components/apps/partials/PlayerStatsTable";
import { PlayerTransfersTable } from "@/components/apps/partials/PlayerTransfersTable";
import { PlayerAppsTable } from "@/components/apps/partials/PlayerAppTable";
import { BreadcrumbLinks } from "@/components/fragments/BreadcrumbLinks";
import { Reviews } from "@/components/comments/Reviews";
import CommentPanel from "@/components/comments/CommentPanel";
import { PlayerProfileCorrectionForm } from "./PlayerProfileCorrectionForm";
import type { EditablePlayerProfile } from "@/lib/playerProfileCorrections";
import type { Appearance } from "@tranmere-web/lib/src/tranmere-web-types";

const breadcrumbs = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "Players", href: "/players" },
];

function matchHref(appearance: { Season?: string; Date?: string }) {
  if (!/^\d{4}$/.test(appearance.Season ?? "")) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(appearance.Date ?? "")) return null;
  return `/match/${appearance.Season}/${appearance.Date}`;
}

function inlineMarkdown(value: string) {
  const parts = value.split(
    /(\[[^\]]+\]\(https?:\/\/[^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g,
  );
  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-blue-700 underline underline-offset-2"
        >
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part.replace(/\\([\\`*_[\]<>])/g, "$1");
  });
}

function MarkdownBiography({ value }: { value: string | null }) {
  if (!value) {
    return <p>No biography is currently available for this player.</p>;
  }

  return value.split(/\n{2,}/).map((block, index) => {
    const lines = block.split("\n");
    if (lines.every((line) => /^- /.test(line))) {
      return (
        <ul key={index}>
          {lines.map((line) => (
            <li key={line}>{inlineMarkdown(line.slice(2))}</li>
          ))}
        </ul>
      );
    }
    const heading = block.match(/^(#{1,6}) (.+)$/);
    if (heading) {
      return (
        <h3 key={index} className="font-display text-xl font-semibold">
          {inlineMarkdown(heading[2])}
        </h3>
      );
    }
    return <p key={index}>{inlineMarkdown(block)}</p>;
  });
}

export default function PlayerProfileView(props: {
  player: PlayerProfile;
  comments: Comment[];
  articles: BlogItem[];
  avg: number;
  biographyMarkdown: string | null;
  editableProfile: EditablePlayerProfile;
  appearancePagination: {
    total: number;
    pageSize: number;
    season: string;
    seasons: string[];
  };
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
  const [appearancePage, setAppearancePage] = useState(1);
  const [appearanceRecords, setAppearanceRecords] = useState<Appearance[]>(
    profile.appearances ?? [],
  );
  const [appearanceTotal, setAppearanceTotal] = useState(
    props.appearancePagination.total,
  );
  const [appearanceLoading, setAppearanceLoading] = useState(false);
  const [appearanceSeason, setAppearanceSeason] = useState(
    props.appearancePagination.season,
  );
  const appearancePages = Math.max(
    1,
    Math.ceil(appearanceTotal / props.appearancePagination.pageSize),
  );

  useEffect(() => {
    setAppearancePage(1);
    setAppearanceRecords(profile.appearances ?? []);
    setAppearanceTotal(props.appearancePagination.total);
    setAppearanceSeason(props.appearancePagination.season);
  }, [
    player.name,
    profile.appearances,
    props.appearancePagination.season,
    props.appearancePagination.total,
  ]);

  useEffect(() => {
    if (
      !appearanceSeason ||
      (appearancePage === 1 &&
        appearanceSeason === props.appearancePagination.season)
    ) {
      return;
    }

    const controller = new AbortController();
    setAppearanceLoading(true);
    void fetch(
      `/api/player-appearances?${new URLSearchParams({
        player: player.name,
        page: String(appearancePage),
        season: appearanceSeason,
      })}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load appearances");
        return response.json() as Promise<{
          records: Appearance[];
          total: number;
        }>;
      })
      .then(({ records, total }) => {
        setAppearanceRecords(records);
        setAppearanceTotal(total);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setAppearanceRecords([]);
        setAppearanceTotal(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) setAppearanceLoading(false);
      });

    return () => controller.abort();
  }, [
    appearancePage,
    appearanceSeason,
    player.name,
    props.appearancePagination.season,
  ]);
  const firstSeason = seasons.at(0)?.Season;
  const lastSeason = seasons.at(-1)?.Season;
  const careerSpan =
    firstSeason && lastSeason
      ? firstSeason === lastSeason
        ? firstSeason
        : `${firstSeason}–${lastSeason}`
      : "—";
  const latestAppearance = profile.appearances
    ?.filter(
      (appearance) =>
        /^\d{4}$/.test(appearance.Season) &&
        /^\d{4}-\d{2}-\d{2}$/.test(appearance.Date),
    )
    .sort((a, b) => b.Date.localeCompare(a.Date))[0];
  const debutHref = profile.debut ? matchHref(profile.debut) : null;
  const lastMatchHref = latestAppearance ? matchHref(latestAppearance) : null;
  const positionLabel =
    [player.position, player.secondaryPosition].filter(Boolean).join(" / ") ||
    "Tranmere Rovers";
  const selectedSeasonSummary = seasons.find(
    (season) => season.Season === appearanceSeason,
  );

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
              {careerSpan} · {positionLabel}
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
                  Apps
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
                <MarkdownBiography value={props.biographyMarkdown} />
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
                {props.appearancePagination.seasons.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-[#071a2b]/15 bg-[#fffdf8] p-4">
                    <label
                      htmlFor="appearance-season"
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/55"
                    >
                      Season
                    </label>
                    <select
                      id="appearance-season"
                      value={appearanceSeason}
                      onChange={(event) => {
                        setAppearanceSeason(event.target.value);
                        setAppearancePage(1);
                      }}
                      className="border border-[#071a2b]/20 bg-[#fffdf8] px-3 py-2 text-sm font-semibold text-[#071a2b] outline-none transition focus:border-blue-700"
                    >
                      {props.appearancePagination.seasons.map((season) => (
                        <option key={season} value={season}>
                          {season}/{String(Number(season) + 1).slice(-2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <PlayerAppsTable
                  records={appearanceRecords}
                  title="Appearances"
                  totalRecords={appearanceTotal}
                  summary={{
                    starts: selectedSeasonSummary?.starts ?? 0,
                    substituteAppearances: selectedSeasonSummary?.subs ?? 0,
                    goals: selectedSeasonSummary?.goals ?? 0,
                  }}
                  page={appearancePage}
                  totalPages={appearancePages}
                  pageSize={props.appearancePagination.pageSize}
                  loading={appearanceLoading}
                  onPageChange={setAppearancePage}
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
          <nav
            aria-label={`${player.name} career archive links`}
            className="border border-[#071a2b]/15 bg-[#fffdf8] p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Explore this career
            </p>
            <div className="mt-4 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-1">
              {firstSeason && (
                <Link
                  href={`/season/${firstSeason}`}
                  className="bg-[#fffdf8] px-4 py-3 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Seasons · {careerSpan}
                </Link>
              )}
              {latestAppearance && (
                <Link
                  href={`/match/${latestAppearance.Season}/${latestAppearance.Date}`}
                  className="bg-[#fffdf8] px-4 py-3 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Latest recorded match
                </Link>
              )}
              <Link
                href="/transfer-central"
                className="bg-[#fffdf8] px-4 py-3 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
              >
                Transfer archive
              </Link>
              <Link
                href="/managers"
                className="bg-[#fffdf8] px-4 py-3 text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
              >
                Managers during this era
              </Link>
            </div>
          </nav>

          <Link
            href={`/players/partnerships?player=${encodeURIComponent(player.name)}`}
            className="group flex items-center justify-between bg-[#071a2b] p-5 text-white transition hover:bg-blue-700"
          >
            <span>
              <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-blue-300">
                Partnership explorer
              </span>
              <span className="mt-2 block font-display text-xl font-semibold">
                Find who played alongside {player.name}
              </span>
            </span>
            <ArrowUpRightIcon className="h-5 w-5 transition group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>

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
              {player.secondaryPosition && (
                <div className="py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                    Secondary position
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {player.secondaryPosition}
                  </dd>
                </div>
              )}
              <div className="py-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                  Debut
                </dt>
                {profile.debut ? (
                  <>
                    <dd className="mt-1 font-semibold">
                      {debutHref ? (
                        <Link
                          href={debutHref}
                          className="text-blue-700 underline underline-offset-4"
                        >
                          {profile.debut.Opposition}
                        </Link>
                      ) : (
                        profile.debut.Opposition
                      )}
                    </dd>
                    <dd className="mt-1 font-mono text-xs text-[#071a2b]/55">
                      {debutHref ? (
                        <Link href={debutHref} className="hover:text-blue-700">
                          {profile.debut.Date}
                        </Link>
                      ) : (
                        profile.debut.Date
                      )}
                    </dd>
                  </>
                ) : (
                  <dd className="mt-1 text-sm text-[#071a2b]/55">
                    No first-team appearance recorded
                  </dd>
                )}
              </div>
              <div className="py-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                  Last match
                </dt>
                {latestAppearance ? (
                  <>
                    <dd className="mt-1 font-semibold">
                      {lastMatchHref ? (
                        <Link
                          href={lastMatchHref}
                          className="text-blue-700 underline underline-offset-4"
                        >
                          {latestAppearance.Opposition}
                        </Link>
                      ) : (
                        latestAppearance.Opposition
                      )}
                    </dd>
                    <dd className="mt-1 font-mono text-xs text-[#071a2b]/55">
                      {lastMatchHref ? (
                        <Link
                          href={lastMatchHref}
                          className="hover:text-blue-700"
                        >
                          {latestAppearance.Date}
                        </Link>
                      ) : (
                        latestAppearance.Date
                      )}
                    </dd>
                  </>
                ) : (
                  <dd className="mt-1 text-sm text-[#071a2b]/55">
                    No first-team appearance recorded
                  </dd>
                )}
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
              {player.foot && (
                <div className="py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                    Preferred foot
                  </dt>
                  <dd className="mt-1 font-semibold">{player.foot}</dd>
                </div>
              )}
              {player.height && (
                <div className="py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                    Height
                  </dt>
                  <dd className="mt-1 font-semibold">{player.height}</dd>
                </div>
              )}
            </dl>
          </div>

          <PlayerProfileCorrectionForm
            playerName={player.name}
            current={props.editableProfile}
          />

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
