import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { FantasyTeamBuilder } from "@/components/apps/FantasyTeamBuilder";
import { getPlayerCardOptions } from "@/lib/players";
import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { getOwnedFantasyTeam } from "@/lib/fantasyTeams";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fantasy XI",
  description:
    "Build and share your all-time Tranmere Rovers fantasy football team.",
};

const defaultPlayerImage =
  "https://www.tranmere-web.com/builder/2026/none/cccccc/none/000000/cccccc/none/cccccc";

export default async function FantasyTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; duplicate?: string }>;
}) {
  const env = (await getCloudflareContext({ async: true })).env;
  const session = await auth0.getSession();
  const params = await searchParams;
  const requestedId = params.edit ?? params.duplicate;
  const account = session
    ? await resolveAccount(env.DB, session.user.sub)
    : null;
  const initialTeam =
    account && requestedId
      ? await getOwnedFantasyTeam(env.DB, requestedId, account.id)
      : null;
  const players = await getPlayerCardOptions(env.DB);
  const availablePlayers = players.map((player) => ({
    id: player.id,
    name: player.name,
    picLink: player.picLink ?? defaultPlayerImage,
  }));

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:px-10 lg:px-12">
        <p className="section-kicker">Fantasy XI</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">
          Pick your all-time Rovers team.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#071a2b]/60">
          Choose a formation, kit and captain from the player archive. Logged-in
          supporters can save themed teams privately, revisit them and decide
          exactly which XIs to share.
        </p>
        {session && (
          <Link
            href="/profile/fantasy-teams"
            className="mt-7 inline-flex border border-[#071a2b] px-5 py-3 text-sm font-bold transition hover:bg-[#071a2b] hover:text-white"
          >
            View your saved XIs →
          </Link>
        )}
      </div>
      <FantasyTeamBuilder
        players={availablePlayers}
        canSave={Boolean(session)}
        initialTeam={initialTeam}
        duplicate={Boolean(params.duplicate)}
      />
    </main>
  );
}
