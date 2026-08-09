import { ArrowTrendingUpIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { getPlayerStatistics } from "@/lib/playerStatistics";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = pageMetadata({
  title: "Tranmere Rovers lethal finishers",
  description:
    "The Tranmere Rovers players with the best goals-per-game records, based on at least 20 appearances.",
  pathname: "/players/lethal-finishers",
});

export default async function LethalFinishersPage() {
  await connection();
  const env = (await getCloudflareContext({ async: true })).env;
  const players = (
    await getPlayerStatistics(env.DB, {
      sort: "Goals",
      limit: 1000,
    })
  )
    .filter((player) => player.Apps > 20)
    .map((player) => ({
      ...player,
      goalsPerGame: Math.round((player.goals / player.Apps) * 100) / 100,
    }))
    .sort(
      (a, b) =>
        b.goalsPerGame - a.goalsPerGame ||
        b.goals - a.goals ||
        b.Apps - a.Apps ||
        a.Player.localeCompare(b.Player),
    );
  const leader = players[0];
  const displayedPlayers = players.slice(0, 24);

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          { name: "Lethal finishers", pathname: "/players/lethal-finishers" },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Player records
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
                Lethal
                <br />
                finishers.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                The Rovers players who turned appearances into goals most
                efficiently, across careers of at least 20 first-team games.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Minimum apps
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">21</dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Archive leaders
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {displayedPlayers.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {leader && (
        <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
          <Link
            href={`/page/player/${encodeURIComponent(leader.Player)}`}
            className="group mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-10 lg:px-12"
          >
            <Image
              src={leader.profile.picLink}
              alt=""
              width={128}
              height={128}
              unoptimized
              className="h-20 w-20 rounded-full border-4 border-[#fffdf8] bg-[#071a2b] object-cover shadow-lg"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                The benchmark
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold transition group-hover:text-blue-700">
                {leader.Player}
              </h2>
              <p className="mt-1 text-sm text-[#071a2b]/60">
                {leader.goals} goals from {leader.Apps} appearances
              </p>
            </div>
            <span className="flex w-fit items-center gap-2 bg-[#071a2b] px-4 py-3 font-mono text-sm font-bold text-white">
              <TrophyIcon className="h-4 w-4 text-blue-300" />
              {leader.goalsPerGame} goals per game
            </span>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Goals per game
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              The top 24 finishers.
            </h2>
          </div>
          <p className="flex items-center gap-2 text-sm text-[#071a2b]/55">
            <ArrowTrendingUpIcon className="h-4 w-4 text-blue-700" />
            Minimum 21 appearances
          </p>
        </div>

        <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2">
          {displayedPlayers.map((player, index) => (
            <Link
              key={player.Player}
              href={`/page/player/${encodeURIComponent(player.Player)}`}
              className="group flex items-center gap-4 bg-[#fffdf8] p-5 transition hover:bg-white"
            >
              <span className="font-mono text-sm font-bold text-blue-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Image
                src={player.profile.picLink}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-14 w-14 rounded-full border border-[#071a2b]/10 bg-[#071a2b] object-cover transition group-hover:scale-105"
              />
              <span className="min-w-0 flex-1">
                <strong className="block font-display text-lg font-semibold leading-tight group-hover:text-blue-700">
                  {player.Player}
                </strong>
                <span className="mt-1 block text-sm text-[#071a2b]/55">
                  {player.goals} goals · {player.Apps} apps
                </span>
              </span>
              <strong className="font-mono text-lg text-blue-700">
                {player.goalsPerGame}
              </strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
