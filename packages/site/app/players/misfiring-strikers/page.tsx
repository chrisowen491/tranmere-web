import {
  ArrowDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { queryPlayerSeasonSummaryRows } from "@tranmere-web/lib/src/d1-queries";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { getUniquePlayers } from "@/lib/players";

export const metadata = pageMetadata({
  title: "Tranmere Rovers misfiring strikers",
  description:
    "A light-hearted ranking of Tranmere strikers whose goal return most undershot their opportunities.",
  pathname: "/players/misfiring-strikers",
});

interface MisfireInput {
  Apps: number;
  starts: number;
  subs: number;
  goals: number;
  red: number;
}

interface MisfiringStriker extends MisfireInput {
  Player: string;
  picLink: string | null;
  appearances: number;
  weightedAppearances: number;
  goalsPerAppearance: number;
  misfireScore: number;
}

function calculateMisfireScore(player: MisfireInput) {
  const appearances = player.starts + player.subs || player.Apps;
  const weightedAppearances =
    player.starts || player.subs
      ? player.starts * 2 + player.subs
      : appearances;
  const cardPenalty = player.red * 2.5;
  const goalDroughtMultiplier = player.goals === 0 ? 10 : 1;

  return {
    appearances,
    weightedAppearances,
    goalsPerAppearance:
      appearances > 0
        ? Math.round((player.goals / appearances) * 100) / 100
        : 0,
    misfireScore:
      Math.round(
        ((weightedAppearances / (player.goals + 1)) * goalDroughtMultiplier +
          cardPenalty) *
          10,
      ) / 10,
  };
}

export default async function MisfiringStrikersPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const [players, summaries] = await Promise.all([
    getUniquePlayers(env.DB),
    queryPlayerSeasonSummaryRows(env.DB, { season: "TOTAL" }),
  ]);
  const strikers = players.filter((player) => player.position === "Striker");
  const statisticsByName = new Map(
    summaries.map((summary) => [summary.player_name, summary]),
  );
  const rankedStrikers = strikers
    .map<MisfiringStriker>((player) => {
      const statistics = statisticsByName.get(player.name);
      const input: MisfireInput = {
        Apps: statistics?.appearances ?? 0,
        starts: statistics?.starts ?? 0,
        subs: statistics?.substitute_appearances ?? 0,
        goals: statistics?.goals ?? 0,
        red: statistics?.red_cards ?? 0,
      };

      return {
        Player: player.name,
        picLink: player.picLink,
        ...input,
        ...calculateMisfireScore(input),
      };
    })
    .filter((player) => player.appearances > 0)
    .sort(
      (a, b) =>
        b.misfireScore - a.misfireScore ||
        b.weightedAppearances - a.weightedAppearances ||
        a.goals - b.goals ||
        a.Player.localeCompare(b.Player),
    )
    .slice(0, 20);
  const leader = rankedStrikers[0];
  const totalAppearances = rankedStrikers.reduce(
    (total, player) => total + player.appearances,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          {
            name: "Misfiring strikers",
            pathname: "/players/misfiring-strikers",
          },
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
                When the goals
                <br />
                wouldn&apos;t come.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                A light-hearted look at the Rovers strikers who had the most
                opportunity but the leanest return in front of goal.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Strikers ranked
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {rankedStrikers.length}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Appearances
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {totalAppearances}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:px-12">
          <div className="flex gap-4 border border-[#071a2b]/15 bg-[#fffdf8] p-5">
            <ExclamationTriangleIcon className="h-6 w-6 shrink-0 text-blue-700" />
            <p className="text-sm leading-6 text-[#071a2b]/65">
              This is an archive curiosity, not a verdict on a player. The top
              20 Misfire scores are selected from Tranmere-Web database players
              whose primary position is Striker and have a recorded first-team
              appearance.
            </p>
          </div>
          <p className="border border-[#071a2b]/15 bg-[#fffdf8] p-5 text-sm leading-6 text-[#071a2b]/65">
            <strong className="text-[#071a2b]">Score formula:</strong> starts
            count double, substitute appearances count once, and goals reduce
            the score. A striker who never scored receives a tenfold
            goal-drought multiplier; red cards add a small discipline penalty. A
            higher score means a more misfiring record in the archive.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        {leader && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-5 border-b border-[#071a2b]/15 pb-8">
            <Link
              href={`/page/player/${encodeURIComponent(leader.Player)}`}
              className="group flex items-center gap-4"
            >
              <Image
                src={
                  leader.picLink ??
                  "https://www.tranmere-web.com/builder/2026/none/cccccc/none/000000/cccccc/none/cccccc"
                }
                alt=""
                width={112}
                height={112}
                unoptimized
                className="h-16 w-16 rounded-full border-4 border-[#fffdf8] bg-[#071a2b] object-cover shadow-md transition group-hover:scale-105"
              />
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Current leader
                </span>
                <span className="mt-2 block font-display text-3xl font-semibold transition group-hover:text-blue-700 sm:text-4xl">
                  {leader.Player}
                </span>
              </span>
            </Link>
            <span className="flex items-center gap-2 bg-[#071a2b] px-4 py-3 font-mono text-sm font-bold text-white">
              <ArrowDownIcon className="h-4 w-4 text-blue-300" />
              Misfire score {leader.misfireScore}
            </span>
          </div>
        )}

        {rankedStrikers.length ? (
          <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
            <table className="min-w-[740px] w-full text-left">
              <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.13em] text-white/65">
                <tr>
                  <th className="w-16 px-5 py-4">Rank</th>
                  <th className="px-5 py-4">Striker</th>
                  <th className="px-5 py-4 text-center">Apps</th>
                  <th className="px-5 py-4 text-center">Starts</th>
                  <th className="px-5 py-4 text-center">Goals</th>
                  <th className="px-5 py-4 text-center">Red cards</th>
                  <th className="px-5 py-4 text-right">Misfire score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071a2b]/10">
                {rankedStrikers.map((player, index) => (
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
                          src={
                            player.picLink ??
                            "https://www.tranmere-web.com/builder/2026/none/cccccc/none/000000/cccccc/none/cccccc"
                          }
                          alt=""
                          width={56}
                          height={56}
                          unoptimized
                          className="h-11 w-11 rounded-full border border-[#071a2b]/10 bg-[#071a2b] object-cover"
                        />
                        <span>{player.Player}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-sm">
                      {player.appearances}
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-sm">
                      {player.starts}
                      <span className="ml-1 text-xs text-[#071a2b]/45">
                        +{player.subs}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-sm">
                      {player.goals}
                      <span className="ml-1 text-xs text-[#071a2b]/45">
                        ({player.goalsPerAppearance})
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-red-700">
                      {player.red}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-base font-bold text-blue-700">
                      {player.misfireScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border border-[#071a2b]/15 bg-[#fffdf8] p-8 text-[#071a2b]/60">
            No striker records meet the current threshold.
          </p>
        )}
      </section>
    </main>
  );
}
