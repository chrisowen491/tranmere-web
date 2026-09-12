import type { Metadata } from "next";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getFantasyChallengeLeague } from "@/lib/fantasyChallenges";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fantasy XI Challenge League",
  description:
    "See the standings and latest results from TranmereWeb Fantasy XI challenges.",
};

export default async function FantasyChallengeLeaguePage() {
  const league = await getFantasyChallengeLeague(getCloudflareContext().env.DB);

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Fantasy XI · Challenge records
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Challenge league
            </h1>
            <p className="text-lg leading-8 text-white/65">
              Every completed five-match challenge counts. Teams earn three
              league points for a win and one for a draw.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#071a2b]/15 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Standings
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              All challenged XIs
            </h2>
          </div>
          <Link
            href="/fantasy-team/shared"
            className="bg-blue-700 px-5 py-3 text-sm font-bold text-white"
          >
            Find an XI to challenge
          </Link>
        </div>

        {league.standings.length === 0 ? (
          <section className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] p-10 text-center">
            <h2 className="font-display text-3xl font-semibold">
              No challenges played yet
            </h2>
            <p className="mt-3 text-[#071a2b]/60">
              Challenge a shared XI to become the first team in the table.
            </p>
          </section>
        ) : (
          <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-[#071a2b] text-white/70">
                <tr>
                  <th className="w-14 px-4 py-3 text-center">Pos</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-3 py-3 text-right">P</th>
                  <th className="px-3 py-3 text-right">W</th>
                  <th className="px-3 py-3 text-right">D</th>
                  <th className="px-3 py-3 text-right">L</th>
                  <th className="px-3 py-3 text-right">PF</th>
                  <th className="px-3 py-3 text-right">PA</th>
                  <th className="px-3 py-3 text-right">Diff</th>
                  <th className="px-4 py-3 text-right text-white">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071a2b]/10">
                {league.standings.map((team, index) => (
                  <tr key={team.teamId}>
                    <td className="px-4 py-4 text-center font-mono font-bold text-[#071a2b]/45">
                      {index + 1}
                    </td>
                    <th className="px-4 py-4 text-base">
                      {team.shareId ? (
                        <Link
                          href={`/fantasy-team/shared/${team.shareId}`}
                          className="text-blue-700 hover:underline"
                        >
                          {team.name}
                        </Link>
                      ) : (
                        team.name
                      )}
                    </th>
                    <td className="px-3 py-4 text-right font-mono">
                      {team.played}
                    </td>
                    <td className="px-3 py-4 text-right font-mono">
                      {team.won}
                    </td>
                    <td className="px-3 py-4 text-right font-mono">
                      {team.drawn}
                    </td>
                    <td className="px-3 py-4 text-right font-mono">
                      {team.lost}
                    </td>
                    <td className="px-3 py-4 text-right font-mono">
                      {team.pointsFor}
                    </td>
                    <td className="px-3 py-4 text-right font-mono">
                      {team.pointsAgainst}
                    </td>
                    <td className="px-3 py-4 text-right font-mono">
                      {team.scoreDifference > 0 ? "+" : ""}
                      {team.scoreDifference}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-lg font-bold">
                      {team.leaguePoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {league.recentResults.length > 0 && (
          <section className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Latest fixtures
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Recent challenge results
            </h2>
            <div className="mt-5 divide-y divide-[#071a2b]/10 border border-[#071a2b]/15 bg-[#fffdf8]">
              {league.recentResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/fantasy-team/challenge/result/${result.id}`}
                  className="grid gap-2 px-5 py-4 transition hover:bg-[#e8e2d6]/60 sm:grid-cols-[130px_1fr_auto_1fr] sm:items-center"
                >
                  <time className="font-mono text-xs text-[#071a2b]/45">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(result.createdAt))}
                  </time>
                  <span className="font-semibold sm:text-right">
                    {result.challenger.name}
                  </span>
                  <strong className="font-mono text-lg">
                    {result.challenger.total}–{result.opponent.total}
                  </strong>
                  <span className="font-semibold">{result.opponent.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-6 text-xs leading-5 text-[#071a2b]/50">
          PF and PA are fantasy points scored and conceded. Ties in the league
          table are separated by points difference, then points scored, then
          wins.
        </p>
      </div>
    </main>
  );
}
