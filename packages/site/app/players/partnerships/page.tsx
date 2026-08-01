import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { PlayerPartnershipExplorer } from "@/components/apps/PlayerPartnershipExplorer";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getPlayerPartnership } from "@/lib/playerPartnership";
import { getUniquePlayers } from "@/lib/players";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Tranmere Rovers player partnership explorer",
  description:
    "Discover how two Tranmere players performed together, including shared matches, results, goals and winning runs.",
};

export default async function PlayerPartnershipsPage(props: {
  searchParams: Promise<{ player?: string }>;
}) {
  const env = (await getCloudflareContext({ async: true })).env;
  const searchParams = await props.searchParams;
  const players = await getUniquePlayers(env.DB);
  const requestedPlayer = searchParams.player;
  const firstPlayer =
    requestedPlayer && players.some((player) => player.name === requestedPlayer)
      ? requestedPlayer
      : players.some((player) => player.name === "Steve Mungall")
        ? "Steve Mungall"
        : players[0].name;
  const preferredSecond =
    firstPlayer === "John Morrissey" ? "Steve Mungall" : "John Morrissey";
  const secondPlayer = players.some((player) => player.name === preferredSecond)
    ? preferredSecond
    : players.find((player) => player.name !== firstPlayer)!.name;
  const initialPartnership = await getPlayerPartnership(
    env.DB,
    GetBaseUrl(env),
    firstPlayer,
    secondPlayer,
  );

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Better together
          </p>
          <h1 className="mt-7 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
            Find a Rovers
            <br />
            partnership.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Put any two players on the same team sheet and discover the matches,
            goals and winning runs they shared in a Tranmere shirt.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-7 font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            <span>{players.length} players</span>
            <span>Every recorded appearance</span>
            <span>Calculated live</span>
          </div>
        </div>
      </header>
      <PlayerPartnershipExplorer
        players={players}
        initialPartnership={initialPartnership}
      />
    </main>
  );
}
