"use client";
import { GetSeasons } from "@/lib/apiFunctions";
import { Team, Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {

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
                        {seasons.map((season, idx) => (
                          <option key={idx}>{season}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="opposition">Opposition</label>
                      <select
                        className="form-control form-control-sm"
                        id="club"
                        name="club"
                        defaultValue={club!}
                      >
                        <option value="">All</option>
                        {props.teams.map((s, idx) => (
                          <option key={idx}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filter">Filter</label>
                      <select
                        defaultValue={filter!}
                        className="form-control form-control-sm"
                        id="filter"
                        name="filter"
                      >
                        <option></option>
                        <option>In</option>
                        <option>Out</option>
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
                <div id="player-search">
                  <table className="table">
                  <thead className="thead-dark">
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col" className="d-none d-sm-table-cell text-center">Season</th>
                        <th scope="col" className="text-center">In/Out</th>
                        <th scope="col" className="text-center">Club</th>
                        <th scope="col" className="text-center">Value</th>
                    </tr>
                    </thead>
                    <tbody>
                      {transfers.map((transfer, idx) => (
                      <tr key={idx}>
                          <td>
                              <a href={`/page/player/${transfer.name}`}>{transfer.name}</a>
                          </td>
                          <td className="d-none d-sm-table-cell text-center">{transfer.season}</td>
                          <td className="text-center">{transfer.type}</td>
                          <td className="text-center">{transfer.club}</td>
                          <td className="text-center">{transfer.value}</td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
