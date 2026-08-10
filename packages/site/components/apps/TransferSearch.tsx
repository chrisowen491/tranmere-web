"use client";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import { Team, Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { useEffect, useRef, useState } from "react";
import { TransferTable } from "./partials/TransferTable";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  SearchPagination,
  type SearchPaginationState,
} from "./partials/SearchPagination";

export function TransferSearch(props: {
  default: Transfer[];
  filter?: string;
  teams: Team[];
  club?: string;
  season?: string;
}) {
  const seasons = GetSeasons();
  const base = "/api/transfer-search/";

  const [transfers, setTransfers] = useState(props.default);
  const [season, setSeason] = useState(props.season);
  const [club, setClub] = useState(props.club);
  const [filter, setFilter] = useState(props.filter);
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const abortController = useRef<AbortController | null>(null);
  const queryDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pagination, setPagination] = useState<SearchPaginationState>({
    cursor: 0,
    limit: 50,
    nextCursor: props.default.length === 50 ? 50 : null,
  });

  const updateFilters = async (
    changes: Partial<{
      season: string;
      club: string;
      filter: string;
      playerName: string;
      cursor: number;
    }>,
  ) => {
    const request = ++requestId.current;
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    const next = {
      season: changes.season ?? season ?? "",
      club: changes.club ?? club ?? "",
      filter: changes.filter ?? filter ?? "",
      playerName: changes.playerName ?? playerName,
      cursor: changes.cursor ?? 0,
    };
    setSeason(next.season || undefined);
    setClub(next.club || undefined);
    setFilter(next.filter || undefined);
    setPlayerName(next.playerName);
    setLoading(true);
    try {
      const search = new URLSearchParams();
      if (next.season) search.set("season", next.season);
      if (next.club) search.set("club", next.club);
      if (next.filter) search.set("filter", next.filter);
      if (next.playerName.trim()) search.set("player", next.playerName.trim());
      search.set("limit", "50");
      search.set("cursor", String(next.cursor));
      const apiRequest = await fetch(`${base}?${search}`, {
        signal: controller.signal,
      });
      if (!apiRequest.ok) throw new Error("Transfer search failed");
      const results = (await apiRequest.json()) as {
        transfers: Transfer[];
        pagination: SearchPaginationState;
      };
      if (request === requestId.current) {
        setTransfers(results.transfers);
        setPagination(results.pagination);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        throw error;
      }
    } finally {
      if (request === requestId.current) {
        setLoading(false);
      }
    }
  };

  const changePlayerName = (nextPlayerName: string) => {
    setPlayerName(nextPlayerName);
    if (queryDebounce.current) clearTimeout(queryDebounce.current);
    queryDebounce.current = setTimeout(() => {
      void updateFilters({ playerName: nextPlayerName });
    }, 250);
  };

  useEffect(
    () => () => {
      abortController.current?.abort();
      if (queryDebounce.current) clearTimeout(queryDebounce.current);
    },
    [],
  );

  const arrivals = transfers.filter(
    (transfer) => transfer.type === "in",
  ).length;
  const departures = transfers.filter(
    (transfer) => transfer.type === "out",
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-10 sm:px-10 lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-6 border-t border-[#071a2b]/15 pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Transfer records
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            {transfers.length.toLocaleString()} moves
          </h2>
          <div className="mt-3 flex gap-5 font-mono text-xs text-[#071a2b]/55">
            <span>{arrivals} arrivals</span>
            <span>{departures} departures</span>
            {season && <span>Season {season}</span>}
          </div>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-[minmax(0,1fr)_150px_190px_130px]">
          <label className="relative block">
            <span className="sr-only">Search by player name</span>
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#071a2b]/35"
            />
            <input
              type="search"
              value={playerName}
              onChange={(event) => changePlayerName(event.target.value)}
              placeholder="Search by player name…"
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] py-3 pl-12 pr-4 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-[#071a2b]/35 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            />
          </label>
          <label>
            <span className="sr-only">Filter by season</span>
            <select
              value={season ?? ""}
              onChange={(event) =>
                updateFilters({ season: event.target.value })
              }
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
            <span className="sr-only">Filter by club</span>
            <select
              value={club ?? ""}
              onChange={(event) => updateFilters({ club: event.target.value })}
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All clubs</option>
              {props.teams.map((team) => (
                <option key={team.name} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by direction</span>
            <select
              value={filter ?? ""}
              onChange={(event) =>
                updateFilters({ filter: event.target.value })
              }
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All moves</option>
              <option value="In">Arrivals</option>
              <option value="Out">Departures</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div
          id="loading"
          className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] px-5 py-8 text-center"
        >
          <div role="status">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-blue-700">
              Updating transfers…
            </span>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        ""
      )}

      <TransferTable records={transfers} title="Transfers"></TransferTable>
      <SearchPagination
        pagination={pagination}
        count={transfers.length}
        loading={loading}
        onPrevious={() =>
          void updateFilters({
            cursor: Math.max(0, pagination.cursor - pagination.limit),
          })
        }
        onNext={() =>
          pagination.nextCursor !== null &&
          void updateFilters({ cursor: pagination.nextCursor })
        }
      />
    </div>
  );
}
