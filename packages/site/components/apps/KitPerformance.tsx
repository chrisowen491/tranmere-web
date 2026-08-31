"use client";

import type { KitPerformance as KitPerformanceData } from "@/lib/shirts";
import { ResultTable } from "@/components/apps/partials/ResultTable";
import Image from "next/image";
import Link from "next/link";

function matchHref(match: KitPerformanceData["matches"][number]) {
  return `/match/${match.season}/${match.date}`;
}

function recordCells(record: KitPerformanceData["overall"]) {
  return [
    ["Pld", record.played],
    ["Won", record.won],
    ["Drawn", record.drawn],
    ["Lost", record.lost],
    ["For", record.goalsFor],
    ["Against", record.goalsAgainst],
  ] as const;
}

export function KitPerformance({
  performance,
  shirtName,
}: {
  performance: KitPerformanceData | null;
  shirtName: string;
}) {
  if (!performance || performance.matches.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 pb-12 sm:px-10 lg:px-12">
        <div className="border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Kit performance
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            No confirmed match usage yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#071a2b]/60">
            Results appear here only when this kit has been explicitly recorded
            on a match. Season associations are not treated as match evidence.
          </p>
        </div>
      </section>
    );
  }

  const notableMatches = [
    ...performance.honourMatches.map(({ match, title, kind }) => ({
      match,
      label: `${kind}: ${title}`,
    })),
    ...performance.biggestWins.slice(0, 3).map((match) => ({
      match,
      label: "Biggest win in this kit",
    })),
    ...performance.cupTies.slice(0, 4).map((match) => ({
      match,
      label: match.competition,
    })),
  ].filter(
    (item, index, items) =>
      items.findIndex(({ match }) => match.id === item.match.id) === index,
  );

  return (
    <section className="mx-auto max-w-7xl px-6 pb-12 sm:px-10 lg:px-12">
      <div className="overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="grid bg-[#071a2b] text-white lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative hidden min-h-56 overflow-hidden border-r border-white/15 bg-[#132c82] lg:block">
            <Image
              src={`/builder/${performance.kitCode}/simple/cccccc/none/cccccc/cccccc/none/cccccc`}
              alt={`${shirtName} avatar-builder artwork`}
              fill
              unoptimized
              className="object-cover object-top"
            />
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
              Confirmed match usage
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
              Performance in this kit
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Based only on competitive matches where the Games record
              explicitly names this kit. A season listed against the shirt does
              not count by itself.
            </p>
            <dl className="mt-7 grid grid-cols-3 border-l border-t border-white/15 sm:grid-cols-6">
              {recordCells(performance.overall).map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-r border-white/15 p-3 sm:p-4"
                >
                  <dd className="font-mono text-2xl font-bold">{value}</dd>
                  <dt className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    {label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="grid gap-px bg-[#071a2b]/15 lg:grid-cols-2">
          {[
            ["Venue split", performance.byVenue],
            ["Competition split", performance.byCompetition],
          ].map(([title, rows]) => (
            <div key={title as string} className="bg-[#fffdf8] p-5 sm:p-6">
              <h3 className="font-display text-2xl font-semibold">
                {title as string}
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#e8e2d6] font-mono text-[10px] uppercase tracking-[0.1em] text-[#071a2b]/55">
                    <tr>
                      <th className="px-3 py-3 text-left">Record</th>
                      <th className="px-2 py-3 text-center">P</th>
                      <th className="px-2 py-3 text-center">W</th>
                      <th className="px-2 py-3 text-center">D</th>
                      <th className="px-2 py-3 text-center">L</th>
                      <th className="px-2 py-3 text-center">GF</th>
                      <th className="px-2 py-3 text-center">GA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#071a2b]/10">
                    {(rows as KitPerformanceData["byVenue"]).map((row) => (
                      <tr key={row.label} className="hover:bg-blue-50/60">
                        <th className="px-3 py-3 text-left font-semibold">
                          {row.label}
                        </th>
                        {[
                          row.played,
                          row.won,
                          row.drawn,
                          row.lost,
                          row.goalsFor,
                          row.goalsAgainst,
                        ].map((value, index) => (
                          <td
                            key={index}
                            className="px-2 py-3 text-center font-mono"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {notableMatches.length > 0 && (
        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Archive highlights
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Notable matches
          </h2>
          <div className="mt-5 grid gap-px bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
            {notableMatches.map(({ match, label }) => (
              <Link
                key={match.id}
                href={matchHref(match)}
                className="bg-[#fffdf8] p-5 transition hover:bg-[#e8e2d6]"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                  {label}
                </span>
                <span className="mt-3 block font-display text-xl font-semibold">
                  {match.opposition} · {match.ft}
                </span>
                <span className="mt-2 block font-mono text-xs text-[#071a2b]/50">
                  {match.date}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ResultTable
        title="Matches with confirmed kit usage"
        results={performance.matches}
        fullDate
      />
    </section>
  );
}
