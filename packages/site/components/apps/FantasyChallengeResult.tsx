import type { FantasyChallenge } from "@/lib/fantasyChallenges";
import Link from "next/link";

function TeamScores({ team }: { team: FantasyChallenge["challenger"] }) {
  return (
    <section>
      <h2 className="font-display text-3xl font-semibold">{team.name}</h2>
      <div className="mt-4 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#071a2b] text-white/70">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#071a2b]/10">
            {team.players.map((player) => (
              <tr key={player.playerId}>
                <td className="px-4 py-3">
                  <Link
                    href={`/page/player/${encodeURIComponent(player.playerName)}`}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    {player.playerName}
                    {player.captain ? " (C)" : ""}
                  </Link>
                  <p className="mt-1 font-mono text-[10px] text-[#071a2b]/45">
                    {player.matchPoints.join(" · ")}
                  </p>
                </td>
                <td className="px-4 py-3 text-[#071a2b]/55">
                  {player.position}
                </td>
                <td className="px-4 py-3 text-right font-mono text-lg font-bold">
                  {player.points}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#e8e2d6]">
            <tr>
              <th colSpan={2} className="px-4 py-4">
                Team total
              </th>
              <td className="px-4 py-4 text-right font-mono text-2xl font-bold">
                {team.total}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
export function FantasyChallengeResult({
  challenge,
}: {
  challenge: FantasyChallenge;
}) {
  const winner =
    challenge.challenger.total === challenge.opponent.total
      ? null
      : challenge.challenger.total > challenge.opponent.total
        ? challenge.challenger
        : challenge.opponent;
  return (
    <>
      <section className="border border-white/15 bg-[#132c82] p-7 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
          Final score
        </p>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-5">
          <div>
            <h1 className="font-display text-3xl font-semibold sm:text-5xl">
              {challenge.challenger.name}
            </h1>
            <p className="mt-3 font-mono text-5xl font-bold">
              {challenge.challenger.total}
            </p>
          </div>
          <span className="font-mono text-sm text-white/45">V</span>
          <div className="text-right">
            <h1 className="font-display text-3xl font-semibold sm:text-5xl">
              {challenge.opponent.name}
            </h1>
            <p className="mt-3 font-mono text-5xl font-bold">
              {challenge.opponent.total}
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-white/15 pt-5 text-lg font-semibold text-blue-300">
          {winner
            ? `${winner.name} win the challenge`
            : "The challenge ends level"}
        </p>
        <Link
          href="/fantasy-team/challenge/league"
          className="mt-5 inline-flex border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-[#071a2b]"
        >
          View challenge league →
        </Link>
      </section>
      <section className="mt-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          The draw
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          Five archive matches
        </h2>
        <div className="mt-5 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#e8e2d6]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fixture</th>
                <th className="px-4 py-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {challenge.matches.map((match) => (
                <tr key={match.id}>
                  <td className="px-4 py-3 font-mono">
                    <Link
                      href={`/match/${match.season}/${match.matchDate}`}
                      className="text-blue-700 hover:underline"
                    >
                      {match.matchDate}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {match.homeTeam} v {match.awayTeam}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold">
                    {match.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <TeamScores team={challenge.challenger} />
        <TeamScores team={challenge.opponent} />
      </div>
    </>
  );
}
