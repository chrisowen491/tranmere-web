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
import { useState } from "react";
import { ResultTable } from "@/components/apps/partials/ResultTable";
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

  const updateFilters = async (
    changes: Partial<{
      season: string;
      sort: string;
      competition: string;
      manager: string;
      venue: string;
      opposition: string;
      pens: string;
    }>,
  ) => {
    const next = {
      season: season ?? "",
      sort: sort ?? "",
      competition: competition ?? "",
      manager: manager ?? "",
      venue: venue ?? "",
      opposition: opposition ?? "",
      pens: pens ?? "",
      ...changes,
    };
    setSeason(next.season);
    setSort(next.sort);
    setCompetition(next.competition);
    setManager(next.manager);
    setVenue(next.venue);
    setOpposition(next.opposition);
    setPens(next.pens);
    setLoading(true);
    try {
      const response = await fetch(`${base}?${new URLSearchParams(next)}`);
      const fullResults = (await response.json()) as {
        results: Match[];
        h2hresults: H2HResult[];
        h2htotal: H2HTotal[];
      };
      setResults(fullResults.results);
      setH2hresults(fullResults.h2hresults);
      setH2htotal(fullResults.h2htotal);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full px-6 pt-10 sm:px-10 lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-6 border-t border-[#071a2b]/15 pt-6">
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
        <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:max-w-5xl">
          <label>
            <span className="sr-only">Filter by season</span>
            <select
              value={season ?? ""}
              onChange={(event) => updateFilters({ season: event.target.value })}
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
            <span className="sr-only">Filter by competition</span>
            <select
              value={competition ?? ""}
              onChange={(event) =>
                updateFilters({ competition: event.target.value })
              }
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All competitions</option>
              {props.competitions.map((value) => (
                <option key={value.name} value={value.name}>
                  {value.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by opposition</span>
            <select
              value={opposition ?? ""}
              onChange={(event) =>
                updateFilters({ opposition: event.target.value })
              }
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All opposition</option>
              {props.teams.map((value) => (
                <option key={value.name} value={value.name}>
                  {value.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by manager</span>
            <select
              value={manager ?? ""}
              onChange={(event) => updateFilters({ manager: event.target.value })}
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All managers</option>
              {props.managers.map((value) => (
                <option
                  key={`${value.name}-${value.dateJoined}`}
                  value={`${value.dateJoined},${value.dateLeft}`}
                >
                  {value.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by venue</span>
            <select
              value={venue ?? ""}
              onChange={(event) => updateFilters({ venue: event.target.value })}
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All venues</option>
              <option value="Prenton Park">Prenton Park</option>
              <option value="Wembley Stadium">Wembley Stadium</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by penalty shootout</span>
            <select
              value={pens ?? ""}
              onChange={(event) => updateFilters({ pens: event.target.value })}
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="">All results</option>
              <option value="Penalty Shootout">Penalty shootouts</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort results</span>
            <select
              value={sort ?? ""}
              onChange={(event) => updateFilters({ sort: event.target.value })}
              className="block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            >
              <option value="Date">Date</option>
              <option value="Top Attendance">Top attendance</option>
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
