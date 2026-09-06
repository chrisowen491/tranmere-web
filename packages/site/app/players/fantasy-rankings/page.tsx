import { ChartBarIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  queryFantasyRankingRows,
  querySearchIndexSeasonRows,
} from "@tranmere-web/lib/src/d1-queries";
import Image from "next/image";
import Link from "next/link";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { defaultPlayerAvatar } from "@/lib/playerStatistics";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers fantasy rankings",
  description:
    "Rank Tranmere Rovers players all-time or by season using fantasy football points for appearances, goals, assists and cards.",
  pathname: "/players/fantasy-rankings",
});

interface FantasyRankingsPageProps {
  searchParams: Promise<{ season?: string }>;
}

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

export default async function FantasyRankingsPage({
  searchParams,
}: FantasyRankingsPageProps) {
  const params = await searchParams;
  const requestedSeason = Number(params.season);
  const selectedSeason = Number.isInteger(requestedSeason)
    ? requestedSeason
    : undefined;
  const env = (await getCloudflareContext({ async: true })).env;
  const [players, seasonRows] = await Promise.all([
    queryFantasyRankingRows(env.DB, { season: selectedSeason }),
    querySearchIndexSeasonRows(env.DB),
  ]);
  const seasons = seasonRows.map(({ season }) => season).sort((a, b) => b - a);
  const leader = players[0];
  const scope = selectedSeason ? seasonLabel(selectedSeason) : "All time";

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          { name: "Fantasy rankings", pathname: "/players/fantasy-rankings" },
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
                Fantasy
                <br />
                rankings.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Every Rovers player ranked with fantasy football points for
                appearances, goals, assists and discipline.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Scope
                </dt>
                <dd className="mt-3 font-display text-2xl font-semibold">
                  {scope}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Players
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {players.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto max-w-7xl px-6 py-7 sm:px-10 lg:px-12">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <label className="grid gap-2" htmlFor="season">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#071a2b]/55">
                Ranking period
              </span>
              <select
                id="season"
                name="season"
                defaultValue={selectedSeason ?? ""}
                className="min-w-52 border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 font-semibold outline-none focus:border-blue-700"
              >
                <option value="">All time</option>
                {seasons.map((season) => (
                  <option key={season} value={season}>
                    {seasonLabel(season)} season
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="bg-[#071a2b] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-blue-800"
            >
              Update table
            </button>
          </form>
        </div>
      </section>

      {leader && (
        <section className="border-b border-[#071a2b]/15 bg-[#fffdf8]">
          <Link
            href={`/page/player/${encodeURIComponent(leader.player_name)}`}
            className="group mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-10 lg:px-12"
          >
            <Image
              src={leader.pic_link || defaultPlayerAvatar}
              alt=""
              width={128}
              height={128}
              unoptimized
              className="h-20 w-20 rounded-full border-4 border-[#f4f0e8] bg-[#071a2b] object-cover shadow-lg"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Number one · {scope}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold transition group-hover:text-blue-700">
                {leader.player_name}
              </h2>
              <p className="mt-1 text-sm text-[#071a2b]/60">
                {leader.fantasy_position} · {leader.appearances} appearances ·{" "}
                {leader.goals} goals
              </p>
            </div>
            <span className="flex w-fit items-center gap-2 bg-[#071a2b] px-5 py-3 font-mono text-lg font-bold text-white">
              <TrophyIcon className="h-5 w-5 text-blue-300" />
              {leader.total_points} pts
            </span>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {scope}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Player points table.
            </h2>
          </div>
          <p className="flex items-center gap-2 text-sm text-[#071a2b]/55">
            <ChartBarIcon className="h-4 w-4 text-blue-700" />
            Sorted by total points
          </p>
        </div>

        <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="w-16 px-4 py-4">Rank</th>
                <th className="px-4 py-4">Player</th>
                <th className="px-4 py-4">Position</th>
                <th className="px-4 py-4 text-center">Apps</th>
                <th className="px-4 py-4 text-center">Goals</th>
                <th className="px-4 py-4 text-center">Assists</th>
                <th className="px-4 py-4 text-center">CS</th>
                <th className="px-4 py-4 text-center">Cards</th>
                <th className="px-4 py-4 text-center">App pts</th>
                <th className="px-4 py-4 text-center">Goal pts</th>
                <th className="px-4 py-4 text-center">Assist pts</th>
                <th className="px-4 py-4 text-center">CS pts</th>
                <th className="px-4 py-4 text-center">Card pts</th>
                <th className="px-4 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {players.map((player, index) => (
                <tr
                  key={player.player_name}
                  className="group hover:bg-[#f4f0e8]"
                >
                  <td className="px-4 py-4 font-mono text-sm text-[#071a2b]/50">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/page/player/${encodeURIComponent(player.player_name)}`}
                      className="flex items-center gap-3 font-semibold transition group-hover:text-blue-700"
                    >
                      <Image
                        src={player.pic_link || defaultPlayerAvatar}
                        alt=""
                        width={48}
                        height={48}
                        unoptimized
                        className="h-10 w-10 rounded-full border border-[#071a2b]/10 bg-[#071a2b] object-cover"
                      />
                      {player.player_name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#071a2b]/65">
                    {player.fantasy_position}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.appearances}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.goals}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.assists}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.clean_sheets}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.yellow_cards}Y · {player.red_cards}R
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.appearance_points}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.goal_points}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.assist_points}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.clean_sheet_points}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-sm">
                    {player.card_points}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-lg font-bold text-blue-700">
                    {player.total_points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="mt-8 border-l-4 border-blue-700 bg-[#e8e2d6] px-6 py-5 text-sm leading-6 text-[#071a2b]/70">
          <p className="font-bold text-[#071a2b]">How points are calculated</p>
          <p className="mt-2">
            Appearances earn 2 points for 60 minutes or more and 1 point for
            less. Unknown substitution times are treated as the 60th minute.
            Goals earn 10 points for goalkeepers, 6 for defenders, 5 for
            midfielders and 4 for forwards; every assist earns 3. Yellow cards
            deduct 1 point and red cards deduct 3. A 60-minute clean-sheet
            appearance earns 4 points for goalkeepers and defenders or 1 for
            midfielders. Position scoring uses each player&apos;s recorded
            primary position. Own goals, penalty misses, penalty saves and goals
            conceded are not currently scored.
          </p>
        </aside>
      </section>
    </main>
  );
}
