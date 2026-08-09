import { ArrowPathIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { getPlayerStatistics } from "@/lib/playerStatistics";

export const metadata = pageMetadata({
  title: "Tranmere Rovers super subs",
  description:
    "The Tranmere Rovers players most often called from the bench, ranked by substitute appearances.",
  pathname: "/players/super-subs",
});

export default async function SuperSubsPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const players = (
    await getPlayerStatistics(env.DB, {
      sort: "Subs",
      limit: 1000,
    })
  )
    .filter((player) => player.subs > 0)
    .sort(
      (a, b) =>
        b.subs - a.subs ||
        a.starts - b.starts ||
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
          { name: "Super subs", pathname: "/players/super-subs" },
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
                The super
                <br />
                subs.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                The players most often trusted to change the game from the
                bench, ranked by their substitute appearances for Rovers.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Players ranked
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {displayedPlayers.length}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Top list
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">24</dd>
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
                The go-to change
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold transition group-hover:text-blue-700">
                {leader.Player}
              </h2>
              <p className="mt-1 text-sm text-[#071a2b]/60">
                {leader.starts} starts · {leader.Apps} total appearances
              </p>
            </div>
            <span className="flex w-fit items-center gap-2 bg-[#071a2b] px-4 py-3 font-mono text-sm font-bold text-white">
              <SparklesIcon className="h-4 w-4 text-blue-300" />
              {leader.subs} substitute appearances
            </span>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Off the bench
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              The top 24 game changers.
            </h2>
          </div>
          <p className="flex items-center gap-2 text-sm text-[#071a2b]/55">
            <ArrowPathIcon className="h-4 w-4 text-blue-700" />
            Ranked by substitute appearances
          </p>
        </div>

        <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-[680px] w-full text-left">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.13em] text-white/65">
              <tr>
                <th className="w-16 px-5 py-4">Rank</th>
                <th className="px-5 py-4">Player</th>
                <th className="px-5 py-4 text-center">Sub apps</th>
                <th className="px-5 py-4 text-center">Starts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {displayedPlayers.map((player, index) => (
                <tr key={player.Player} className="group hover:bg-[#f4f0e8]">
                  <td className="px-5 py-4 font-mono text-sm text-[#071a2b]/50">
                    {index + 1}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/page/player/${encodeURIComponent(player.Player)}`}
                      className="flex items-center gap-3 font-semibold transition group-hover:text-blue-700"
                    >
                      <Image
                        src={player.profile.picLink}
                        alt=""
                        width={64}
                        height={64}
                        unoptimized
                        className="h-11 w-11 rounded-full border border-[#071a2b]/10 bg-[#071a2b] object-cover"
                      />
                      {player.Player}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-center font-mono text-base font-bold text-blue-700">
                    {player.subs}
                  </td>
                  <td className="px-5 py-4 text-center font-mono text-sm">
                    {player.starts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
