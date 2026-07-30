"use client";
import {
  GetSeasonsForPlayers,
  replaceSeasonsKit,
} from "@tranmere-web/lib/src/apiFunctions";
import { useState } from "react";
import { FilterBox } from "@/components/forms/FilterBox";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  ArrowUpRightIcon,
  ChartBarIcon,
  TrophyIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import type { PlayerStatisticsView } from "@/lib/playerStatistics";

export function PlayerSearch(props: {
  default: PlayerStatisticsView[];
  filter?: string;
  sort?: string;
  season?: string;
}) {
  const seasons = GetSeasonsForPlayers();
  const base = "/api/player-search/";

  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState(props.default);
  const [season, setSeason] = useState(props.season);
  const [loading, setLoading] = useState(false);
  const maxAppearances = Math.max(
    ...players.map((player) => player.starts + player.subs),
    1,
  );
  const appearanceLeader = [...players].sort(
    (a, b) => b.starts + b.subs - (a.starts + a.subs),
  )[0];
  const goalsLeader = [...players].sort(
    (a, b) => b.goals - a.goals || b.starts - a.starts,
  )[0];
  const totalAppearances = players.reduce(
    (total, player) => total + player.starts + player.subs,
    0,
  );

  const filters = [
    {
      label: "One Game Only",
      value: "OnlyOneApp",
    },
    {
      label: "Goalkeepers",
      value: "GK",
    },
    {
      label: "Full Backs",
      value: "FB",
    },
    {
      label: "Central Defenders",
      value: "CD",
    },
    {
      label: "Central Midfielders",
      value: "CM",
    },
    {
      label: "Wingers",
      value: "WIN",
    },
    {
      label: "Strikers",
      value: "STR",
    },
  ];

  function showFilters(): void {
    setOpen(true);
  }
  const onSubmit = async (formData: FormData) => {
    setSeason(formData.get("season") as string);
    setLoading(true);

    const latestSeasonRequest = await fetch(
      base +
        `?season=${formData.get("season")}&sort=${formData.get("sort")}&filter=${formData.get("filter")}`,
    );
    const playerResults = (await latestSeasonRequest.json()) as {
      players: PlayerStatisticsView[];
    };

    setPlayers(playerResults.players);
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full px-6 pt-10 sm:px-10 lg:px-12">
      <Dialog open={open} onClose={setOpen} className="relative z-[60]">
        <div className="fixed inset-0 bg-[#071a2b]/45 backdrop-blur-sm" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-scroll bg-[#fffdf8] shadow-2xl">
                  <div className="bg-[#071a2b] px-5 py-6 sm:px-6">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="font-display text-2xl font-semibold text-white">
                        Filter players
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-white/60">
                        Choose a season, position group and sort order.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-1 px-5 sm:px-6">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(new FormData(e.currentTarget));
                      }}
                    >
                      <div className="py-4">
                        <div className="border-b border-[#071a2b]/10 pb-10">
                          <div className="mt-10">
                            <FilterBox
                              title="Season"
                              identifier={"season"}
                              options={seasons.map((s) => ({
                                label: `${s}`,
                                value: `${s}`,
                              }))}
                              includeAll={true}
                              default={season}
                            ></FilterBox>
                            <FilterBox
                              title="Filter"
                              identifier={"filter"}
                              options={filters}
                              includeAll={true}
                            ></FilterBox>
                            <FilterBox
                              title="Sort"
                              identifier={"sort"}
                              options={[
                                { label: "Starts", value: "Starts" },
                                { label: "Goals", value: "Goals" },
                              ]}
                              includeAll={false}
                            ></FilterBox>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end">
                          <SubmitButton text={"Search"}></SubmitButton>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[#071a2b]/15 pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Archive results
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            {players.length.toLocaleString()} players
          </h2>
          <p className="mt-1 text-sm text-[#071a2b]/55">
            {season ? `Showing season ${season}` : "Showing all seasons"}
          </p>
        </div>
        <button
          type="button"
          onClick={showFilters}
          className="inline-flex items-center gap-2 bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          Filter &amp; sort
        </button>
      </div>

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

      {players.length > 0 && (
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
              Archive rankings
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
              {players.map((player, idx) => {
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
                          {player.profile.position && (
                            <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#071a2b]/35">
                              {player.profile.position}
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
