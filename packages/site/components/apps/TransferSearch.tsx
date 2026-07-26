"use client";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import { Team, Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { useState } from "react";
import { TransferTable } from "./partials/TransferTable";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
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
    setOpen(false);
  };

  const arrivals = transfers.filter(
    (transfer) => transfer.type === "in",
  ).length;
  const departures = transfers.filter(
    (transfer) => transfer.type === "out",
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-10 sm:px-10 lg:px-12">
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
                        Filter transfers
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
                        Narrow the archive by season, club or direction.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-1 px-5 sm:px-6">
                    <form onSubmit={onSubmit}>
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

      <div className="grid gap-5 border-t border-[#071a2b]/15 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
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
        <button
          type="button"
          onClick={showFilters}
          className="inline-flex items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          Filter transfers
        </button>
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
    </div>
  );
}
