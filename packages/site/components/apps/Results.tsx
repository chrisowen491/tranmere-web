"use client";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import {
  Competition,
  H2HResult,
  H2HTotal,
  Manager,
  Match,
  Team,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useState } from "react";
import { ResultTable } from "@/components/apps/partials/ResultTable";
import { FilterBox } from "@/components/forms/FilterBox";
import { SubmitButton } from "@/components/forms/SubmitButton";
export function ResultsSearch(props: {
  results: Match[];
  h2hresults: H2HResult[];
  h2htotal: H2HTotal[];
  competition?: string;
  manager?: string;
  venue?: string;
  opposition?: string;
  pens?: string;
  sort?: string;
  season?: string;
  competitions: Competition[];
  managers: Manager[];
  teams: Team[];
  fullDate?: boolean;
}) {
  const seasons = GetSeasons();
  const base = "/api/result-search/";
  const [open, setOpen] = useState(false);

  const [results, setResults] = useState(props.results);
  const [h2hresults, setH2hresults] = useState(props.h2hresults);
  const [h2htotal, setH2htotal] = useState(props.h2htotal);
  const [season, setSeason] = useState(props.season);
  const [sort, setSort] = useState(props.sort);
  const [competition, setCompetition] = useState(props.competition);
  const [manager, setManager] = useState(props.manager);
  const [venue, setVenue] = useState(props.venue);
  const [opposition, setOpposition] = useState(props.opposition);
  const [pens, setPens] = useState(props.pens);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setSeason(formData.get("season") as string);
    setSort(formData.get("sort") as string);
    setCompetition(formData.get("competition") as string);
    setManager(formData.get("manager") as string);
    setVenue(formData.get("venue") as string);
    setOpposition(formData.get("opposition") as string);
    setPens(formData.get("pens") as string);

    setLoading(true);

    const resultsRequest = await fetch(
      base +
        `?season=${formData.get("season")}&sort=${formData.get("sort")}&venue=${formData.get("venue")}&competition=${formData.get("competition")}&manager=${formData.get("manager")}&opposition=${formData.get("opposition")}&pens=${formData.get("pens")}`,
    );
    const fullResults = (await resultsRequest.json()) as {
      results: Match[];
      h2hresults: H2HResult[];
      h2htotal: H2HTotal[];
    };

    setResults(fullResults.results);
    setH2hresults(fullResults.h2hresults);
    setH2htotal(fullResults.h2htotal);
    setLoading(false);
    setOpen(false);
  };

  function showFilters(): void {
    setOpen(true);
  }

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
                        Filter matches
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
                        Narrow the archive by season, competition or opponent.
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
                              title="Competition"
                              identifier={"competition"}
                              options={props.competitions.map((s) => ({
                                label: s.name,
                                value: s.name,
                              }))}
                              includeAll={true}
                              default={competition}
                            ></FilterBox>
                            <FilterBox
                              title="Opposition"
                              identifier={"opposition"}
                              options={props.teams.map((s) => ({
                                label: s.name,
                                value: s.name,
                              }))}
                              includeAll={true}
                              default={opposition}
                            ></FilterBox>
                            <FilterBox
                              title="Manager"
                              identifier={"manager"}
                              options={props.managers.map((m) => ({
                                label: m.name,
                                value: `${m.dateJoined},${m.dateLeft}`,
                              }))}
                              includeAll={true}
                              default={manager}
                            ></FilterBox>
                            <FilterBox
                              title="Venue"
                              default={venue}
                              identifier={"venue"}
                              options={[
                                {
                                  label: "Prenton Park",
                                  value: "Prenton Park",
                                },
                                {
                                  label: "Wembley Stadium",
                                  value: "Wembley Stadium",
                                },
                              ]}
                              includeAll={true}
                            ></FilterBox>
                            <FilterBox
                              title="Penalties"
                              default={pens}
                              identifier={"pens"}
                              options={[
                                { label: "No", value: "" },
                                {
                                  label: "Penalty Shootout",
                                  value: "Penalty Shootout",
                                },
                              ]}
                              includeAll={false}
                            ></FilterBox>
                            <FilterBox
                              title="Sort"
                              default={sort}
                              identifier={"sort"}
                              options={[
                                { label: "Date", value: "Date" },
                                {
                                  label: "Top Attendance",
                                  value: "Top Attendance",
                                },
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
            Results archive
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            {season
              ? `${season}/${String(Number(season) + 1).slice(-2)}`
              : "All seasons"}
          </h2>
          <p className="mt-1 text-sm text-[#071a2b]/55">
            {results.length === 0
              ? "No recorded matches in this selection"
              : `${results.length.toLocaleString()} matches found`}
          </p>
        </div>
        <button
          type="button"
          onClick={showFilters}
          className="inline-flex items-center gap-2 bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          Filter matches
        </button>
      </div>

      {loading ? (
        <div
          id="loading"
          className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] px-5 py-8 text-center"
        >
          <div role="status">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-blue-700">
              Updating results…
            </span>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        ""
      )}
      <ResultTable
        title="Results"
        results={results}
        h2hresults={h2hresults}
        h2htotal={h2htotal}
        fullDate={props.fullDate}
      ></ResultTable>
    </div>
  );
}
