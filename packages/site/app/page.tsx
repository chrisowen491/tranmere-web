import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  TrophyIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { GetOnThisDay, GetYear } from "@tranmere-web/lib/src/apiFunctions";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { getGameBySeasonAndDate, getLatestPlayedGame } from "@/lib/games";
import { getAllArticles, getAllShirts } from "@/lib/api";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getPlayerCardOptions, type PlayerCardOption } from "@/lib/players";

export const revalidate = 7200;

const defaultPlayerImageSignature =
  "simple/cccccc/none/cccccc/cccccc/none/cccccc";
const defaultArticleImage =
  "https://images.ctfassets.net/pz711f8blqyy/4xiJsea65ajh0swqmdEbOF/a2fc207703c03245cd64a8c01b857e28/2021.svg";

export const metadata: Metadata = {
  title: "The independent Tranmere Rovers archive",
  description:
    "Explore a century of Tranmere Rovers results, players, shirts, stories and statistics.",
  alternates: { canonical: "/" },
};

const archiveLinks = [
  {
    label: "Match archive",
    detail: "Every first-team result since 1921",
    href: "/results",
    icon: CalendarDaysIcon,
  },
  {
    label: "Player index",
    detail: "Profiles, appearances and goals",
    href: "/players",
    icon: UserGroupIcon,
  },
  {
    label: "Shirt archive",
    detail: "Home, away and goalkeeper kits",
    href: "/shirts",
    icon: TrophyIcon,
  },
  {
    label: "Season records",
    detail: "Squads, results and season summaries",
    href: `/season/${GetYear()}`,
    icon: ChartBarSquareIcon,
  },
];

const exploreLinks = [
  {
    label: "Transfer Central",
    detail: "Arrivals, departures and fees",
    href: "/transfer-central",
    icon: ArrowTrendingUpIcon,
  },
  {
    label: "Managers",
    detail: "Every spell in the dugout",
    href: "/managers",
    icon: UserGroupIcon,
  },
  {
    label: "Manager comparison",
    detail: "Put two tenures head to head",
    href: "/managers/comparison",
    icon: ChartBarSquareIcon,
  },
  {
    label: "Trusted XI",
    detail: "Each manager’s most-used team",
    href: "/managers/trusted-xi",
    icon: UserGroupIcon,
  },
  {
    label: "Head-to-head",
    detail: "Every opponent and meeting",
    href: "/head-to-head",
    icon: ArrowsRightLeftIcon,
  },
  {
    label: "Rovers connections",
    detail: "Clubs linked by players and matches",
    href: "/rovers-connections",
    icon: ArrowsRightLeftIcon,
  },
  {
    label: "Player search",
    detail: "Find any player in the archive",
    href: "/players",
    icon: MagnifyingGlassIcon,
  },
  {
    label: "Player partnerships",
    detail: "Discover who played together",
    href: "/players/partnerships",
    icon: UserGroupIcon,
  },
];

function PromoPlayer({ player }: { player: PlayerCardOption }) {
  return (
    <div className="flex w-20 flex-col items-center text-center">
      <div className="h-16 w-16 overflow-hidden rounded-full border border-white/45 bg-[#f4f0e8]">
        <Image
          src={player.picLink!}
          alt=""
          width={80}
          height={80}
          unoptimized
          className="h-full w-full object-cover"
        />
      </div>
      <span className="mt-2 max-w-full truncate text-[10px] font-bold">
        {player.name}
      </span>
    </div>
  );
}

function matchOutcome(match: Match) {
  const roversGoals = match.location === "H" ? match.hgoal : match.vgoal;
  const oppositionGoals = match.location === "H" ? match.vgoal : match.hgoal;
  return roversGoals > oppositionGoals
    ? "W"
    : roversGoals < oppositionGoals
      ? "L"
      : "D";
}

function matchVenueLabel(match: Match) {
  return match.location === "H"
    ? "Home"
    : match.location === "N"
      ? "Neutral"
      : "Away";
}

export default async function Home() {
  const env = (await getCloudflareContext({ async: true })).env;
  const now = new Date();
  const dayOfYear = Math.floor(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      Date.UTC(now.getUTCFullYear(), 0, 0)) /
      86400000,
  );
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  }).format(now);
  const today = now.toISOString().slice(0, 10);

  const [players, onThisDay, shirts, articles, latestMatch] = await Promise.all(
    [
      getPlayerCardOptions(env.DB),
      GetOnThisDay(env.DB),
      getAllShirts(),
      getAllArticles(4),
      getLatestPlayedGame(env.DB, today),
    ],
  );

  const playersWithImages = players.filter(
    (player) =>
      player.picLink &&
      !player.picLink.toLowerCase().includes(defaultPlayerImageSignature),
  );
  const playerOfTheDay =
    playersWithImages[dayOfYear % playersWithImages.length];
  const shirtOfTheDay = shirts[dayOfYear % shirts.length];
  const fantasyPreviewPlayers = Array.from({ length: 5 }, (_, index) => {
    return playersWithImages[
      (dayOfYear + index * 37) % playersWithImages.length
    ];
  });

  let featuredMatch: Match | null = null;
  if (onThisDay) {
    featuredMatch = await getGameBySeasonAndDate(
      env.DB,
      onThisDay.season,
      onThisDay.date,
    );
  }
  const featuredHomeTeam = featuredMatch?.home ?? "";
  const featuredAwayTeam = featuredMatch?.visitor ?? "";
  const featuredScore = featuredMatch
    ? (featuredMatch.ft ?? `${featuredMatch.hgoal}-${featuredMatch.vgoal}`)
    : "";

  const matchHref = onThisDay
    ? `/match/${onThisDay.season}/${onThisDay.date}`
    : "/results";
  const heroMediaHref = featuredMatch
    ? matchHref
    : `/page/player/${playerOfTheDay.name}`;
  const matchProgramme = onThisDay?.programme
    ? `https://img.tranmere-web.com/${onThisDay.programme}`
    : null;
  const latestMatchHref = latestMatch
    ? `/match/${latestMatch.season}/${latestMatch.date}`
    : "/results";
  const latestOutcome = latestMatch ? matchOutcome(latestMatch) : null;
  const latestOutcomeClasses =
    latestOutcome === "W"
      ? "border-l-emerald-500 bg-emerald-600 hover:bg-emerald-700"
      : latestOutcome === "L"
        ? "border-l-rose-500 bg-rose-600 hover:bg-rose-700"
        : "border-l-amber-400 bg-amber-500 hover:bg-amber-600";

  return (
    <main className="bg-[#f4f0e8] text-[#071a2b]">
      <section className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto grid min-h-[680px] max-w-7xl lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-between px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              <span className="h-px w-10 bg-blue-400" />
              <span>
                On this day · {dateLabel}
                {featuredMatch
                  ? ` · ${featuredHomeTeam} ${featuredScore} ${featuredAwayTeam}`
                  : ""}
              </span>
            </div>

            <div className="max-w-3xl py-16 lg:py-20">
              {featuredMatch ? (
                <>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
                    {featuredMatch.season}/
                    {String(featuredMatch.season + 1).slice(-2)} ·{" "}
                    {featuredMatch.competition}
                  </p>
                  <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                    {featuredHomeTeam}
                    <span className="my-4 block font-mono text-blue-400">
                      {featuredScore}
                    </span>
                    {featuredAwayTeam}
                  </h1>
                  <p className="mt-7 max-w-xl text-lg leading-8 text-white/65">
                    A match from this date in Rovers history
                    {featuredMatch.venue
                      ? `, played at ${featuredMatch.venue}`
                      : ""}
                    {featuredMatch.attendance
                      ? ` in front of ${featuredMatch.attendance.toLocaleString()} supporters`
                      : ""}
                    .
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
                    Today in the archive
                  </p>
                  <h1 className="mt-6 font-display text-6xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl">
                    A daily window into Rovers history.
                  </h1>
                  <p className="mt-7 max-w-xl text-lg leading-8 text-white/65">
                    No match is recorded for {dateLabel}, so today’s edition
                    explores a player, shirt and story from elsewhere in the
                    collection.
                  </p>
                </>
              )}

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={matchHref}
                  className="group inline-flex items-center gap-3 bg-[#f4f0e8] px-6 py-3.5 text-sm font-bold text-[#071a2b] transition hover:bg-blue-300"
                >
                  {featuredMatch
                    ? "Open match report"
                    : "Explore match history"}
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/results"
                  className="inline-flex items-center border border-white/25 px-6 py-3.5 text-sm font-bold transition hover:border-white hover:bg-white/10"
                >
                  Browse every result
                </Link>
              </div>
            </div>

            <div className="grid max-w-2xl grid-cols-3 border-t border-white/15 pt-6">
              <div>
                <strong className="block text-2xl">1921</strong>
                <span className="text-xs uppercase tracking-wider text-white/45">
                  Records begin
                </span>
              </div>
              <div>
                <strong className="block text-2xl">5,000+</strong>
                <span className="text-xs uppercase tracking-wider text-white/45">
                  Match results
                </span>
              </div>
              <div>
                <strong className="block text-2xl">Daily</strong>
                <span className="text-xs uppercase tracking-wider text-white/45">
                  Archive edition
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden border-l border-white/15 lg:block">
            <div className="absolute inset-x-0 top-0 flex justify-between border-b border-white/15 p-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>Today’s archive object</span>
              <span>{featuredMatch?.date ?? dateLabel}</span>
            </div>
            <div className="absolute inset-10 bottom-0 top-20 grid place-items-center overflow-hidden">
              <span className="absolute right-0 top-12 font-display text-[10rem] font-semibold leading-none text-white/[0.035]">
                {featuredMatch?.season ?? "1884"}
              </span>
              <Link
                href={heroMediaHref}
                className="relative z-10 h-full w-full"
              >
                {matchProgramme ? (
                  <Image
                    src={matchProgramme}
                    alt={`${featuredHomeTeam} v ${featuredAwayTeam} programme`}
                    width={640}
                    height={860}
                    priority
                    className="mx-auto h-full max-h-[560px] w-full object-contain p-8"
                  />
                ) : (
                  <Image
                    src={playerOfTheDay.picLink!}
                    alt={playerOfTheDay.name}
                    width={640}
                    height={640}
                    priority
                    unoptimized
                    className="absolute bottom-0 left-1/2 w-[145%] max-w-none -translate-x-1/2 object-contain"
                  />
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {latestMatch && (
        <section className="border-b border-[#071a2b]/15 bg-[#fffdf8]">
          <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
            <div className="grid overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6] shadow-[5px_5px_0_rgba(7,26,43,0.08)] lg:grid-cols-[0.72fr_1.28fr_auto]">
              <div className="border-b border-[#071a2b]/15 p-5 lg:border-b-0 lg:border-r lg:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Latest result
                </p>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-[#071a2b]/50">
                  {new Date(`${latestMatch.date}T12:00:00Z`).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                  <span className="bg-[#fffdf8] px-2 py-1">
                    {matchVenueLabel(latestMatch)}
                  </span>
                  <span className="border border-[#071a2b]/15 px-2 py-1 text-[#071a2b]/55">
                    {latestMatch.competition}
                  </span>
                </div>
              </div>

              <div className="grid items-center gap-4 p-5 sm:grid-cols-[1fr_auto_1fr] lg:p-6">
                <p className="font-display text-2xl font-semibold tracking-[-0.025em] sm:text-right sm:text-3xl">
                  {latestMatch.home}
                </p>
                <Link
                  href={latestMatchHref}
                  aria-label={`Open match report for ${latestMatch.home} ${latestMatch.ft} ${latestMatch.visitor}`}
                  className={`inline-flex min-w-28 items-center justify-center border-l-4 px-5 py-3 font-mono text-2xl font-bold text-white transition ${latestOutcomeClasses}`}
                >
                  {latestMatch.ft}
                </Link>
                <p className="font-display text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                  {latestMatch.visitor}
                </p>
              </div>

              <Link
                href={latestMatchHref}
                className="group flex items-center justify-between gap-5 border-t border-[#071a2b]/15 bg-[#071a2b] px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700 lg:min-w-56 lg:border-l lg:border-t-0 lg:px-6"
              >
                Read match report
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-[#071a2b]/15">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="section-kicker">Today’s edition</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Three ways into the archive.
              </h2>
            </div>
            <p className="font-mono text-xs text-[#071a2b]/45">
              New selection every day
            </p>
          </div>

          <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 lg:grid-cols-3">
            <Link
              href={`/page/player/${playerOfTheDay.name}`}
              className="group flex min-h-[430px] flex-col bg-[#fffdf8] p-5"
            >
              <div className="relative flex-1 overflow-hidden bg-[#132c82]">
                <span className="absolute left-3 top-3 z-10 bg-[#071a2b] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  Player of the day
                </span>
                <Image
                  src={playerOfTheDay.picLink!}
                  alt={playerOfTheDay.name}
                  width={520}
                  height={520}
                  unoptimized
                  className="absolute inset-0 h-full w-full object-contain object-bottom transition duration-300 group-hover:scale-[1.025]"
                />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">
                {playerOfTheDay.name}
              </h3>
              <p className="mt-2 text-sm font-bold text-blue-700">
                Open player profile →
              </p>
            </Link>

            <Link
              href={`/shirts/${shirtOfTheDay.slug}`}
              className="group flex min-h-[430px] flex-col bg-[#fffdf8] p-5"
            >
              <div className="relative flex-1 overflow-hidden bg-[#e8e2d6]">
                <span className="absolute left-3 top-3 z-10 bg-[#071a2b] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  Shirt of the day
                </span>
                <Image
                  src={shirtOfTheDay.imagesCollection.items[0].url}
                  alt={shirtOfTheDay.name}
                  width={720}
                  height={720}
                  className="absolute inset-0 h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.025]"
                />
              </div>
              <p className="mt-5 font-mono text-xs text-blue-700">
                {shirtOfTheDay.seasons.join(" · ")}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold">
                {shirtOfTheDay.name}
              </h3>
            </Link>

            {articles[0] && (
              <Link
                href={`/page/blog/${articles[0].slug}`}
                className="group flex min-h-[430px] flex-col bg-[#fffdf8] p-5"
              >
                <div className="relative flex-1 overflow-hidden bg-[#e8e2d6]">
                  <span className="absolute left-3 top-3 z-10 bg-[#071a2b] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    From the archive
                  </span>
                  <Image
                    src={articles[0].pic?.url ?? defaultArticleImage}
                    alt={articles[0].title}
                    width={720}
                    height={520}
                    unoptimized
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
                  />
                </div>
                <p className="mt-5 font-mono text-xs text-blue-700">
                  {new Date(articles[0].datePosted).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">
                  {articles[0].title}
                </h3>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <div className="mb-9">
            <p className="section-kicker">Make it yours</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Don’t just browse Rovers history. Build with it.
            </h2>
          </div>

          <Link
            href="/who-am-i"
            className="group mb-6 grid overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8] sm:grid-cols-[0.7fr_1.3fr]"
          >
            <div className="relative grid min-h-64 place-items-center overflow-hidden bg-emerald-700 text-white">
              <div className="archive-grid absolute inset-0 opacity-40" />
              <QuestionMarkCircleIcon className="relative h-28 w-28 transition duration-300 group-hover:rotate-6 group-hover:scale-105" />
              <span className="absolute bottom-5 left-5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-white/65">
                One player · Five clues
              </span>
            </div>
            <div className="flex flex-col justify-between p-7 sm:p-9">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Daily game
                </p>
                <h3 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em]">
                  Who am I?
                </h3>
                <p className="mt-4 max-w-xl leading-7 text-[#071a2b]/60">
                  Identify today’s Rovers player from their position, career
                  record and debut. Every wrong answer unlocks another clue.
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-3 text-sm font-bold text-emerald-700">
                Play today’s game
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <div className="grid gap-6 lg:grid-cols-2">
            <Link
              href="/fantasy-team"
              className="group grid min-h-[540px] overflow-hidden border border-[#071a2b]/15 bg-[#071a2b] text-white sm:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="flex flex-col justify-between p-7 sm:p-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                    Fantasy XI
                  </p>
                  <h3 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em]">
                    Pick your all-time Rovers side.
                  </h3>
                  <p className="mt-5 leading-7 text-white/60">
                    Choose a formation, search the complete player archive and
                    name your captain.
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center gap-3 text-sm font-bold text-blue-200">
                  Build your Fantasy XI
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>

              <div className="relative min-h-[420px] overflow-hidden border-t border-white/15 bg-blue-900 sm:min-h-0 sm:border-l sm:border-t-0">
                <div className="pointer-events-none absolute inset-5 border border-white/25" />
                <div className="pointer-events-none absolute inset-x-5 top-1/2 border-t border-white/25" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
                <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-around py-8">
                  <div className="flex justify-center">
                    <PromoPlayer player={fantasyPreviewPlayers[0]} />
                  </div>
                  <div className="flex justify-around">
                    <PromoPlayer player={fantasyPreviewPlayers[1]} />
                    <PromoPlayer player={fantasyPreviewPlayers[2]} />
                  </div>
                  <div className="flex justify-around">
                    <PromoPlayer player={fantasyPreviewPlayers[3]} />
                    <PromoPlayer player={fantasyPreviewPlayers[4]} />
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/players/avatar-builder"
              className="group grid min-h-[540px] overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8] sm:grid-cols-[1.05fr_0.95fr]"
            >
              <div className="relative min-h-[400px] overflow-hidden bg-[#132c82] sm:min-h-0">
                <div className="absolute inset-5 border border-white/20" />
                <div className="absolute inset-x-7 bottom-0 top-10 overflow-hidden">
                  <Image
                    src={playerOfTheDay.picLink!}
                    alt=""
                    width={520}
                    height={520}
                    unoptimized
                    className="absolute bottom-0 left-1/2 w-[145%] max-w-none -translate-x-1/2 object-contain transition duration-300 group-hover:scale-[1.025]"
                  />
                </div>
                <div className="absolute bottom-5 left-5 right-5 grid grid-cols-4 gap-1">
                  {["#071a2b", "#1557ff", "#f4f0e8", "#d8a36b"].map(
                    (colour) => (
                      <span
                        key={colour}
                        className="h-2 border border-white/20"
                        style={{ backgroundColor: colour }}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between p-7 sm:p-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    Avatar builder
                  </p>
                  <h3 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em]">
                    Create your own Rovers icon.
                  </h3>
                  <p className="mt-5 leading-7 text-[#071a2b]/60">
                    Mix classic kits, hair, colours and features to create an
                    archive-style player portrait.
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center gap-3 text-sm font-bold text-blue-700">
                  Launch the avatar builder
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>

          <Link
            href="/profile/programmes"
            className="group mt-6 grid overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8] md:grid-cols-[0.72fr_1.28fr]"
          >
            <div className="relative min-h-72 overflow-hidden bg-[#132c82] p-7 text-white sm:p-9">
              <div className="archive-grid absolute inset-0 opacity-30" />
              <div className="relative flex h-full flex-col justify-between">
                <ClipboardDocumentCheckIcon className="h-20 w-20 text-blue-200 transition duration-300 group-hover:scale-105" />
                <div className="mt-12 grid gap-px border border-white/20 bg-white/20">
                  {[
                    "In the collection",
                    "Still wanted",
                    "Available to trade",
                  ].map((label, index) => (
                    <div
                      key={label}
                      className="flex items-center justify-between bg-[#071a2b] px-4 py-3"
                    >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">
                        {label}
                      </span>
                      <span className="font-mono text-sm font-bold text-blue-200">
                        {index === 0 ? "✓" : "○"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Programme checklist
                </p>
                <h3 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
                  Keep track of your Rovers programme collection.
                </h3>
                <p className="mt-5 max-w-2xl leading-7 text-[#071a2b]/60">
                  Mark programmes you own, build a wanted list and record the
                  editions you have available to trade. You can keep it private
                  or share an anonymous public checklist with other collectors.
                </p>
              </div>
              <span className="mt-9 inline-flex items-center gap-3 text-sm font-bold text-blue-700">
                Open your programme checklist
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <Link
            href="/profile/passport"
            className="group mt-6 grid overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8] md:grid-cols-[1.28fr_0.72fr]"
          >
            <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Your Rovers passport
                </p>
                <h3 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
                  Turn the matches you attended into your own archive.
                </h3>
                <p className="mt-5 max-w-2xl leading-7 text-[#071a2b]/60">
                  Mark any Rovers match you witnessed and build a private record
                  of your seasons, grounds and results. Unlock your first match,
                  50th game and most-visited away ground.
                </p>
              </div>
              <span className="mt-9 inline-flex items-center gap-3 text-sm font-bold text-blue-700">
                Open your Rovers passport
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
            <div className="relative min-h-72 overflow-hidden bg-[#071a2b] p-7 text-white sm:p-9">
              <div className="archive-grid absolute inset-0 opacity-30" />
              <div className="relative flex h-full flex-col justify-between">
                <TicketIcon className="h-20 w-20 text-blue-200 transition duration-300 group-hover:-rotate-3 group-hover:scale-105" />
                <div className="mt-12 grid grid-cols-3 gap-px border border-white/20 bg-white/20">
                  {[
                    ["First match", "01"],
                    ["Matches", "50"],
                    ["Away days", "12"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#071a2b] px-3 py-4">
                      <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">
                        {label}
                      </span>
                      <span className="mt-2 block font-mono text-xl font-bold text-blue-200">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section
        id="explore-archive"
        className="border-b border-[#071a2b]/15 bg-[#f4f0e8]"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-8">
            <div>
              <p className="section-kicker">Explore the archive</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em]">
                Follow your own path.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#071a2b]/55">
              Move through the archive by people, clubs, transfers or the
              stories hidden between them.
            </p>
          </div>

          <nav
            aria-label="Archive tools"
            className="mt-8 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4"
          >
            {exploreLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex min-h-28 items-start gap-4 bg-[#fffdf8] p-4 transition hover:bg-[#071a2b] hover:text-white"
              >
                <item.icon className="mt-0.5 h-5 w-5 flex-none text-blue-700 group-hover:text-blue-300" />
                <span className="min-w-0">
                  <strong className="block font-display text-lg font-semibold">
                    {item.label}
                  </strong>
                  <span className="mt-1.5 block text-xs leading-5 text-[#071a2b]/50 group-hover:text-white/55">
                    {item.detail}
                  </span>
                </span>
                <ArrowRightIcon className="ml-auto h-4 w-4 flex-none opacity-25 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>

          <div className="mt-12 grid border-l border-t border-[#071a2b]/20 sm:grid-cols-2 lg:grid-cols-4">
            {archiveLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group min-h-64 border-b border-r border-[#071a2b]/20 p-6 transition duration-300 hover:bg-[#071a2b] hover:text-white"
              >
                <item.icon className="h-7 w-7 text-blue-700 group-hover:text-blue-300" />
                <div className="mt-20">
                  <h3 className="font-display text-2xl font-semibold">
                    {item.label}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#071a2b]/60 group-hover:text-white/65">
                    {item.detail}
                  </p>
                  <ArrowRightIcon className="mt-5 h-5 w-5 transition group-hover:translate-x-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {articles.length > 1 && (
        <section>
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
            <div className="mb-8 flex items-end justify-between border-b border-[#071a2b]/15 pb-5">
              <div>
                <p className="section-kicker">Latest stories</p>
                <h2 className="mt-4 font-display text-4xl font-semibold">
                  From Tranmere-Web
                </h2>
              </div>
              <Link href="/blog" className="text-sm font-bold text-blue-700">
                View all stories →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {articles.slice(1, 4).map((article) => (
                <Link
                  key={article.slug}
                  href={`/page/blog/${article.slug}`}
                  className="group border border-[#071a2b]/15 bg-[#fffdf8] p-3"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#e8e2d6]">
                    <Image
                      src={article.pic?.url ?? defaultArticleImage}
                      alt={article.title}
                      width={640}
                      height={480}
                      unoptimized
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="px-2 pb-2 pt-5">
                    <p className="font-mono text-[11px] text-blue-700">
                      {new Date(article.datePosted).toDateString()}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
