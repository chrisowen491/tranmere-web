"use client";

import {
  ArrowPathIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  FireIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { Player } from "@tranmere-web/lib/src/tranmere-web-types";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  PartnershipMatch,
  PlayerPartnership,
} from "@/lib/playerPartnership";

function seasonLabel(season: string) {
  return `${season}/${String(Number(season) + 1).slice(-2)}`;
}

function longestRun(matches: PartnershipMatch[], target: "W" | "unbeaten") {
  let run = 0;
  let best = 0;
  [...matches].reverse().forEach((match) => {
    const continues =
      target === "W"
        ? match.result === "W"
        : match.result === "W" || match.result === "D";
    run = continues ? run + 1 : 0;
    best = Math.max(best, run);
  });
  return best;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

function PlayerAutosuggest({
  id,
  label,
  players,
  value,
  onChange,
  excludedPlayer,
}: {
  id: string;
  label: string;
  players: Player[];
  value: string;
  onChange: (name: string) => void;
  excludedPlayer: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => {
    const search = query.trim().toLowerCase();
    return players
      .filter(
        (player) =>
          player.name !== excludedPlayer &&
          (!search || player.name.toLowerCase().includes(search)),
      )
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(search);
        const bStarts = b.name.toLowerCase().startsWith(search);
        return (
          Number(bStarts) - Number(aStarts) || a.name.localeCompare(b.name)
        );
      })
      .slice(0, 8);
  }, [excludedPlayer, players, query]);

  function selectPlayer(player: Player) {
    onChange(player.name);
    setQuery(player.name);
    setOpen(false);
    setActiveIndex(0);
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/50"
      >
        {label}
      </label>
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-[#071a2b]/35"
          aria-hidden="true"
        />
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={`${id}-suggestions`}
          aria-expanded={open}
          aria-activedescendant={
            open && suggestions[activeIndex]
              ? `${id}-option-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          value={query}
          onFocus={() => {
            setOpen(true);
            setActiveIndex(0);
          }}
          onBlur={() => {
            setOpen(false);
            setQuery(value);
          }}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setOpen(true);
            setActiveIndex(0);
            const exactMatch = players.find(
              (player) =>
                player.name.toLowerCase() === nextQuery.trim().toLowerCase() &&
                player.name !== excludedPlayer,
            );
            if (exactMatch) onChange(exactMatch.name);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) =>
                Math.min(index + 1, suggestions.length - 1),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              const suggestion = suggestions[activeIndex];
              if (suggestion) selectPlayer(suggestion);
            } else if (event.key === "Escape") {
              setOpen(false);
              setQuery(value);
            }
          }}
          className="w-full border border-[#071a2b]/20 bg-[#fffdf8] py-3 pl-11 pr-10 text-sm font-bold focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
        />
        {query === value && (
          <CheckIcon
            className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 text-emerald-600"
            aria-hidden="true"
          />
        )}

        {open && (
          <div
            id={`${id}-suggestions`}
            role="listbox"
            className="absolute z-30 mt-1 max-h-80 w-full overflow-y-auto border border-[#071a2b]/20 bg-[#fffdf8] shadow-xl"
          >
            {suggestions.length > 0 ? (
              suggestions.map((player, index) => (
                <button
                  id={`${id}-option-${index}`}
                  key={player.name}
                  type="button"
                  role="option"
                  aria-selected={player.name === value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectPlayer(player)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-between gap-4 border-b border-[#071a2b]/10 px-4 py-3 text-left last:border-b-0 ${
                    index === activeIndex
                      ? "bg-blue-700 text-white"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <span className="font-semibold">{player.name}</span>
                  <span
                    className={`text-xs ${
                      index === activeIndex
                        ? "text-white/65"
                        : "text-[#071a2b]/45"
                    }`}
                  >
                    {player.position || "Rovers player"}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-4 py-5 text-sm text-[#071a2b]/50">
                No players match “{query}”.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function PlayerPartnershipExplorer({
  players,
  initialPartnership,
}: {
  players: Player[];
  initialPartnership: PlayerPartnership;
}) {
  const sortedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const [firstPlayer, setFirstPlayer] = useState(
    initialPartnership.firstPlayer,
  );
  const [secondPlayer, setSecondPlayer] = useState(
    initialPartnership.secondPlayer,
  );
  const [partnership, setPartnership] = useState(initialPartnership);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function explore() {
    if (firstPlayer === secondPlayer) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/player-partnership?first=${encodeURIComponent(
          firstPlayer,
        )}&second=${encodeURIComponent(secondPlayer)}`,
      );
      const data = (await response.json()) as PlayerPartnership & {
        error?: string;
      };
      if (!response.ok) throw new Error(data.error);
      setPartnership(data);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The partnership could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  const matches = partnership.matches;
  const wins = matches.filter((match) => match.result === "W").length;
  const draws = matches.filter((match) => match.result === "D").length;
  const losses = matches.filter((match) => match.result === "L").length;
  const combinedGoals = matches.reduce(
    (total, match) => total + match.firstPlayerGoals + match.secondPlayerGoals,
    0,
  );
  const biggestWin = matches
    .filter(
      (match) =>
        match.result === "W" &&
        match.scored !== null &&
        match.conceded !== null,
    )
    .toSorted(
      (a, b) =>
        b.scored! - b.conceded! - (a.scored! - a.conceded!) ||
        b.scored! - a.scored!,
    )[0];
  const firstDetails = players.find(
    (player) => player.name === partnership.firstPlayer,
  );
  const secondDetails = players.find(
    (player) => player.name === partnership.secondPlayer,
  );

  return (
    <div>
      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
            <PlayerAutosuggest
              id="first-partnership-player"
              label="First player"
              players={sortedPlayers}
              value={firstPlayer}
              excludedPlayer={secondPlayer}
              onChange={setFirstPlayer}
            />
            <span className="hidden pb-3 font-display text-2xl text-[#071a2b]/30 lg:block">
              +
            </span>
            <PlayerAutosuggest
              id="second-partnership-player"
              label="Second player"
              players={sortedPlayers}
              value={secondPlayer}
              excludedPlayer={firstPlayer}
              onChange={setSecondPlayer}
            />
            <button
              type="button"
              onClick={explore}
              disabled={loading || firstPlayer === secondPlayer}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Finding matches…" : "Explore"}
            </button>
          </div>
          {error && (
            <p className="mt-4 border-l-2 border-red-700 pl-3 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <section className="grid overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8] lg:grid-cols-[1fr_280px_1fr]">
          {[
            [firstDetails, partnership.firstPlayer],
            [secondDetails, partnership.secondPlayer],
          ].map(([details, name], index) => {
            const player = details as Player | undefined;
            return (
              <div
                key={String(name)}
                className={`flex min-h-56 items-end gap-5 p-6 lg:p-8 ${
                  index === 1 ? "lg:order-3" : ""
                }`}
              >
                <div className="h-28 w-24 flex-none overflow-hidden bg-[#e8e2d6]">
                  {player?.picLink ? (
                    <Image
                      src={player.picLink}
                      alt=""
                      width={160}
                      height={200}
                      unoptimized
                      className="h-full w-full object-contain object-bottom"
                    />
                  ) : (
                    <UserGroupIcon className="h-full w-full p-6 text-blue-700/30" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    {index === 0 ? "First player" : "Second player"}
                  </p>
                  <Link
                    href={`/page/player/${encodeURIComponent(String(name))}`}
                    className="mt-2 block font-display text-3xl font-semibold tracking-[-0.035em] hover:text-blue-700"
                  >
                    {String(name)}
                  </Link>
                  <p className="mt-2 text-xs text-[#071a2b]/45">
                    {player?.position || "Rovers player"}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="order-3 grid place-items-center border-y border-[#071a2b]/15 bg-[#071a2b] p-7 text-center text-white lg:order-2 lg:border-x lg:border-y-0">
            <div>
              <p className="font-display text-7xl font-semibold">
                {matches.length}
              </p>
              <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
                Matches together
              </p>
              <p className="mt-6 text-xs leading-5 text-white/45">
                Across {partnership.sharedSeasons.length} shared{" "}
                {partnership.sharedSeasons.length === 1 ? "season" : "seasons"}
              </p>
            </div>
          </div>
        </section>

        {matches.length > 0 ? (
          <>
            <section className="mt-8 grid border-l border-t border-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Joint record",
                  value: `${wins}W · ${draws}D · ${losses}L`,
                  detail: `${((wins / matches.length) * 100).toFixed(1)}% win rate`,
                  icon: TrophyIcon,
                },
                {
                  label: "Combined goals",
                  value: combinedGoals,
                  detail: "Scored by the partnership",
                  icon: UserGroupIcon,
                },
                {
                  label: "Best unbeaten run",
                  value: longestRun(matches, "unbeaten"),
                  detail: `${longestRun(matches, "W")} consecutive wins`,
                  icon: FireIcon,
                },
                {
                  label: "Biggest victory",
                  value: biggestWin
                    ? `${biggestWin.scored}–${biggestWin.conceded}`
                    : "—",
                  detail: biggestWin?.opposition || "No victory recorded",
                  icon: CalendarDaysIcon,
                },
              ].map(({ label, value, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="border-b border-r border-[#071a2b]/15 bg-[#fffdf8] p-5"
                >
                  <Icon className="h-5 w-5 text-blue-700" />
                  <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/40">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-[#071a2b]/45">{detail}</p>
                </div>
              ))}
            </section>

            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#071a2b]/15 pb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    Shared match log
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                    On the same team sheet.
                  </h2>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/40">
                  Most recent first
                </p>
              </div>
              <div className="overflow-hidden border-x border-[#071a2b]/15">
                {matches.map((match) => (
                  <Link
                    key={`${match.season}-${match.date}`}
                    href={`/match/${match.season}/${match.date}`}
                    className="group grid grid-cols-[38px_1fr_auto] items-center gap-3 border-b border-[#071a2b]/15 bg-[#fffdf8] p-4 transition hover:bg-blue-50 sm:grid-cols-[42px_130px_1fr_auto_auto]"
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center font-mono text-[10px] font-bold text-white ${
                        match.result === "W"
                          ? "bg-blue-700"
                          : match.result === "L"
                            ? "bg-red-700"
                            : "bg-slate-500"
                      }`}
                    >
                      {match.result || "—"}
                    </span>
                    <span className="hidden font-mono text-xs sm:block">
                      {formatDate(match.date)}
                    </span>
                    <span>
                      <strong className="block font-display text-lg">
                        {match.opposition}
                      </strong>
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#071a2b]/40">
                        {seasonLabel(match.season)} · {match.competition}
                      </span>
                    </span>
                    <span className="hidden text-xs text-[#071a2b]/50 sm:block">
                      {match.firstPlayerGoals + match.secondPlayerGoals > 0
                        ? `${match.firstPlayerGoals + match.secondPlayerGoals} joint goals`
                        : "No joint goals"}
                    </span>
                    <span className="flex items-center gap-2 font-mono text-sm font-bold">
                      {match.scored !== null
                        ? `${match.scored}–${match.conceded}`
                        : "View"}
                      <ArrowRightIcon className="h-4 w-4 text-[#071a2b]/25 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="mt-8 border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-16 text-center">
            <UserGroupIcon className="mx-auto h-8 w-8 text-blue-700" />
            <h2 className="mt-5 font-display text-3xl font-semibold">
              No shared appearances found.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#071a2b]/50">
              These players may belong to different Rovers eras. Choose another
              pairing to explore their time together.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
