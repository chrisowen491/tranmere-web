"use client";
import {
  GetSeasonsForPlayers,
  replaceSeasonsKit,
} from "@tranmere-web/lib/src/apiFunctions";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { useState } from "react";
import { FilterBox } from "@/components/forms/FilterBox";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";

export function PlayerSearch(props: {
  default: PlayerSeasonSummary[];
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
      players: PlayerSeasonSummary[];
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
      <div className="mt-7 border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-[#071a2b]/15 bg-[#f4f0e8] text-xs font-bold uppercase tracking-[0.1em] text-[#071a2b]/60">
              <tr>
                <th scope="col" className="px-5 py-4 text-left">
                  Player
                </th>
                <th scope="col" className="py-3.5">
                  Starts
                </th>
                <th scope="col" className="px-3 py-3.5">
                  Goals
                </th>
                <th scope="col" className="hidden px-3 py-3.5 lg:table-cell">
                  Assists
                </th>
                <th scope="col" className="hidden px-3 py-3.5 lg:table-cell">
                  Headers
                </th>
                <th scope="col" className="hidden px-3 py-3.5 lg:table-cell">
                  Free Kicks
                </th>
                <th
                  scope="col"
                  className="hidden px-1 md:px-3 py-3.5 lg:table-cell"
                >
                  Penalties
                </th>
                <th
                  scope="col"
                  className="hidden px-1 md:px-3 py-3.5 lg:table-cell"
                >
                  Red Cards
                </th>
                <th
                  scope="col"
                  className="hidden px-1 md:px-3 py-3.5 lg:table-cell"
                >
                  Yellow Cards
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10 text-sm">
              {players.map((player, idx) => (
                <tr key={idx} className="transition hover:bg-[#f4f0e8]">
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center">
                      <div className="h-11 w-11 flex-shrink-0">
                        {player.bio?.picLink ? (
                          <Image
                            alt={player.Player}
                            width={100}
                            height={100}
                            unoptimized={true}
                            src={replaceSeasonsKit(player.bio.picLink, season)}
                            className="h-11 w-11 bg-[#e8e2d6] object-cover"
                          />
                        ) : (
                          <UserIcon
                            aria-hidden="true"
                            className="h-11 w-11 bg-[#e8e2d6] p-2 text-blue-700"
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <Link
                          href={`/page/player/${player.Player}`}
                          className="font-semibold hover:text-blue-700"
                        >
                          {player.Player}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                    {player.starts} ({player.subs})
                  </td>
                  <td className="whitespace-nowrap px-1 md:px-3 py-4 text-center">
                    {player.goals}
                  </td>
                  <td className="whitespace-nowrap hidden px-1 md:px-3 py-3.5 lg:table-cell text-center">
                    {player.assists}
                  </td>
                  <td className="whitespace-nowrap hidden px-1 md:px-3 py-3.5 lg:table-cell text-center">
                    {player.headers}
                  </td>
                  <td className="whitespace-nowrap hidden px-1 md:px-3 py-3.5 lg:table-cell text-center">
                    {player.freekicks}
                  </td>
                  <td className="whitespace-nowrap hidden px-1 md:px-3 py-3.5 lg:table-cell text-center">
                    {player.penalties}
                  </td>
                  <td className="whitespace-nowrap hidden px-1 md:px-3 py-3.5 lg:table-cell text-center">
                    {player.red}
                  </td>
                  <td className="whitespace-nowrap hidden px-1 md:px-3 py-3.5 lg:table-cell text-center">
                    {player.yellow}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
