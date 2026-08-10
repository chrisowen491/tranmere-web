"use client";

import {
  ArrowPathIcon,
  ArrowRightIcon,
  BoltIcon,
  HomeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { buildImagePath } from "@tranmere-web/lib/src/apiFunctions";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ManagerRecord } from "@/lib/managers";
import type { ManagerTrustedXi } from "@/lib/managerTrustedXi";
import { loadAllResultPages } from "@/lib/managerComparisonData";

interface FingerprintMetric {
  label: string;
  value: number;
  display: string;
  detail: string;
}

function managerImageSource(imagePath: string, width: number, height: number) {
  if (imagePath.startsWith("/") || /^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return buildImagePath(imagePath, width, height);
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
  const home =
    match.home === "Tranmere Rovers" ||
    (match.location === "H" && match.visitor !== "Tranmere Rovers");
  const scored = home ? match.hgoal : match.vgoal;
  const conceded = home ? match.vgoal : match.hgoal;
  return {
    home,
    scored,
    conceded,
    outcome: scored > conceded ? "W" : scored < conceded ? "L" : "D",
  };
}

function percentage(value: number, total: number) {
  return total ? (value / total) * 100 : 0;
}

function pointsPerGame(matches: Match[]) {
  if (!matches.length) return 0;
  const points = matches.reduce((total, match) => {
    const outcome = resultFor(match).outcome;
    return total + (outcome === "W" ? 3 : outcome === "D" ? 1 : 0);
  }, 0);
  return points / matches.length;
}

function fingerprintFor(matches: Match[]) {
  const results = matches.map(resultFor);
  const home = matches.filter((match) => resultFor(match).home);
  const away = matches.filter((match) => !resultFor(match).home);
  const won = results.filter((result) => result.outcome === "W").length;
  const unbeaten = results.filter((result) => result.outcome !== "L").length;
  const scored = results.filter((result) => result.scored > 0).length;
  const cleanSheets = results.filter((result) => result.conceded === 0).length;
  const goalsFor = results.reduce((total, result) => total + result.scored, 0);
  const goalsAgainst = results.reduce(
    (total, result) => total + result.conceded,
    0,
  );
  const homePpg = pointsPerGame(home);
  const awayPpg = pointsPerGame(away);

  const metrics: FingerprintMetric[] = [
    {
      label: "Winning",
      value: percentage(won, matches.length),
      display: `${percentage(won, matches.length).toFixed(0)}%`,
      detail: "matches won",
    },
    {
      label: "Front foot",
      value: percentage(scored, matches.length),
      display: `${percentage(scored, matches.length).toFixed(0)}%`,
      detail: "matches scored in",
    },
    {
      label: "Resilience",
      value: percentage(cleanSheets, matches.length),
      display: `${percentage(cleanSheets, matches.length).toFixed(0)}%`,
      detail: "clean sheets",
    },
    {
      label: "Consistency",
      value: percentage(unbeaten, matches.length),
      display: `${percentage(unbeaten, matches.length).toFixed(0)}%`,
      detail: "matches unbeaten",
    },
    {
      label: "Home force",
      value: (homePpg / 3) * 100,
      display: homePpg.toFixed(2),
      detail: "home points per game",
    },
    {
      label: "Away force",
      value: (awayPpg / 3) * 100,
      display: awayPpg.toFixed(2),
      detail: "away points per game",
    },
  ];

  const goalAverage = matches.length ? goalsFor / matches.length : 0;
  const concededAverage = matches.length ? goalsAgainst / matches.length : 0;
  let archetype = "The pragmatist";
  let summary =
    "A balanced record without one overwhelming trait defining the tenure.";

  if (goalAverage >= 1.65 && percentage(scored, matches.length) >= 75) {
    archetype = "The front-foot builder";
    summary =
      "This Rovers side was defined by regularly finding the net and carrying an attacking threat.";
  } else if (
    percentage(cleanSheets, matches.length) >= 35 &&
    concededAverage <= 1
  ) {
    archetype = "The defensive architect";
    summary =
      "Clean sheets and control without the ball were the strongest marks of this tenure.";
  } else if (homePpg - awayPpg >= 0.55) {
    archetype = "The Prenton Park specialist";
    summary =
      "The clearest edge came at home, where this side collected points at a notably stronger rate.";
  } else if (awayPpg - homePpg >= 0.35) {
    archetype = "The road operator";
    summary =
      "This side’s record travelled unusually well, with its strongest points return coming away.";
  } else if (percentage(unbeaten, matches.length) >= 70) {
    archetype = "The steady hand";
    summary =
      "Avoiding defeat was the defining habit, giving the team a dependable competitive floor.";
  }

  return {
    metrics,
    archetype,
    summary,
    goalsFor,
    goalsAgainst,
    goalAverage,
    concededAverage,
    homePpg,
    awayPpg,
  };
}

function matchHref(match: Match) {
  return `/match/${match.season}/${match.date.slice(0, 10)}`;
}

export function ManagerFingerprints({
  managers,
  initialManager,
  initialMatches,
  initialXi,
}: {
  managers: ManagerRecord[];
  initialManager: ManagerRecord;
  initialMatches: Match[];
  initialXi: ManagerTrustedXi;
}) {
  const [managerId, setManagerId] = useState(initialManager.id);
  const [manager, setManager] = useState(initialManager);
  const [matches, setMatches] = useState(initialMatches);
  const [xi, setXi] = useState(initialXi);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fingerprint = useMemo(() => fingerprintFor(matches), [matches]);
  const availableManagers = managers.filter(
    (item) =>
      item.dateLeft.toLowerCase().startsWith("now") ||
      item.dateLeft >= "1960-01-01",
  );
  const trustedCore = [...xi.rows.flat()]
    .sort((a, b) => b.starts - a.starts)
    .slice(0, 5);
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  async function analyse() {
    const selected = managers.find((item) => item.id === managerId);
    if (!selected) return;
    setLoading(true);
    setError("");
    const dateLeft = selected.dateLeft.toLowerCase().startsWith("now")
      ? new Date().toISOString().slice(0, 10)
      : selected.dateLeft;
    try {
      const [matchesResponse, xiResponse] = await Promise.all([
        loadAllResultPages({
          manager: `${selected.dateJoined},${dateLeft}`,
          sort: "Date",
        }),
        fetch(
          `/api/manager-trusted-xi?manager=${encodeURIComponent(selected.id)}`,
        ),
      ]);
      if (!xiResponse.ok) {
        throw new Error("The archive could not build this fingerprint.");
      }
      setMatches(matchesResponse);
      setXi((await xiResponse.json()) as ManagerTrustedXi);
      setManager(selected);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The archive could not build this fingerprint.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12">
          <label>
            <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/50">
              Managerial spell
            </span>
            <select
              value={managerId}
              onChange={(event) => setManagerId(event.target.value)}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-bold focus:border-blue-700 focus:outline-none lg:min-w-[34rem]"
            >
              {availableManagers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatDate(item.dateJoined)}–
                  {formatDate(item.dateLeft)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={analyse}
            disabled={loading || managerId === manager.id}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Reading the archive…" : "Reveal fingerprint"}
          </button>
          {error && (
            <p className="text-sm font-semibold text-red-800 lg:col-span-2">
              {error}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <div className="overflow-hidden bg-[#071a2b] text-white">
            <div className="relative p-7 sm:p-10">
              <div className="archive-grid absolute inset-0 opacity-20" />
              <div className="relative grid gap-8 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                    {formatDate(manager.dateJoined)}–
                    {formatDate(manager.dateLeft)}
                  </p>
                  <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                    {manager.name}
                  </h2>
                  <div className="mt-8 max-w-xl border-l-2 border-blue-400 pl-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                      Archive archetype
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-semibold">
                      {fingerprint.archetype}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/60">
                      {fingerprint.summary}
                    </p>
                  </div>
                </div>
                <div className="mx-auto aspect-[4/5] w-36 overflow-hidden border border-white/20 bg-white/5 sm:w-40">
                  {manager.imagePath ? (
                    <Image
                      src={managerImageSource(manager.imagePath, 400, 500)}
                      alt={`${manager.name}, Tranmere Rovers manager`}
                      width={400}
                      height={500}
                      unoptimized
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <span className="grid h-full place-items-center">
                      <UserIcon className="h-16 w-16 text-white/20" />
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
              {[
                ["Matches", matches.length],
                ["Goals for", fingerprint.goalsFor],
                ["Goals against", fingerprint.goalsAgainst],
                ["Points / game", pointsPerGame(matches).toFixed(2)],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="border-b border-r border-white/15 p-5 sm:border-b-0"
                >
                  <strong className="font-display text-3xl">{value}</strong>
                  <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6">
            <SparklesIcon className="h-6 w-6 text-blue-700" />
            <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#071a2b]/45">
              What this means
            </p>
            <p className="mt-4 text-sm leading-6 text-[#071a2b]/65">
              A fingerprint describes what repeatedly happened during a
              manager&rsquo;s spell. It is calculated from recorded results,
              venues, goals and exact player starts—not a subjective tactical
              rating.
            </p>
            <dl className="mt-7 space-y-4 border-t border-[#071a2b]/15 pt-6">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-[#071a2b]/55">Goals per match</dt>
                <dd className="font-mono font-bold">
                  {fingerprint.goalAverage.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-[#071a2b]/55">
                  Conceded per match
                </dt>
                <dd className="font-mono font-bold">
                  {fingerprint.concededAverage.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-[#071a2b]/55">Home PPG</dt>
                <dd className="font-mono font-bold">
                  {fingerprint.homePpg.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-[#071a2b]/55">Away PPG</dt>
                <dd className="font-mono font-bold">
                  {fingerprint.awayPpg.toFixed(2)}
                </dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          <div>
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#071a2b]/15 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Results DNA
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                  The six-point print
                </h2>
              </div>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-[#071a2b]/40 sm:block">
                Longer bars = stronger trait
              </span>
            </div>
            <div className="border border-[#071a2b]/15 bg-[#fffdf8]">
              {fingerprint.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="grid gap-3 border-b border-[#071a2b]/10 p-5 last:border-b-0 sm:grid-cols-[130px_1fr_72px] sm:items-center"
                >
                  <div>
                    <strong className="text-sm">{metric.label}</strong>
                    <span className="block text-[11px] text-[#071a2b]/45">
                      {metric.detail}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden bg-[#e8e2d6]">
                    <div
                      className="h-full bg-gradient-to-r from-blue-800 via-blue-600 to-emerald-500"
                      style={{
                        width: `${Math.max(2, Math.min(100, metric.value))}%`,
                      }}
                    />
                  </div>
                  <strong className="font-mono text-lg sm:text-right">
                    {metric.display}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div className="mb-6 border-b border-[#071a2b]/15 pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Selection identity
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                Trusted core
              </h2>
            </div>
            <ol className="border border-[#071a2b]/15 bg-[#fffdf8]">
              {trustedCore.map((player, index) => (
                <li
                  key={player.name}
                  className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b border-[#071a2b]/10 px-4 py-4 last:border-b-0"
                >
                  <span className="font-display text-2xl text-blue-700/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <Link
                      href={`/page/player/${encodeURIComponent(player.name)}`}
                      className="text-sm font-bold hover:text-blue-700"
                    >
                      {player.name}
                    </Link>
                    <span className="block text-[11px] text-[#071a2b]/45">
                      {player.position || "Player"}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold">
                    {player.starts}
                    <small className="ml-1 font-sans font-normal text-[#071a2b]/40">
                      starts
                    </small>
                  </span>
                </li>
              ))}
            </ol>
            <Link
              href="/managers/trusted-xi"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
            >
              See the complete trusted XI
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </aside>
        </section>

        <section className="mt-12">
          <div className="mb-6 border-b border-[#071a2b]/15 pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Last impressions
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
              Five most recent results
            </h2>
          </div>
          <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-5">
            {recentMatches.map((match) => {
              const result = resultFor(match);
              const opponent =
                match.opposition ||
                (result.home ? match.visitor : match.home) ||
                "Opponent";
              return (
                <Link
                  key={`${match.season}-${match.date}`}
                  href={matchHref(match)}
                  className="group bg-[#fffdf8] p-5 transition hover:bg-white"
                >
                  <span
                    className={`grid h-9 w-9 place-items-center font-mono text-xs font-black text-white ${
                      result.outcome === "W"
                        ? "bg-emerald-600"
                        : result.outcome === "D"
                          ? "bg-amber-600"
                          : "bg-red-700"
                    }`}
                  >
                    {result.outcome}
                  </span>
                  <strong className="mt-5 block text-sm group-hover:text-blue-700">
                    {opponent}
                  </strong>
                  <span className="mt-1 block font-mono text-xl font-bold">
                    {result.scored}–{result.conceded}
                  </span>
                  <span className="mt-3 block text-[10px] text-[#071a2b]/40">
                    {formatDate(match.date)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-3">
          {[
            {
              icon: TrophyIcon,
              title: "Compare the record",
              copy: "Put this tenure directly alongside another manager.",
              href: "/managers/comparison",
            },
            {
              icon: ShieldCheckIcon,
              title: "See the full XI",
              copy: "Explore the most-started team in a natural shape.",
              href: "/managers/trusted-xi",
            },
            {
              icon: HomeIcon,
              title: "Browse every manager",
              copy: "Return to the complete Prenton Park dugout archive.",
              href: "/managers",
            },
          ].map(({ icon: Icon, title, copy, href }) => (
            <Link
              key={title}
              href={href}
              className="group bg-[#fffdf8] p-6 transition hover:bg-white"
            >
              <Icon className="h-6 w-6 text-blue-700" />
              <h3 className="mt-6 font-display text-2xl font-semibold">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#071a2b]/55">{copy}</p>
              <BoltIcon className="mt-6 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
