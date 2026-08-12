import {
  ArrowUpRightIcon,
  ArrowsRightLeftIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";
import { getClubRecords } from "@/lib/clubs";
import { getTransfers } from "@/lib/transfers";

export const metadata: Metadata = {
  title: "Rovers connections",
  description:
    "Explore the players, transfers and matches connecting Tranmere Rovers with clubs across the football archive.",
};

function connectionHref(club: string) {
  return `/opponents/${encodeURIComponent(club)}`;
}

export default async function RoversConnectionsPage() {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const [clubs, transfers] = await Promise.all([
    getClubRecords(db),
    getTransfers(db),
  ]);
  const transferCounts = new Map<string, number>();

  transfers.forEach((transfer) => {
    const club =
      transfer.from === "Tranmere Rovers" ? transfer.to : transfer.from;
    if (club && club !== "Tranmere Rovers") {
      transferCounts.set(club, (transferCounts.get(club) || 0) + 1);
    }
  });

  const opponents = clubs.filter((club) => club.name !== "Tranmere Rovers");
  const strongestConnections = [...opponents]
    .sort(
      (a, b) =>
        (transferCounts.get(b.name) || 0) - (transferCounts.get(a.name) || 0) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 6);
  const letters = [
    ...new Set(opponents.map((club) => club.name.charAt(0).toUpperCase())),
  ];

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            The football family
          </p>
          <h1 className="mt-7 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
            Every club has
            <br />a Rovers connection.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Follow the players who moved between clubs, revisit every meeting
            and uncover the people who link Tranmere to the wider game.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-7 font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            <span>{opponents.length} clubs</span>
            <span>{transfers.length} recorded moves</span>
            <span>One connected archive</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Strongest links
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Familiar pathways.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#071a2b]/55">
            Ranked by the number of recorded arrivals and departures between
            each club and Tranmere.
          </p>
        </div>

        <div className="mt-8 grid border-l border-t border-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
          {strongestConnections.map((club, index) => {
            const count = transferCounts.get(club.name) || 0;
            return (
              <Link
                key={club.id}
                href={connectionHref(club.name)}
                className="group relative min-h-64 overflow-hidden border-b border-r border-[#071a2b]/15 bg-[#fffdf8] p-6 transition hover:bg-[#071a2b] hover:text-white"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundColor: club.primaryColour || "#1d4ed8" }}
                />
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-[#071a2b]/30 group-hover:text-white/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRightIcon className="h-5 w-5 text-blue-700 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-blue-300" />
                </div>
                <div className="mt-20">
                  <h3 className="font-display text-3xl font-semibold tracking-[-0.035em]">
                    {club.name}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/45 group-hover:text-white/50">
                    <ArrowsRightLeftIcon className="h-4 w-4" />
                    {count} recorded {count === 1 ? "move" : "moves"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <div className="grid gap-8 border-b border-[#071a2b]/15 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Club directory
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Find a connection.
              </h2>
            </div>
            <nav
              aria-label="Jump to club initial"
              className="flex max-w-2xl flex-wrap gap-1"
            >
              {letters.map((letter) => (
                <Link
                  key={letter}
                  href={`#connections-${letter.toLowerCase()}`}
                  className="grid h-9 min-w-9 place-items-center border border-[#071a2b]/15 px-2 font-mono text-xs font-bold transition hover:border-blue-700 hover:bg-blue-700 hover:text-white"
                >
                  {letter}
                </Link>
              ))}
            </nav>
          </div>

          {letters.map((letter) => (
            <section
              key={letter}
              id={`connections-${letter.toLowerCase()}`}
              className="grid scroll-mt-24 gap-6 border-b border-[#071a2b]/10 py-9 last:border-0 sm:grid-cols-[80px_1fr]"
            >
              <h3 className="font-display text-5xl font-semibold text-blue-700">
                {letter}
              </h3>
              <div className="grid gap-px bg-[#071a2b]/10 sm:grid-cols-2 lg:grid-cols-3">
                {opponents
                  .filter(
                    (club) => club.name.charAt(0).toUpperCase() === letter,
                  )
                  .map((club) => {
                    const count = transferCounts.get(club.name) || 0;
                    return (
                      <Link
                        key={club.id}
                        href={connectionHref(club.name)}
                        className="group flex min-h-20 items-center justify-between gap-4 bg-[#fffdf8] px-4 py-3 transition hover:bg-blue-700 hover:text-white"
                      >
                        <span className="font-display text-lg font-semibold">
                          {club.name}
                        </span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#071a2b]/35 group-hover:text-white/60">
                          {count > 0 && (
                            <>
                              <UserGroupIcon className="h-3.5 w-3.5" />
                              {count}
                            </>
                          )}
                          <ArrowUpRightIcon className="ml-1 h-4 w-4" />
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
