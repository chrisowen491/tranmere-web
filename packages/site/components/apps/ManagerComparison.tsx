"use client";

import {
  ArrowPathIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import type { Manager, Match } from "@tranmere-web/lib/src/tranmere-web-types";
import {
  calculateManagerStats,
  formatManagerDate,
  getManagerSelections,
  loadManagerMatches,
  managerResult,
  type ManagerSelection,
  type ManagerStats,
} from "@/lib/managerComparisonData";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

function outcomeClass(result: "W" | "D" | "L") {
  return {
    W: "bg-blue-700",
    D: "bg-slate-500",
    L: "bg-red-700",
  }[result];
}

function StatRow({
  label,
  left,
  right,
  higherWins = true,
  suffix = "",
}: {
  label: string;
  left: number;
  right: number;
  higherWins?: boolean;
  suffix?: string;
}) {
  const leftBest = left !== right && (higherWins ? left > right : left < right);
  const rightBest =
    left !== right && (higherWins ? right > left : right < left);

  return (
    <div className="grid grid-cols-[1fr_1.25fr_1fr] items-center border-b border-[#071a2b]/10 px-4 py-4 last:border-b-0 sm:px-6">
      <strong
        className={`font-mono text-base ${leftBest ? "text-blue-700" : ""}`}
      >
        {left}
        {suffix}
      </strong>
      <span className="text-center font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/40">
        {label}
      </span>
      <strong
        className={`text-right font-mono text-base ${
          rightBest ? "text-blue-700" : ""
        }`}
      >
        {right}
        {suffix}
      </strong>
    </div>
  );
}

function ManagerSelect({
  label,
  value,
  disabledKey,
  selections,
  onChange,
}: {
  label: string;
  value: string;
  disabledKey: string;
  selections: ManagerSelection[];
  onChange: (key: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/50">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-bold focus:border-blue-700 focus:outline-none"
      >
        {selections.map((selection) => (
          <option
            key={selection.key}
            value={selection.key}
            disabled={selection.key === disabledKey}
          >
            {selection.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ManagerSummary({
  selection,
  stats,
  tenure,
}: {
  selection: ManagerSelection;
  stats: ManagerStats;
  tenure: string;
}) {
  const { manager, label } = selection;

  return (
    <div className="border-b border-[#071a2b]/15 p-6 lg:border-b-0 lg:border-r lg:last:border-l lg:last:border-r-0 lg:p-8">
      <div className="flex items-start gap-5">
        <div className="h-28 w-24 flex-none overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6]">
          {manager.imagePath ? (
            <Image
              src={manager.imagePath}
              alt={`${manager.name}, Tranmere Rovers manager`}
              width={240}
              height={280}
              unoptimized
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <span className="grid h-full place-items-center">
              <UserIcon className="h-12 w-12 text-[#071a2b]/20" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
            {tenure}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
            {manager.name}
          </h2>
          <p className="mt-3 text-sm text-[#071a2b]/50">
            {label.split(" · ")[1]}
          </p>
        </div>
      </div>
      <p className="mt-8 font-display text-6xl font-semibold text-blue-700">
        {stats.winRate.toFixed(1)}
        <span className="text-2xl">%</span>
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#071a2b]/40">
        Win rate
      </p>
    </div>
  );
}

function LatestMatches({
  selection,
  matches,
}: {
  selection: ManagerSelection;
  matches: Match[];
}) {
  const latestMatches = matches
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="border-b border-[#071a2b]/15 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Latest matches
        </p>
        <h3 className="mt-2 font-display text-3xl font-semibold">
          {selection.manager.name}
        </h3>
      </div>
      <div className="border-x border-[#071a2b]/15">
        {latestMatches.map((match) => {
          const result = managerResult(match);
          return (
            <Link
              key={`${match.season}-${match.date}`}
              href={`/match/${match.season}/${match.date.slice(0, 10)}`}
              className="group grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-[#071a2b]/15 bg-[#fffdf8] p-3 transition hover:bg-blue-50"
            >
              <span
                className={`grid h-8 w-8 place-items-center font-mono text-[10px] font-bold text-white ${outcomeClass(result.label)}`}
              >
                {result.label}
              </span>
              <span>
                <span className="block text-sm font-bold">
                  {match.opposition}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#071a2b]/40">
                  {formatManagerDate(match.date)}
                </span>
              </span>
              <span className="flex items-center gap-2 font-mono text-xs font-bold">
                {result.scored}–{result.conceded}
                <ArrowRightIcon className="h-3.5 w-3.5 text-[#071a2b]/25 transition group-hover:translate-x-1 group-hover:text-blue-700" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ManagerComparison({
  managers,
  initialMatches,
  initialManagerIndexes,
}: {
  managers: Manager[];
  initialMatches: [Match[], Match[]];
  initialManagerIndexes: [number, number];
}) {
  const selections = getManagerSelections(managers);
  const [leftKey, setLeftKey] = useState(
    selections[initialManagerIndexes[0]]?.key || "",
  );
  const [rightKey, setRightKey] = useState(
    selections[initialManagerIndexes[1]]?.key || "",
  );
  const [leftMatches, setLeftMatches] = useState(initialMatches[0]);
  const [rightMatches, setRightMatches] = useState(initialMatches[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const comparisonRequest = useRef(0);
  const leftManager = selections.find((item) => item.key === leftKey)!;
  const rightManager = selections.find((item) => item.key === rightKey)!;
  const leftStats = calculateManagerStats(leftMatches);
  const rightStats = calculateManagerStats(rightMatches);

  async function compare(nextLeftKey = leftKey, nextRightKey = rightKey) {
    const nextLeftManager = selections.find((item) => item.key === nextLeftKey);
    const nextRightManager = selections.find(
      (item) => item.key === nextRightKey,
    );

    if (!nextLeftManager || !nextRightManager || nextLeftKey === nextRightKey) {
      return;
    }

    const requestId = comparisonRequest.current + 1;
    comparisonRequest.current = requestId;
    setLoading(true);
    setError("");

    try {
      const [left, right] = await Promise.all([
        loadManagerMatches(nextLeftManager),
        loadManagerMatches(nextRightManager),
      ]);

      if (comparisonRequest.current !== requestId) return;

      setLeftMatches(left);
      setRightMatches(right);
    } catch {
      if (comparisonRequest.current === requestId) {
        setError("Unable to update the comparison. Please try again.");
      }
    } finally {
      if (comparisonRequest.current === requestId) {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
            <ManagerSelect
              label="First manager"
              value={leftKey}
              disabledKey={rightKey}
              selections={selections}
              onChange={(nextKey) => {
                setLeftKey(nextKey);
                void compare(nextKey, rightKey);
              }}
            />
            <span className="hidden pb-3 font-display text-2xl text-[#071a2b]/30 lg:block">
              vs
            </span>
            <ManagerSelect
              label="Second manager"
              value={rightKey}
              disabledKey={leftKey}
              selections={selections}
              onChange={(nextKey) => {
                setRightKey(nextKey);
                void compare(leftKey, nextKey);
              }}
            />
            <button
              type="button"
              onClick={() => void compare()}
              disabled={loading || leftKey === rightKey}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Comparing…" : "Compare"}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm font-semibold text-red-800">{error}</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <section className="grid border border-[#071a2b]/15 bg-[#fffdf8] lg:grid-cols-[1fr_1.2fr_1fr]">
          <ManagerSummary
            selection={leftManager}
            stats={leftStats}
            tenure="First tenure"
          />

          <div className="order-3 border-t border-[#071a2b]/15 lg:order-none lg:border-x-0 lg:border-y-0">
            <div className="bg-[#071a2b] px-5 py-4 text-center text-white">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
                Head-to-head metrics
              </p>
            </div>
            <StatRow
              label="Matches"
              left={leftStats.played}
              right={rightStats.played}
            />
            <StatRow label="Wins" left={leftStats.won} right={rightStats.won} />
            <StatRow
              label="Draws"
              left={leftStats.drawn}
              right={rightStats.drawn}
            />
            <StatRow
              label="Losses"
              left={leftStats.lost}
              right={rightStats.lost}
              higherWins={false}
            />
            <StatRow
              label="Goals for"
              left={leftStats.goalsFor}
              right={rightStats.goalsFor}
            />
            <StatRow
              label="Goals against"
              left={leftStats.goalsAgainst}
              right={rightStats.goalsAgainst}
              higherWins={false}
            />
          </div>

          <ManagerSummary
            selection={rightManager}
            stats={rightStats}
            tenure="Second tenure"
          />
        </section>

        <section className="mt-8 grid border-l border-t border-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Points per game",
              left: leftStats.pointsPerGame.toFixed(2),
              right: rightStats.pointsPerGame.toFixed(2),
              icon: ChartBarIcon,
            },
            {
              label: "Best winning run",
              left: leftStats.bestWinningRun,
              right: rightStats.bestWinningRun,
              icon: TrophyIcon,
            },
            {
              label: "Best unbeaten run",
              left: leftStats.bestUnbeatenRun,
              right: rightStats.bestUnbeatenRun,
              icon: FireIcon,
            },
            {
              label: "Home / away win rate",
              left: `${leftStats.homeWinRate.toFixed(0)} / ${leftStats.awayWinRate.toFixed(0)}%`,
              right: `${rightStats.homeWinRate.toFixed(0)} / ${rightStats.awayWinRate.toFixed(0)}%`,
              icon: CalendarDaysIcon,
            },
          ].map(({ label, left, right, icon: Icon }) => (
            <div
              key={label}
              className="border-b border-r border-[#071a2b]/15 bg-[#fffdf8] p-5"
            >
              <Icon className="h-5 w-5 text-blue-700" />
              <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/40">
                {label}
              </p>
              <div className="mt-3 flex items-center justify-between gap-4 font-display text-2xl font-semibold">
                <span>{left}</span>
                <span className="text-[#071a2b]/20">/</span>
                <span className="text-right">{right}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <LatestMatches selection={leftManager} matches={leftMatches} />
          <LatestMatches selection={rightManager} matches={rightMatches} />
        </section>
      </div>
    </div>
  );
}
