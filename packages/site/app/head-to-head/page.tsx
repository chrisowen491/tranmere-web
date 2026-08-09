import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { getClubs } from "@/lib/clubs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Head-to-head records",
  description:
    "Explore Tranmere Rovers results and head-to-head records against every opponent in the archive.",
};

const tagSizes = [
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
] as const;

function tagSize(name: string) {
  const score = [...name].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return tagSizes[score % tagSizes.length];
}

export default async function HeadToHeadPage() {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const teams = await getClubs(db);
  const letters = [...new Set(teams.map((team) => team.name[0].toUpperCase()))];

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Match archive
          </p>
          <h1 className="mt-7 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
            Every opponent.
            <br />
            Every meeting.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Pick a club to see the complete head-to-head record, including every
            score, venue and season in the Tranmere-Web archive.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-7 font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            <span>{teams.length} opponents</span>
            <span>Records since 1921</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="grid gap-8 border-b border-[#071a2b]/15 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Choose an opponent
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Head-to-head index
            </h2>
          </div>
          <nav
            aria-label="Jump to team initial"
            className="flex max-w-2xl flex-wrap gap-1"
          >
            {letters.map((letter) => (
              <Link
                key={letter}
                href={`#teams-${letter.toLowerCase()}`}
                className="grid h-9 min-w-9 place-items-center border border-[#071a2b]/15 bg-[#fffdf8] px-2 font-mono text-xs font-bold transition hover:border-blue-700 hover:bg-blue-700 hover:text-white"
              >
                {letter}
              </Link>
            ))}
          </nav>
        </div>

        {letters.map((letter) => (
          <section
            key={letter}
            id={`teams-${letter.toLowerCase()}`}
            className="grid scroll-mt-24 gap-6 border-b border-[#071a2b]/10 py-10 last:border-0 sm:grid-cols-[80px_1fr] sm:py-12"
          >
            <h3 className="font-display text-5xl font-semibold text-blue-700">
              {letter}
            </h3>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {teams
                .filter((team) => team.name[0].toUpperCase() === letter)
                .map((team) => (
                  <Link
                    key={team.name}
                    href={`/games/${encodeURIComponent(team.name)}`}
                    className={`${tagSize(team.name)} group inline-flex items-center gap-2 border border-[#071a2b]/15 bg-[#fffdf8] px-4 py-3 font-display font-semibold tracking-[-0.025em] transition hover:-translate-y-0.5 hover:border-blue-700 hover:bg-blue-700 hover:text-white hover:shadow-[5px_5px_0_#071a2b]`}
                  >
                    {team.name}
                    <ArrowUpRightIcon className="h-4 w-4 opacity-35 transition group-hover:opacity-100" />
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
