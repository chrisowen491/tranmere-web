"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface GoalkeeperSeasonRecord {
  player: string;
  season: number;
  matches: number;
  cleanSheets: number;
  goalsConceded: number;
  picLink: string;
}

type SortKey = "cleanSheets" | "matches" | "rate" | "goalsConceded";

export function GoalkeeperRecords({
  records,
}: {
  records: GoalkeeperSeasonRecord[];
}) {
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState("all");
  const [minimum, setMinimum] = useState(10);
  const [sort, setSort] = useState<SortKey>("cleanSheets");
  const seasons = [...new Set(records.map((record) => record.season))].sort(
    (a, b) => b - a,
  );
  const keepers = (() => {
    const totals = new Map<string, Omit<GoalkeeperSeasonRecord, "season">>();
    records
      .filter((record) => season === "all" || record.season === Number(season))
      .forEach((record) => {
        const current = totals.get(record.player) ?? {
          player: record.player,
          matches: 0,
          cleanSheets: 0,
          goalsConceded: 0,
          picLink: record.picLink,
        };
        current.matches += record.matches;
        current.cleanSheets += record.cleanSheets;
        current.goalsConceded += record.goalsConceded;
        totals.set(record.player, current);
      });
    return [...totals.values()]
      .map((record) => ({
        ...record,
        rate: record.matches ? (record.cleanSheets / record.matches) * 100 : 0,
      }))
      .filter(
        (record) =>
          record.matches >= minimum &&
          record.player.toLowerCase().includes(query.toLowerCase()),
      )
      .sort(
        (a, b) =>
          b[sort] - a[sort] ||
          b.cleanSheets - a.cleanSheets ||
          a.player.localeCompare(b.player),
      );
  })();

  return (
    <>
      <div className="grid gap-4 border border-[#071a2b]/15 bg-[#fffdf8] p-5 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
            Search goalkeeper
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search goalkeeper…"
            className="mt-2 w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold focus:border-blue-700 focus:outline-none"
          />
        </label>
        <label>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
            Season
          </span>
          <select
            value={season}
            onChange={(event) => setSeason(event.target.value)}
            className="mt-2 w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold"
          >
            <option value="all">All seasons</option>
            {seasons.map((value) => (
              <option key={value} value={value}>
                {value}/{String(value + 1).slice(-2)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
            Minimum matches
          </span>
          <select
            value={minimum}
            onChange={(event) => setMinimum(Number(event.target.value))}
            className="mt-2 w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold"
          >
            {[1, 5, 10, 25, 50].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#071a2b] text-white">
            <tr>
              {[
                ["Goalkeeper", null],
                ["Matches", "matches"],
                ["Clean sheets", "cleanSheets"],
                ["Clean-sheet rate", "rate"],
                ["Goals conceded", "goalsConceded"],
              ].map(([label, key]) => (
                <th
                  key={label}
                  className="px-5 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70"
                >
                  {key ? (
                    <button
                      onClick={() => setSort(key as SortKey)}
                      className={
                        sort === key ? "text-blue-300" : "hover:text-white"
                      }
                    >
                      {label}
                    </button>
                  ) : (
                    label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#071a2b]/10">
            {keepers.map((record, index) => (
              <tr key={record.player} className="hover:bg-blue-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-blue-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/page/player/${encodeURIComponent(record.player)}`}
                      className="h-12 w-12 shrink-0 overflow-hidden border border-[#071a2b]/10 bg-[#e8e2d6]"
                    >
                      <Image
                        src={record.picLink}
                        alt={`${record.player} avatar`}
                        width={96}
                        height={96}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <Link
                      href={`/page/player/${encodeURIComponent(record.player)}`}
                      className="font-display text-lg font-semibold hover:text-blue-700"
                    >
                      {record.player}
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono font-bold">
                  {record.matches}
                </td>
                <td className="px-5 py-4 font-mono text-lg font-bold text-blue-700">
                  {record.cleanSheets}
                </td>
                <td className="px-5 py-4 font-mono font-bold">
                  {record.rate.toFixed(1)}%
                </td>
                <td className="px-5 py-4 font-mono">{record.goalsConceded}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!keepers.length && (
          <div className="border-t border-[#071a2b]/15 p-8 text-center">
            <h3 className="font-display text-2xl font-semibold">
              No matching goalkeepers
            </h3>
            <p className="mt-2 text-sm text-[#071a2b]/60">
              Try another season or lower the minimum-match threshold.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
