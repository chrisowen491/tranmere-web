"use client";

import {
  ArrowPathIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  StarIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ManagerRecord } from "@/lib/managers";
import type {
  ManagerTrustedXi as ManagerTrustedXiData,
  TrustedXiPlayer,
} from "@/lib/managerTrustedXi";

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

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
}

function PlayerMarker({
  player,
  captain,
}: {
  player: TrustedXiPlayer;
  captain: boolean;
}) {
  return (
    <Link
      href={`/page/player/${encodeURIComponent(player.name)}`}
      className="group flex w-[4.5rem] flex-col items-center text-center sm:w-28"
    >
      <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-white/70 bg-[#071a2b] text-xs font-bold shadow-lg transition group-hover:scale-105 group-hover:border-blue-200 sm:h-24 sm:w-24">
        {player.picLink ? (
          <Image
            src={player.picLink}
            alt=""
            width={112}
            height={112}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          initials(player.name)
        )}
        {captain && (
          <span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-blue-700 font-mono text-[9px] font-black text-white ring-2 ring-white">
            C
          </span>
        )}
      </span>
      <strong className="mt-2 max-w-full text-[0.68rem] leading-tight sm:text-xs">
        {player.name}
      </strong>
      <span className="mt-1 font-mono text-[9px] text-white/55">
        {player.starts} starts
      </span>
    </Link>
  );
}

export function ManagerTrustedXi({
  managers,
  initialXi,
}: {
  managers: ManagerRecord[];
  initialXi: ManagerTrustedXiData;
}) {
  const [managerId, setManagerId] = useState(initialXi.manager.id);
  const [xi, setXi] = useState(initialXi);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const availableManagers = managers.filter(
    (manager) =>
      manager.dateLeft.toLowerCase().startsWith("now") ||
      manager.dateLeft >= "1977-01-01",
  );
  const allPlayers = xi.rows.flat();
  const totalStarts = allPlayers.reduce(
    (total, player) => total + player.starts,
    0,
  );
  const totalGoals = allPlayers.reduce(
    (total, player) => total + player.goals,
    0,
  );

  async function buildXi() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/manager-trusted-xi?manager=${encodeURIComponent(managerId)}`,
      );
      const data = (await response.json()) as ManagerTrustedXiData & {
        error?: string;
      };
      if (!response.ok) throw new Error(data.error);
      setXi(data);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The trusted XI could not be calculated.",
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
              {availableManagers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} · {formatDate(manager.dateJoined)}–
                  {formatDate(manager.dateLeft)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={buildXi}
            disabled={loading || managerId === xi.manager.id}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Analysing appearances…" : "Build trusted XI"}
          </button>
          {error && (
            <p className="text-sm text-red-800 lg:col-span-2">{error}</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#071a2b]/15 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  {xi.formation} · Most starts by position
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                  {xi.manager.name}&rsquo;s trusted XI.
                </h2>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/40">
                Captain: {xi.captain}
              </span>
            </div>

            <div className="fantasy-pitch relative min-h-[720px] overflow-hidden border border-[#071a2b]/25 bg-blue-900 px-3 py-8 text-white sm:px-8">
              <div className="pointer-events-none absolute inset-4 border border-white/25" />
              <div className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-white/25" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
              <div className="relative z-10 flex min-h-[654px] flex-col justify-between">
                {xi.rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex min-h-32 items-center justify-around gap-1"
                  >
                    {row.map((player) => (
                      <PlayerMarker
                        key={player.name}
                        player={player}
                        captain={player.name === xi.captain}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="bg-[#071a2b] p-6 text-white">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
                Managerial record
              </p>
              <h3 className="mt-3 font-display text-3xl font-semibold">
                {xi.manager.name}
              </h3>
              <p className="mt-2 text-xs text-white/45">
                {formatDate(xi.manager.dateJoined)}–
                {formatDate(xi.manager.dateLeft)}
              </p>
              <div className="mt-7 grid grid-cols-3 divide-x divide-white/15 text-center">
                {[
                  ["Won", xi.wins],
                  ["Drawn", xi.draws],
                  ["Lost", xi.losses],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <strong className="font-display text-3xl">{value}</strong>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-white/40">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 border-l border-t border-[#071a2b]/15">
              {[
                {
                  value: xi.matches,
                  label: "Matches",
                  icon: CalendarDaysIcon,
                },
                {
                  value: totalStarts,
                  label: "XI starts",
                  icon: ChartBarIcon,
                },
                {
                  value: totalGoals,
                  label: "XI goals",
                  icon: TrophyIcon,
                },
                {
                  value: xi.formation,
                  label: "Shape",
                  icon: ShieldCheckIcon,
                },
              ].map(({ value, label, icon: Icon }) => (
                <div
                  key={String(label)}
                  className="border-b border-r border-[#071a2b]/15 bg-[#fffdf8] p-5"
                >
                  <Icon className="h-5 w-5 text-blue-700" />
                  <strong className="mt-5 block font-display text-3xl">
                    {value}
                  </strong>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#071a2b]/40">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-5">
              <StarIcon className="h-5 w-5 text-blue-700" />
              <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
                Selection method
              </p>
              <p className="mt-3 text-sm leading-6 text-[#071a2b]/60">
                Players are ranked by starts made between the manager&rsquo;s
                exact appointment and departure dates, then placed using their
                primary position. Duplicate match appearances are counted once.
              </p>
              <p className="mt-3 text-xs text-[#071a2b]/40">
                Individual appearance coverage begins with the{" "}
                {xi.archiveStarts} season.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-14">
          <div className="border-b border-[#071a2b]/15 pb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Selection breakdown
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Who earned the manager&rsquo;s trust?
            </h2>
          </div>
          <div className="grid border-l border-t border-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
            {[...allPlayers]
              .sort((a, b) => b.starts - a.starts)
              .map((player, index) => (
                <Link
                  key={player.name}
                  href={`/page/player/${encodeURIComponent(player.name)}`}
                  className="group flex items-center gap-4 border-b border-r border-[#071a2b]/15 bg-[#fffdf8] p-4 transition hover:bg-blue-50"
                >
                  <span className="font-mono text-xs font-bold text-[#071a2b]/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate font-display text-lg">
                      {player.name}
                    </strong>
                    <span className="text-xs text-[#071a2b]/45">
                      {player.position || "Player"}
                    </span>
                  </span>
                  <span className="text-right font-mono text-xs">
                    <strong className="block text-blue-700">
                      {player.starts}
                    </strong>
                    <span className="text-[#071a2b]/35">starts</span>
                  </span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
