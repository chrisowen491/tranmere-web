"use client";
import { GetSeasons } from "@/lib/apiFunctions";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { useState } from "react";

export function PlayerSearch(props: {
  default: PlayerSeasonSummary[];
  filter?: string;
  sort?: string;
  season?: string;
}) {
  const seasons = GetSeasons();
  const base = "/api/player-search/";

  const [players, setPlayers] = useState(props.default);
  const [season, setSeason] = useState(props.season);
  const [sort, setSort] = useState(props.sort);
  const [filter, setFilter] = useState(props.filter);
  const [loading, setLoading] = useState(false);

  const seasonMapping = {
    1978: 1977,
    1984: 1983,
    1990: 1989,
    1992: 1991,
    1994: 1993,
    1996: 1995,
    1998: 1997,
    2001: 2000,
    2003: 2002,
    2005: 2006,
    2008: 2007,
  };

  const re = /\/\d\d\d\d\//gm;
  const re3 = /\/\d\d\d\d[A-Za-z]\//gm;

  const onSubmit = async (formData: FormData) => {
    const targetSeason = formData.get("season")
      ? parseInt(formData.get("season")!.toString())
      : null;

    setSeason(formData.get("season") as string);
    setSort(formData.get("sort") as string);
    setFilter(formData.get("filter") as string);

    setLoading(true);

    const latestSeasonRequest = await fetch(
      base +
        `?season=${formData.get("season")}&sort=${formData.get("sort")}&filter=${formData.get("filter")}`,
    );
    const playerResults = (await latestSeasonRequest.json()) as {
      players: PlayerSeasonSummary[];
    };

    //TODO Season Shirt

    setPlayers(playerResults.players);
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
                      <label htmlFor="sort">Sort</label>
                      <select
                        defaultValue={sort!}
                        className="form-control form-control-sm"
                        id="sort"
                        name="sort"
                      >
                        <option>Starts</option>
                        <option>Goals</option>
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
                        <option value="OnlyOneApp">One Game Only</option>
                        <option value="GK">Goalkeepers</option>
                        <option value="FB">Full Backs</option>
                        <option value="CD">Central Defenders</option>
                        <option value="CM">Central Midfielders</option>
                        <option value="WIN">Wingers</option>
                        <option value="STR">Strikers</option>
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
                  <meta name="players-ssr-id" content="true" />

                  <table className="table">
                    <thead className="thead-dark">
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col" className="text-center">
                          Starts
                        </th>
                        <th scope="col" className="text-center">
                          Goals
                        </th>
                        <th
                          scope="col"
                          className="text-center d-none d-sm-table-cell"
                        >
                          Assists
                        </th>
                        <th scope="col" className="text-center">
                          Pic
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player, idx) => (
                        <tr key={idx}>
                          <td>
                            <a
                              href={`/page/player/${player.Player}`}
                              itemProp="name"
                            >
                              {player.Player}
                            </a>
                          </td>
                          <td className="text-center">
                            {player.starts}({player.subs})
                          </td>
                          <td className="text-center">{player.goals}</td>
                          <td className="d-none d-sm-table-cell text-center">
                            {player.assists}
                          </td>
                          <td className="text-center">
                            {player.bio?.picLink ? (
                              <img width="75px" src={player.bio.picLink} />
                            ) : (
                              ""
                            )}
                          </td>
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
