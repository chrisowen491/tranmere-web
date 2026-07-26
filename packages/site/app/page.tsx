import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { GetAllPlayers, GetYear } from "@tranmere-web/lib/src/apiFunctions";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { PlayerProfile } from "@/lib/types";

export const revalidate = 7200;

const defaultPlayerImageSignature =
  "simple/cccccc/none/cccccc/cccccc/none/cccccc";

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
    stat: "5,000+",
    icon: CalendarDaysIcon,
  },
  {
    label: "Player index",
    detail: "Profiles, appearances and goals",
    href: "/playersearch",
    stat: "500+",
    icon: UserGroupIcon,
  },
  {
    label: "Shirt archive",
    detail: "Home, away and goalkeeper kits",
    href: "/shirts",
    stat: "100+",
    icon: TrophyIcon,
  },
  {
    label: "Season records",
    detail: "Tables, squads and match-by-match form",
    href: `/season/${GetYear()}`,
    stat: "104",
    icon: ChartBarSquareIcon,
  },
];

const exploreLinks = [
  {
    eyebrow: "Records",
    title: "The names behind the numbers",
    copy: "Trace top scorers season by season, the club’s longest-serving managers and the players who defined an era.",
    href: "/top-scorers-by-season",
    cta: "Explore club records",
  },
  {
    eyebrow: "Transfers",
    title: "Every arrival. Every departure.",
    copy: "Follow the movement of players in and out of Prenton Park from 1977 to today.",
    href: "/transfer-central",
    cta: "Open Transfer Central",
  },
  {
    eyebrow: "Make your own",
    title: "Build a Rovers icon",
    copy: "Mix classic kits, hairstyles and features to create a player avatar inspired by the archive.",
    href: "/player-builder",
    cta: "Launch the avatar builder",
  },
];

export default async function Home() {
  const players = await GetAllPlayers();
  const playersWithImages = players.filter(
    (player) =>
      player.picLink &&
      !player.picLink.toLowerCase().includes(defaultPlayerImageSignature),
  );
  const randomPlayer =
    playersWithImages[Math.floor(Math.random() * playersWithImages.length)];

  const playerUrl =
    GetBaseUrl((await getCloudflareContext({ async: true })).env) +
    `/page/player/${encodeURIComponent(randomPlayer.name)}`;
  const playerRequest = await fetch(playerUrl);
  const profile = (await playerRequest.json()) as PlayerProfile;
  const playerImage = profile.player.picLink ?? "/images/2023.png";

  return (
    <main className="bg-[#f4f0e8] text-[#071a2b]">
      <section className="relative overflow-hidden border-b border-[#071a2b]/15 bg-[#071a2b] text-[#f4f0e8]">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto grid min-h-[680px] max-w-7xl lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col justify-between px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              <span className="h-px w-10 bg-blue-400" />
              Launched in 2020
            </div>
            <div className="max-w-4xl py-20 lg:py-24">
              <p className="mb-7 font-mono text-xs uppercase tracking-[0.28em] text-white/60">
                Tranmere Rovers · Data · Stories · History
              </p>
              <h1 className="font-display text-6xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-7xl lg:text-[7.4rem]">
                A century
                <br />
                of Rovers.
                <br />
                <span className="text-blue-400">One archive.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">
                The independent home of Tranmere Rovers history. Every result,
                hundreds of player stories and thousands of details — kept by
                supporters, for supporters.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/results"
                  className="group inline-flex items-center gap-3 bg-[#f4f0e8] px-6 py-3.5 text-sm font-bold text-[#071a2b] transition hover:bg-blue-300"
                >
                  Explore the archive
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/page/blog/about"
                  className="inline-flex items-center border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                >
                  Our story
                </Link>
              </div>
            </div>
            <div className="grid max-w-2xl grid-cols-3 border-t border-white/15 pt-6">
              <div>
                <strong className="block text-2xl">1921</strong>
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Records begin
                </span>
              </div>
              <div>
                <strong className="block text-2xl">5,000+</strong>
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Match results
                </span>
              </div>
              <div>
                <strong className="block text-2xl">2,000+</strong>
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Programme scans
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden border-l border-white/15 lg:block">
            <div className="absolute inset-x-0 top-0 flex justify-between border-b border-white/15 p-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>Club Formed 1884</span>
              <span>Birkenhead, Wirral</span>
            </div>
            <div className="absolute inset-x-10 bottom-0 top-20 flex items-end justify-center overflow-hidden">
              <div className="absolute left-5 top-24 z-10 border-l border-blue-400 pl-3 font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-white/45">
                Random player of the day
                <br />
                {profile.player.name}
              </div>
              <span className="absolute right-0 top-20 font-display text-[10rem] font-semibold leading-none text-white/[0.035]">
                1884
              </span>
              <Link
                href={`/page/player/${profile.player.name}`}
                aria-label={`View ${profile.player.name}'s player profile`}
              >
                <Image
                  src={playerImage}
                  alt={`Illustrated player portrait of ${profile.player.name}`}
                  width={512}
                  height={512}
                  priority
                  unoptimized
                  className="absolute left-1/2 top-56 z-10 w-[190%] max-w-none -translate-x-1/2 object-contain transition duration-300 hover:scale-[1.02]"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#071a2b]/15">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="section-kicker">Start exploring</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                The whole story, one detail at a time.
              </h2>
            </div>
            <Link
              href="/playersearch"
              className="inline-flex items-center gap-2 self-start border-b border-[#071a2b] pb-1 text-sm font-bold"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Search the collection
            </Link>
          </div>
          <div className="grid border-l border-t border-[#071a2b]/20 sm:grid-cols-2 lg:grid-cols-4">
            {archiveLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group min-h-72 border-b border-r border-[#071a2b]/20 p-6 transition duration-300 hover:bg-[#071a2b] hover:text-white"
              >
                <div className="flex items-start justify-between">
                  <item.icon className="h-7 w-7 text-blue-600 group-hover:text-blue-300" />
                  <span className="font-mono text-xs text-[#071a2b]/45 group-hover:text-white/45">
                    {item.stat}
                  </span>
                </div>
                <div className="mt-24">
                  <h3 className="font-display text-2xl font-semibold">
                    {item.label}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#071a2b]/60 group-hover:text-white/65">
                    {item.detail}
                  </p>
                  <ArrowRightIcon className="mt-6 h-5 w-5 transition group-hover:translate-x-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e8e2d6]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
          <p className="section-kicker">Beyond the scoreline</p>
          <div className="mt-8 grid gap-px overflow-hidden border border-[#071a2b]/15 bg-[#071a2b]/15 lg:grid-cols-3">
            {exploreLinks.map((item, index) => (
              <article
                key={item.title}
                className="flex min-h-[430px] flex-col justify-between bg-[#f4f0e8] p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                    {item.eyebrow}
                  </span>
                  <span className="font-mono text-xs text-[#071a2b]/35">
                    0{index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.035em]">
                    {item.title}
                  </h3>
                  <p className="mt-5 max-w-sm leading-7 text-[#071a2b]/65">
                    {item.copy}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-8 inline-flex items-center gap-3 text-sm font-bold"
                  >
                    {item.cta}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-300/20 bg-blue-700 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="flex items-center gap-5">
            <SparklesIcon className="h-9 w-9 text-blue-200" />
            <div>
              <p className="font-display text-2xl font-semibold">
                Pick a player. Any player.
              </p>
              <p className="mt-1 text-sm text-blue-100/70">
                Search profiles, appearances, goals and transfer history.
              </p>
            </div>
          </div>
          <Link
            href="/playersearch"
            className="inline-flex items-center justify-center gap-3 bg-white px-6 py-3.5 text-sm font-bold text-blue-800"
          >
            Search player profiles
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
