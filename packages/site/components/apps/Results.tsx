"use client";
import { GetSeasons } from "@/lib/apiFunctions";
import {
  Competition,
  H2HResult,
  H2HTotal,
  Manager,
  Match,
  Team,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

  function showFilters(event: React.MouseEvent<HTMLElement>): void {
    setOpen(true);
  }

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
        dark:bg-blue-600
        px-3 py-2 
        text-sm 
        font-semibold 
        text-white 
        shadow-sm 
        hover:bg-green-600 
        dark:hover:bg-sky-400 
        focus-visible:outline 
        focus-visible:outline-2 
        focus-visible:outline-offset-2 
        focus-visible:outline-indigo-600
        w-full
        "
      >
        Filter Controls
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
      <ResultTable
        title="Results"
        results={results}
        h2hresults={h2hresults}
        h2htotal={h2htotal}
      ></ResultTable>
    </div>
  );
}
