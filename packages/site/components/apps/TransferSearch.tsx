"use client";
import { GetSeasons } from "@/lib/apiFunctions";
import { Team, Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { useState } from "react";
import { TransferTable } from "./partials/TransferTable";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FilterBox } from "@/components/forms/FilterBox";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function TransferSearch(props: {
  default: Transfer[];
  filter?: string;
  teams: Team[];
  club?: string;
  season?: string;
}) {
  const seasons = GetSeasons();
  const base = "/api/transfer-search/";

  const [open, setOpen] = useState(false);
  const [transfers, setTransfers] = useState(props.default);
  const [season, setSeason] = useState(props.season);
  const [club, setClub] = useState(props.club);
  const [filter, setFilter] = useState(props.filter);
  const [loading, setLoading] = useState(false);

  function showFilters(): void {
    setOpen(true);
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSeason(formData.get("season") as string);
    setClub(formData.get("club") as string);
    setFilter(formData.get("filter") as string);

    setLoading(true);

    const apiRequest = await fetch(
      base +
        `?season=${formData.get("season")}&club=${formData.get("club")}&filter=${formData.get("filter")}`,
    );
    const results = (await apiRequest.json()) as {
      transfers: Transfer[];
    };

    //TODO Season Shirt

    setTransfers(results.transfers);
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full px-2">
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
                    <form onSubmit={onSubmit}>
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
                              title="Club"
                              identifier={"club"}
                              options={props.teams.map((s) => ({
                                label: s.name,
                                value: s.name,
                              }))}
                              includeAll={true}
                              default={club}
                            ></FilterBox>

                            <FilterBox
                              title="Filter"
                              default={filter}
                              identifier={"filter"}
                              options={[
                                { label: "In", value: "In" },
                                { label: "Out", value: "Out" },
                              ]}
                              includeAll={true}
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
        className="
      bg-green-500 
      dark:bg-sky-400
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
      w-full
      "
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

      <TransferTable records={transfers} title="Transfers"></TransferTable>
    </div>
  );
}
