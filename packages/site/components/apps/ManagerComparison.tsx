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
import { buildImagePath } from "@tranmere-web/lib/src/apiFunctions";
import type { Manager, Match } from "@tranmere-web/lib/src/tranmere-web-types";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

interface ManagerSelection {
  manager: Manager;
  key: string;
  label: string;
}

interface ManagerStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  winRate: number;
  pointsPerGame: number;
  bestWinningRun: number;
  bestUnbeatenRun: number;
  homeWinRate: number;
  awayWinRate: number;
}

function managerImageSource(imagePath: string, width: number, height: number) {
  if (imagePath.startsWith("/") || /^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return buildImagePath(imagePath, width, height);
}

function managerKey(manager: Manager) {
  return `${manager.name}|${manager.dateJoined}|${manager.dateLeft}`;
}

function formatDate(value: string) {
  if (value.toLowerCase().startsWith("now")) return "present";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function resultFor(match: Match) {
  const home = match.home === "Tranmere Rovers";
  const scored = home ? match.hgoal : match.vgoal;
  const conceded = home ? match.vgoal : match.hgoal;
  return {
    label: scored > conceded ? "W" : scored < conceded ? "L" : "D",
    scored,
    conceded,
    home,
  };
}

function winRate(matches: Match[]) {
  if (!matches.length) return 0;
  return (
    (matches.filter((match) => resultFor(match).label === "W").length /
      matches.length) *
    100
  );
}

function calculateStats(matches: Match[]): ManagerStats {
  const chronological = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  let winningRun = 0;
  let unbeatenRun = 0;
  let bestWinningRun = 0;
  let bestUnbeatenRun = 0;
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  chronological.forEach((match) => {
    const result = resultFor(match);
    goalsFor += result.scored;
    goalsAgainst += result.conceded;

    if (result.label === "W") {
      won += 1;
      winningRun += 1;
      unbeatenRun += 1;
    } else if (result.label === "D") {
      drawn += 1;
      winningRun = 0;
      unbeatenRun += 1;
    } else {
      lost += 1;
      winningRun = 0;
      unbeatenRun = 0;
    }

    bestWinningRun = Math.max(bestWinningRun, winningRun);
    bestUnbeatenRun = Math.max(bestUnbeatenRun, unbeatenRun);
  });

  const homeMatches = matches.filter((match) => resultFor(match).home);
  const awayMatches = matches.filter((match) => !resultFor(match).home);

  return {
    played: matches.length,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    winRate: matches.length ? (won / matches.length) * 100 : 0,
    pointsPerGame: matches.length ? (won * 3 + drawn) / matches.length : 0,
    bestWinningRun,
    bestUnbeatenRun,
    homeWinRate: winRate(homeMatches),
    awayWinRate: winRate(awayMatches),
  };
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

export function ManagerComparison({
  managers,
  initialMatches,
  initialManagerIndexes,
}: {
  managers: Manager[];
  initialMatches: [Match[], Match[]];
  initialManagerIndexes: [number, number];
}) {
  const selections: ManagerSelection[] = managers.map((manager) => ({
    manager,
    key: managerKey(manager),
    label: `${manager.name} · ${formatDate(manager.dateJoined)}–${formatDate(
      manager.dateLeft,
    )}`,
  }));
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
  const leftStats = calculateStats(leftMatches);
  const rightStats = calculateStats(rightMatches);

  async function compare(
    nextLeftKey = leftKey,
    nextRightKey = rightKey,
  ) {
    const nextLeftManager = selections.find(
      (item) => item.key === nextLeftKey,
    );
    const nextRightManager = selections.find(
      (item) => item.key === nextRightKey,
    );

    if (
      !nextLeftManager ||
      !nextRightManager ||
      nextLeftKey === nextRightKey
    ) {
      return;
    }

    const requestId = comparisonRequest.current + 1;
    comparisonRequest.current = requestId;
    setLoading(true);
    setError("");
    const loadMatches = async (selection: ManagerSelection) => {
      const manager = selection.manager;
      const dateLeft = manager.dateLeft.toLowerCase().startsWith("now")
        ? new Date().toISOString().slice(0, 10)
        : manager.dateLeft;
      const response = await fetch(
        `/api/result-search?manager=${encodeURIComponent(
          `${manager.dateJoined},${dateLeft}`,
        )}&sort=Date`,
      );
      if (!response.ok) throw new Error("Unable to load manager results");
      return ((await response.json()) as { results: Match[] }).results;
    };

    try {
      const [left, right] = await Promise.all([
        loadMatches(nextLeftManager),
        loadMatches(nextRightManager),
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
            <label>
              <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/50">
                First manager
              </span>
              <select
                value={leftKey}
                onChange={(event) => {
                  const nextKey = event.target.value;
                  setLeftKey(nextKey);
                  void compare(nextKey, rightKey);
                }}
                className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-bold focus:border-blue-700 focus:outline-none"
              >
                {selections.map((item) => (
                  <option
                    key={item.key}
                    value={item.key}
                    disabled={item.key === rightKey}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <span className="hidden pb-3 font-display text-2xl text-[#071a2b]/30 lg:block">
              vs
            </span>
            <label>
              <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/50">
                Second manager
              </span>
              <select
                value={rightKey}
                onChange={(event) => {
                  const nextKey = event.target.value;
                  setRightKey(nextKey);
                  void compare(leftKey, nextKey);
                }}
                className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-bold focus:border-blue-700 focus:outline-none"
              >
                {selections.map((item) => (
                  <option
                    key={item.key}
                    value={item.key}
                    disabled={item.key === leftKey}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
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
          <div className="border-b border-[#071a2b]/15 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="flex items-start gap-5">
              <div className="h-28 w-24 flex-none overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6]">
                {leftManager?.manager.imagePath ? (
                  <Image
                    src={managerImageSource(
                      leftManager.manager.imagePath,
                      240,
                      280,
                    )}
                    alt={`${leftManager.manager.name}, Tranmere Rovers manager`}
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
                  First tenure
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
                  {leftManager?.manager.name}
                </h2>
                <p className="mt-3 text-sm text-[#071a2b]/50">
                  {leftManager?.label.split(" · ")[1]}
                </p>
              </div>
            </div>
            <p className="mt-8 font-display text-6xl font-semibold text-blue-700">
              {leftStats.winRate.toFixed(1)}
              <span className="text-2xl">%</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#071a2b]/40">
              Win rate
            </p>
          </div>

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

          <div className="border-b border-[#071a2b]/15 p-6 lg:border-b-0 lg:border-l lg:p-8">
            <div className="flex items-start gap-5">
              <div className="h-28 w-24 flex-none overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6]">
                {rightManager?.manager.imagePath ? (
                  <Image
                    src={managerImageSource(
                      rightManager.manager.imagePath,
                      240,
                      280,
                    )}
                    alt={`${rightManager.manager.name}, Tranmere Rovers manager`}
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
                  Second tenure
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
                  {rightManager?.manager.name}
                </h2>
                <p className="mt-3 text-sm text-[#071a2b]/50">
                  {rightManager?.label.split(" · ")[1]}
                </p>
              </div>
            </div>
            <p className="mt-8 font-display text-6xl font-semibold text-blue-700">
              {rightStats.winRate.toFixed(1)}
              <span className="text-2xl">%</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#071a2b]/40">
              Win rate
            </p>
          </div>
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
          {[
            [leftManager, leftMatches],
            [rightManager, rightMatches],
          ].map(([selection, matches], columnIndex) => {
            const managerSelection = selection as ManagerSelection;
            const managerMatches = (matches as Match[])
              .toSorted(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .slice(0, 5);
            return (
              <div key={`${managerSelection.key}-${columnIndex}`}>
                <div className="border-b border-[#071a2b]/15 pb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    Latest matches
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold">
                    {managerSelection.manager.name}
                  </h3>
                </div>
                <div className="border-x border-[#071a2b]/15">
                  {managerMatches.map((match) => {
                    const result = resultFor(match);
                    return (
                      <Link
                        key={`${match.season}-${match.date}`}
                        href={`/match/${match.season}/${match.date.slice(0, 10)}`}
                        className="group grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-[#071a2b]/15 bg-[#fffdf8] p-3 transition hover:bg-blue-50"
                      >
                        <span
                          className={`grid h-8 w-8 place-items-center font-mono text-[10px] font-bold text-white ${
                            result.label === "W"
                              ? "bg-blue-700"
                              : result.label === "L"
                                ? "bg-red-700"
                                : "bg-slate-500"
                          }`}
                        >
                          {result.label}
                        </span>
                        <span>
                          <span className="block text-sm font-bold">
                            {match.opposition}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#071a2b]/40">
                            {new Date(match.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
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
          })}
        </section>
      </div>
    </div>
  );
}
