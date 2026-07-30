import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { FantasyTeamBuilder } from "@/components/apps/FantasyTeamBuilder";
import { getUniquePlayers } from "@/lib/players";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Fantasy XI",
  description:
    "Build and share your all-time Tranmere Rovers fantasy football team.",
};

const defaultPlayerImageSignature =
  "simple/cccccc/none/cccccc/cccccc/none/cccccc";

export default async function FantasyTeamPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const players = await getUniquePlayers(env.DB);
  const availablePlayers = players
    .filter(
      (player) =>
        player.picLink &&
        !player.picLink.toLowerCase().includes(defaultPlayerImageSignature),
    )
    .map((player) => ({
      name: player.name,
      picLink: player.picLink!,
    }));

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:px-10 lg:px-12">
        <p className="section-kicker">Fantasy XI</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">
          Pick your all-time Rovers team.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#071a2b]/60">
          Choose a formation, fill every position from the player archive and
          name your captain. Your selection is saved on this device and can be
          shared as a link.
        </p>
      </div>
      <FantasyTeamBuilder players={availablePlayers} />
    </main>
  );
}
