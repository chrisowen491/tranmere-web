import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSharedFantasyTeam, hydrateFantasyTeam } from "@/lib/fantasyTeams";
import { SharedFantasyTeam } from "@/components/apps/SharedFantasyTeam";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const team = await getSharedFantasyTeam(
    getCloudflareContext().env.DB,
    (await params).id,
  );
  return {
    title: team ? `${team.name} · Fantasy XI` : "Fantasy XI",
    description:
      team?.rationale || "A supporter-selected Tranmere Rovers Fantasy XI.",
  };
}

export default async function SharedFantasyTeamPage({ params }: Props) {
  const { id } = await params;
  const db = getCloudflareContext().env.DB;
  const team = await getSharedFantasyTeam(db, id);
  if (!team) notFound();
  const players = await hydrateFantasyTeam(db, team);
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Supporter selection · Read-only XI
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em]">
            {team.name}
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-white/55">
            {team.formation === "442" ? "4–4–2" : "4–3–3"} · {team.kit} kit
          </p>
          {team.rationale && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              {team.rationale}
            </p>
          )}
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <SharedFantasyTeam
          formation={team.formation}
          kit={team.kit}
          captainPlayerId={team.captainPlayerId}
          players={players}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/fantasy-team/shared/${id}/image`}
            target="_blank"
            className="bg-blue-700 px-5 py-3 text-sm font-bold text-white"
          >
            Open branded team image
          </Link>
          <Link
            href="/fantasy-team"
            className="border border-[#071a2b] px-5 py-3 text-sm font-bold"
          >
            Build your own XI
          </Link>
        </div>
        <p className="mt-6 text-sm text-[#071a2b]/55">
          This shared team can be viewed by anyone with its link, but only its
          owner can edit it. The owner can revoke access at any time.
        </p>
      </section>
    </main>
  );
}
