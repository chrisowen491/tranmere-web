"use client";
import { GetSeasonsForPlayers, replaceSeasonsKit } from "@/lib/apiFunctions";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { useState } from "react";
import { FilterBox } from "@/components/forms/FilterBox";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { LinkButton } from "@/components/forms/LinkButton";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

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

  function showFilters(event: React.MouseEvent<HTMLElement>): void {
    setOpen(true);
  }
  const onSubmit = async (formData: FormData) => {
    const targetSeason = formData.get("season")
      ? parseInt(formData.get("season")!.toString())
      : null;

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
    <div className="mx-auto w-full px-8">
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="bg-indigo-700 px-4 py-6 sm:px-6">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-base font-semibold leading-6 text-white">
                        Filter Controls
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-indigo-300">
                        Filter results using the controls below.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-1 px-4 sm:px-6">
                    <form action={onSubmit}>
                      <div className="p-4 ">
                        <div className="border-b border-gray-900/10 pb-12">
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
                                { label: "Starts", value: "Starrts" },
                                { label: "Goals", value: "Goals" },
                              ]}
                              includeAll={false}
                            ></FilterBox>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-x-6">
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

      <button
        type="button"
        onClick={showFilters}
        className=" bg-green-500 
          dark:bg-blue-600
          px-3 py-2 
          text-sm 
          font-semibold 
          text-white 
          shadow-sm 
          hover:bg-green-600 
          dark:hover:bg-sky-500 
          focus-visible:outline 
          focus-visible:outline-2 
          focus-visible:outline-offset-2 
          focus-visible:outline-indigo-600
          w-full"
      >
        Filter
      </button>

      {loading ? (
        <div id="loading">
          <div className="spinner-grow text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="px-2 sm:px-2 lg:px-4">
        <div className="mt-8 flow-root">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="thead-dark text-sm font-semibold">
                  <tr>
                    <th scope="col" className="py-3.5 text-left">
                      Name
                    </th>
                    <th scope="col" className="py-3.5">
                      Starts
                    </th>
                    <th scope="col" className="px-3 py-3.5">
                      Goals
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 lg:table-cell"
                    >
                      Assists
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 lg:table-cell"
                    >
                      Headers
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 lg:table-cell"
                    >
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
                <tbody className="divide-y divide-gray-200  text-sm">
                  {players.map((player, idx) => (
                    <tr key={idx}>
                      <td className="whitespace-nowrap px-1 md:px-3 py-4">
                        <div className="flex items-center">
                          <div className="h-11 w-11 flex-shrink-0">
                            {player.bio?.picLink ? (
                              <Image
                                alt={player.Player}
                                width={100}
                                height={100}
                                unoptimized={true}
                                src={replaceSeasonsKit(
                                  player.bio.picLink,
                                  season,
                                )}
                                className="h-11 w-11 rounded-full"
                              />
                            ) : (
                              <UserIcon
                                aria-hidden="true"
                                className="h-11 w-11 text-indigo-600  rounded-full dark:text-indigo-50"
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <LinkButton
                              text={player.Player}
                              href={`/page/player/${player.Player}`}
                            ></LinkButton>
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
      </div>
    </div>
  );
}
