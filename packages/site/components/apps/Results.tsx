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
import { useState } from "react";
import { ResultTable } from "../ResultTable";

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
  };

  return (
    <div className="container overlay-item-top">
      <div className="row">
        <div className="col">
          <div className="content boxed">
            <div className="row separated">
              <aside className="col-md-3 content-aside bg-light">
                <div className="widget">
                  <form action={onSubmit}>
                    <h3 className="widget-title">Filter</h3>
                    <div className="form-group">
                      <label htmlFor="season">Season</label>
                      <select
                        defaultValue={season!}
                        className="form-control form-control-sm"
                        id="season"
                        name="season"
                      >
                        <option value="">All</option>
                        {seasons.map((s, idx) => (
                          <option key={idx}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="competition">Competition</label>
                      <select
                        className="form-control form-control-sm"
                        id="competition"
                        name="competition"
                        defaultValue={competition!}
                      >
                        <option value="">All</option>
                        <option value="League">League</option>
                        {props.competitions.map((s, idx) => (
                          <option key={idx}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="opposition">Opposition</label>
                      <select
                        className="form-control form-control-sm"
                        id="opposition"
                        name="opposition"
                        defaultValue={opposition!}
                      >
                        <option value="">All</option>
                        {props.teams.map((s, idx) => (
                          <option key={idx}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="manager">Manager</label>
                      <select
                        className="form-control form-control-sm"
                        id="manager"
                        name="manager"
                        defaultValue={manager!}
                      >
                        <option value="">All</option>
                        {props.managers.map((m, idx) => (
                          <option
                            key={idx}
                            value={`${m.dateJoined},${m.dateLeft}`}
                          >
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="venue">Venue</label>
                      <select
                        className="form-control form-control-sm"
                        id="venue"
                        name="venue"
                        defaultValue={venue!}
                      >
                        <option value="">All</option>
                        <option>Prenton Park</option>
                        <option>Wembley Stadium</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="pens">Penalties</label>
                      <select
                        className="form-control form-control-sm"
                        id="pens"
                        name="pens"
                        defaultValue={pens!}
                      >
                        <option value="">No</option>
                        <option>Penalty Shootout</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="sort">Sort</label>
                      <select
                        className="form-control form-control-sm"
                        id="sort"
                        name="sort"
                        defaultValue={sort!}
                      >
                        <option>Date</option>
                        <option>Top Attendance</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary btn-rounded btn-player-search"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </aside>
              <article className="col-md-9 content-body tranmere-results">
                {loading ? (
                  <div id="loading">
                    <div className="spinner-grow text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <div id="results-search">
                  <meta name="results-ssr-id" content="true" />
                  {h2hresults && h2hresults.length > 0 ? (
                    <>
                      <h2>Overall Record</h2>
                      <table className="table">
                        <thead className="thead-dark">
                          <tr>
                            <th scope="col">Venue</th>
                            <th scope="col">Pld</th>
                            <th scope="col">Won</th>
                            <th scope="col">Draws</th>
                            <th scope="col">Lost</th>
                            <th scope="col">For</th>
                            <th scope="col">Agn</th>
                            <th scope="col">Diff</th>
                          </tr>
                        </thead>
                        <tbody>
                          {h2hresults.map((result, idx) => (
                            <tr key={idx}>
                              <td>{result.venue}</td>
                              <td>{result.pld}</td>
                              <td>{result.wins}</td>
                              <td>{result.draws}</td>
                              <td>{result.lost}</td>
                              <td>{result.for}</td>
                              <td>{result.against}</td>
                              <td>{result.diff}</td>
                            </tr>
                          ))}
                          {h2htotal && h2htotal.length > 0 ? (
                            <>
                              {h2htotal.map((result, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <strong>{result.venue}</strong>
                                  </td>
                                  <td>
                                    <strong>{result.pld}</strong>
                                  </td>
                                  <td>
                                    <strong>{result.wins}</strong>
                                  </td>
                                  <td>
                                    <strong>{result.draws}</strong>
                                  </td>
                                  <td>
                                    <strong>{result.lost}</strong>
                                  </td>
                                  <td>
                                    <strong>{result.for}</strong>
                                  </td>
                                  <td>
                                    <strong>{result.against}</strong>
                                  </td>
                                  <td>
                                    <strong>{result.diff}</strong>
                                  </td>
                                </tr>
                              ))}
                            </>
                          ) : (
                            ""
                          )}
                        </tbody>
                      </table>
                      <h2>Results</h2>
                    </>
                  ) : (
                    ""
                  )}
                  <ResultTable results={results}></ResultTable>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
