import Link from "next/link";
import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { listSharedFantasyTeams } from "@/lib/fantasyTeams";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared Fantasy XIs",
  description:
    "Browse supporter-selected all-time Tranmere Rovers Fantasy XIs and challenge them with your own team.",
};

export default async function SharedFantasyTeamsPage() {
  const teams = await listSharedFantasyTeams(getCloudflareContext().env.DB);

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Supporter selections · Fantasy XI
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Shared Rovers XIs
            </h1>
            <p className="text-lg leading-8 text-white/65">
              Explore all-time teams selected by fellow supporters, inspect
              every line-up and put one to the five-match challenge.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#071a2b]/15 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Public collection
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {teams.length} {teams.length === 1 ? "team" : "teams"} ready to
              explore
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/fantasy-team/challenge/league"
              className="border border-[#071a2b] px-5 py-3 text-sm font-bold"
            >
              Challenge league
            </Link>
            <Link
              href="/fantasy-team"
              className="bg-blue-700 px-5 py-3 text-sm font-bold text-white"
            >
              Build your own XI
            </Link>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-10 text-center">
            <h2 className="font-display text-3xl font-semibold">
              No public XIs yet
            </h2>
            <p className="mt-3 text-[#071a2b]/60">
              Build a team, save it and enable public sharing to place it in
              this collection.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => {
              const captain = team.assignments.find(
                (player) => player.playerId === team.captainPlayerId,
              );
              return (
                <article
                  key={team.id}
                  className="flex flex-col border border-[#071a2b]/15 bg-[#fffdf8] p-6 transition hover:border-blue-700 hover:shadow-[5px_5px_0_rgba(7,26,43,0.08)]"
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    {team.formation === "442" ? "4–4–2" : "4–3–3"} · {team.kit}{" "}
                    kit
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-semibold">
                    <Link
                      href={`/fantasy-team/shared/${team.shareId}`}
                      className="hover:text-blue-700"
                    >
                      {team.name}
                    </Link>
                  </h3>
                  {team.rationale && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#071a2b]/60">
                      {team.rationale}
                    </p>
                  )}
                  <div className="mt-5 border-t border-[#071a2b]/10 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/45">
                      Captain
                    </p>
                    <p className="mt-1 font-semibold">
                      {captain?.playerName ?? "Not selected"}
                    </p>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#071a2b]/50">
                      {team.assignments
                        .map((player) => player.playerName)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
                    <Link
                      href={`/fantasy-team/shared/${team.shareId}`}
                      className="border border-[#071a2b]/20 px-3 py-2 text-center text-sm font-bold"
                    >
                      View XI
                    </Link>
                    <Link
                      href={`/fantasy-team/challenge/${team.shareId}`}
                      className="bg-blue-700 px-3 py-2 text-center text-sm font-bold text-white"
                    >
                      Challenge
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
