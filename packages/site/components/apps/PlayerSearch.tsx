"use client";
import {
  GetSeasonsForPlayers,
  replaceSeasonsKit,
} from "@tranmere-web/lib/src/apiFunctions";
import { PLAYER_POSITIONS } from "@tranmere-web/lib/src/player-constants";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerStatisticsView } from "@/lib/playerStatistics";
import {
  ArrowUpRightIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import {
  SearchPagination,
  type SearchPaginationState,
} from "./partials/SearchPagination";

export function PlayerSearch(props: {
  default: PlayerStatisticsView[];
  filter?: string;
  sort?: string;
  season?: string;
}) {
  const seasons = GetSeasonsForPlayers();
  const base = "/api/player-search/";

  const [players, setPlayers] = useState(props.default);
  const [season, setSeason] = useState(props.season);
  const [position, setPosition] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const searchRequest = useRef(0);
  const abortController = useRef<AbortController | null>(null);
  const queryDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pagination, setPagination] = useState<SearchPaginationState>({
    cursor: 0,
    limit: 50,
    nextCursor: props.default.length === 50 ? 50 : null,
  });
  const profileSearch = Boolean(query.trim());
  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return players.filter((player) => {
      const matchesName =
        !normalizedQuery ||
        player.Player.toLowerCase().includes(normalizedQuery);
      const matchesPosition =
        !position ||
        player.profile.position === position ||
        player.profile.secondaryPosition === position;
      return matchesName && matchesPosition;
    });
  }, [players, position, query]);
  const maxAppearances = Math.max(
    ...filteredPlayers.map((player) => player.starts + player.subs),
    1,
  );
  const appearanceLeader = [...filteredPlayers].sort(
    (a, b) => b.starts + b.subs - (a.starts + a.subs),
  )[0];
  const goalsLeader = [...filteredPlayers].sort(
    (a, b) => b.goals - a.goals || b.starts - a.starts,
  )[0];
  const totalAppearances = filteredPlayers.reduce(
    (total, player) => total + player.starts + player.subs,
    0,
  );

  const loadPlayers = async (
    nextSeason: string,
    nextQuery = "",
    nextPosition = position,
    cursor = 0,
  ) => {
    const request = ++searchRequest.current;
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setLoading(true);
    try {
      const search = new URLSearchParams({
        cursor: String(cursor),
        limit: "50",
        sort: props.sort || "Starts",
      });
      if (nextQuery) search.set("query", nextQuery);
      else if (nextSeason) search.set("season", nextSeason);
      if (nextPosition) search.set("filter", nextPosition);
      const response = await fetch(`${base}?${search}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Player search failed");
      const playerResults = (await response.json()) as {
        players: PlayerStatisticsView[];
        pagination: SearchPaginationState;
      };
      if (request === searchRequest.current) {
        setPlayers(playerResults.players);
        setPagination(playerResults.pagination);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        throw error;
      }
    } finally {
      if (request === searchRequest.current) {
        setLoading(false);
      }
    }
  };

  const changeSeason = async (nextSeason: string) => {
    setSeason(nextSeason || undefined);
    if (!nextSeason && !query.trim() && !position) {
      setPlayers(props.default);
      setPagination({
        cursor: 0,
        limit: 50,
        nextCursor: props.default.length === 50 ? 50 : null,
      });
      return;
    }
    await loadPlayers(nextSeason, query.trim(), position);
  };

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    if (queryDebounce.current) clearTimeout(queryDebounce.current);
    if (!nextQuery.trim() && !season && !position) {
      abortController.current?.abort();
      setPlayers(props.default);
      setPagination({
        cursor: 0,
        limit: 50,
        nextCursor: props.default.length === 50 ? 50 : null,
      });
      return;
    }
    queryDebounce.current = setTimeout(() => {
      void loadPlayers(season ?? "", nextQuery.trim(), position);
    }, 250);
  };

  const changePosition = (nextPosition: string) => {
    setPosition(nextPosition);
    void loadPlayers(season ?? "", query.trim(), nextPosition);
  };

  useEffect(
    () => () => {
      abortController.current?.abort();
      if (queryDebounce.current) clearTimeout(queryDebounce.current);
    },
    [],
  );

  return (
    <div className="mx-auto w-full px-6 pt-10 sm:px-10 lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-6 border-t border-[#071a2b]/15 pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Archive results
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            {filteredPlayers.length.toLocaleString()} players
          </h2>
          <p className="mt-1 text-sm text-[#071a2b]/55">
            {profileSearch
              ? "Searching every player profile"
              : season
                ? `Showing season ${season}`
                : "Top 50 by appearances"}
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_180px_190px] lg:max-w-3xl">
          <label className="relative block">
            <span className="sr-only">Search players by name</span>
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#071a2b]/35"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              placeholder="Search by player name…"
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] py-3 pl-12 pr-4 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-[#071a2b]/35 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            />
          </label>
          <label>
            <span className="sr-only">Filter by season</span>
            <select
              value={season ?? ""}
              onChange={(event) => changeSeason(event.target.value)}
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All seasons</option>
              {seasons.map((value) => (
                <option key={value} value={value}>
                  {value}/{String(value + 1).slice(-2)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by position</span>
            <select
              value={position}
              onChange={(event) => changePosition(event.target.value)}
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All positions</option>
              {PLAYER_POSITIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <SearchPagination
        pagination={pagination}
        count={filteredPlayers.length}
        loading={loading}
        onPrevious={() =>
          void loadPlayers(
            season ?? "",
            query.trim(),
            position,
            Math.max(0, pagination.cursor - pagination.limit),
          )
        }
        onNext={() =>
          pagination.nextCursor !== null &&
          void loadPlayers(
            season ?? "",
            query.trim(),
            position,
            pagination.nextCursor,
          )
        }
      />

      {loading ? (
        <div
          id="loading"
          className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] px-5 py-8 text-center"
        >
          <div role="status">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-blue-700">
              Updating archive…
            </span>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        ""
      )}

      {filteredPlayers.length > 0 && (
        <div className="mt-7 grid border border-[#071a2b]/15 bg-[#fffdf8] sm:grid-cols-3">
          <div className="border-b border-[#071a2b]/15 p-5 sm:border-b-0 sm:border-r">
            <ChartBarIcon className="h-5 w-5 text-blue-700" />
            <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
              Appearance leader
            </p>
            <p className="mt-1 truncate font-display text-2xl font-semibold">
              {appearanceLeader.Player}
            </p>
            <p className="mt-1 text-xs text-[#071a2b]/50">
              {appearanceLeader.starts + appearanceLeader.subs} appearances
            </p>
          </div>
          <div className="border-b border-[#071a2b]/15 p-5 sm:border-b-0 sm:border-r">
            <TrophyIcon className="h-5 w-5 text-blue-700" />
            <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
              Leading scorer
            </p>
            <p className="mt-1 truncate font-display text-2xl font-semibold">
              {goalsLeader.Player}
            </p>
            <p className="mt-1 text-xs text-[#071a2b]/50">
              {goalsLeader.goals} goals
            </p>
          </div>
          <div className="p-5">
            <UserGroupIcon className="h-5 w-5 text-blue-700" />
            <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
              Archive volume
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {totalAppearances.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-[#071a2b]/50">
              Combined recorded appearances
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="flex items-end justify-between gap-4 border-b border-[#071a2b]/15 bg-[#071a2b] px-5 py-5 text-white">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
              Player index
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {profileSearch ? "Matching players" : "Archive rankings"}
            </h2>
          </div>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 sm:block">
            {season
              ? `${season}/${String(Number(season) + 1).slice(-2)}`
              : "All-time records"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full">
            <thead className="border-b border-[#071a2b]/15 bg-[#e8e2d6] font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
              <tr>
                <th scope="col" className="w-14 px-4 py-4 text-center">
                  Rank
                </th>
                <th scope="col" className="px-4 py-4 text-left">
                  Player
                </th>
                <th scope="col" className="min-w-52 px-4 py-4">
                  Appearances
                </th>
                <th scope="col" className="px-4 py-4 text-center">
                  Goals
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-4 text-center md:table-cell"
                >
                  Assists
                </th>
                <th scope="col" className="hidden px-4 py-4 lg:table-cell">
                  Goal detail
                </th>
                <th scope="col" className="hidden px-5 py-4 lg:table-cell">
                  Cards
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10 text-sm">
              {filteredPlayers.map((player, idx) => {
                const apps = player.starts + player.subs;
                return (
                  <tr
                    key={`${player.Player}-${player.Season}-${idx}`}
                    className="group transition hover:bg-blue-50/60"
                  >
                    <td className="px-4 py-4 text-center font-mono text-xs font-bold text-[#071a2b]/35">
                      {(idx + 1).toString().padStart(2, "0")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden border border-[#071a2b]/10 bg-[#e8e2d6]">
                          {player.profile.picLink ? (
                            <Image
                              alt={player.Player}
                              width={100}
                              height={100}
                              unoptimized={true}
                              src={replaceSeasonsKit(
                                player.profile.picLink,
                                season,
                              )}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserIcon
                              aria-hidden="true"
                              className="h-full w-full p-2 text-blue-700"
                            />
                          )}
                        </div>
                        <div className="ml-3">
                          <Link
                            href={`/page/player/${player.Player}`}
                            className="inline-flex items-center gap-1 font-display text-base font-semibold hover:text-blue-700"
                          >
                            {player.Player}
                            <ArrowUpRightIcon className="h-3.5 w-3.5 opacity-25 transition group-hover:opacity-100" />
                          </Link>
                          {(player.profile.position ||
                            player.profile.secondaryPosition) && (
                            <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#071a2b]/35">
                              {[
                                player.profile.position,
                                player.profile.secondaryPosition,
                              ]
                                .filter(Boolean)
                                .join(" / ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-sm font-bold">
                          {apps}
                        </span>
                        <span className="text-xs text-[#071a2b]/45">
                          {player.starts} + {player.subs}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-[#e8e2d6]">
                        <div
                          className="h-full bg-blue-700 transition group-hover:bg-blue-500"
                          style={{
                            width: `${(apps / maxAppearances) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={
                          player.goals > 0
                            ? "inline-grid min-h-9 min-w-9 place-items-center bg-blue-700 px-2 font-mono font-bold text-white"
                            : "font-mono text-[#071a2b]/30"
                        }
                      >
                        {player.goals}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 text-center font-mono font-bold md:table-cell">
                      {player.assists}
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell">
                      <div className="flex gap-1">
                        {[
                          player.headers,
                          player.freekicks,
                          player.penalties,
                        ].map((value, statIndex) => (
                          <span
                            key={statIndex}
                            className="inline-flex min-w-7 items-center justify-center bg-[#e8e2d6] px-2 py-1 font-mono text-[10px] font-bold text-[#071a2b]/65"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#071a2b]/35">
                        Head · FK · Pen
                      </p>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <div className="flex gap-1">
                        <span className="inline-flex min-w-7 items-center justify-center bg-amber-100 px-2 py-1 font-mono text-[10px] font-bold text-amber-900">
                          {player.yellow}
                        </span>
                        <span className="inline-flex min-w-7 items-center justify-center bg-red-100 px-2 py-1 font-mono text-[10px] font-bold text-red-800">
                          {player.red}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
