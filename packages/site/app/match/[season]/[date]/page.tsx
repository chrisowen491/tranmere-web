import { getRequestContext } from "@cloudflare/next-on-pages";
import { MatchPageData } from "@/lib/types";
import { Appearance, Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { SquadAppearance } from "@/components/SquadApp";
import { ResultTable } from "@/components/ResultTable";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { season: string; date: string };
}) {
  const url = `${GetBaseUrl(getRequestContext().env)}/match/${params.season}/${params.date}`;

  const matchRequest = await fetch(url);
  const match = (await matchRequest.json()) as MatchPageData;
  return {
    title: `Match Summary - ${match.homeTeam} ${match.score} ${match.awayTeam}`,
    description: `Match Summary For ${match.homeTeam} ${match.score} ${match.awayTeam} - ${match.date}`,
  };
}

export default async function MatchPage({
  params,
}: {
  params: { season: string; date: string };
}) {
  const url = `${GetBaseUrl(getRequestContext().env)}/match/${params.season}/${params.date}`;

  const matchRequest = await fetch(url);
  const match = (await matchRequest.json()) as MatchPageData;

  const nextMatchesUrl = `${GetBaseUrl(getRequestContext().env)}/result-search/?season=${match.season}&date=${match.date}&or=next`;
  const previousMatchesUrl = `${GetBaseUrl(getRequestContext().env)}/result-search/?season=${match.season}&date=${match.date}&or=previous`;

  const nextMatches = await fetch(nextMatchesUrl);
  const previousMatches = await fetch(previousMatchesUrl);

  const next = (await nextMatches.json()) as {
    results: Match[];
  };
  const previous = (await previousMatches.json()) as {
    results: Match[];
  };

  const noPositionList: Appearance[] = [];
  const goalkeepers: Appearance[] = [];
  const fullback1: Appearance[] = [];
  const fullback2: Appearance[] = [];
  const defenders: Appearance[] = [];
  const midfielders: Appearance[] = [];
  const wingers1: Appearance[] = [];
  const wingers2: Appearance[] = [];
  const strikers: Appearance[] = [];
  for (const app of match.apps!) {
    if (app.bio) {
      if (app.bio.position == "Goalkeeper") {
        goalkeepers.push(app);
      } else if (app.bio.position == "Central Defender") {
        defenders.push(app);
      } else if (app.bio.position == "Full Back" && fullback1.length == 0) {
        fullback1.push(app);
      } else if (app.bio.position == "Full Back" && fullback2.length == 0) {
        fullback2.push(app);
      } else if (app.bio.position == "Central Midfielder") {
        midfielders.push(app);
      } else if (app.bio.position == "Winger" && wingers1.length == 0) {
        wingers1.push(app);
      } else if (app.bio.position == "Winger" && wingers2.length == 0) {
        wingers2.push(app);
      } else if (app.bio.position == "Striker") {
        strikers.push(app);
      } else {
        noPositionList.push(app);
      }
    } else {
      noPositionList.push(app);
    }
  }

  for (const position of noPositionList) {
    if (goalkeepers.length == 0) {
      goalkeepers.push(position);
    } else if (fullback1.length == 0) {
      fullback1.push(position);
    } else if (fullback2.length == 0) {
      fullback2.push(position);
    } else if (defenders.length < 2) {
      defenders.push(position);
    } else if (wingers1.length == 0) {
      wingers1.push(position);
    } else if (wingers2.length == 0) {
      wingers2.push(position);
    } else if (midfielders.length < 2) {
      midfielders.push(position);
    } else {
      strikers.push(position);
    }
  }

  const defColspan = Math.floor(
    24 / (defenders.length + fullback1.length + fullback2.length),
  );
  const midColspan = Math.floor(
    24 / (midfielders.length + wingers1.length + wingers2.length),
  );
  const strColspan = Math.floor(24 / strikers.length);

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-white mb-3">
              <h1 className="h1 pb-1">
                {match.homeTeam} {match.score} {match.awayTeam}
              </h1>
              <h3 className="h3 pb-1">
                {match.competition}, {match.date}
              </h3>
              <nav aria-label="breadcrumb">
                <ol
                  className="breadcrumb breadcrumb-minimal"
                  itemScope
                  itemType="http://schema.org/BreadcrumbList"
                >
                  <li
                    itemProp="itemListElement"
                    itemScope
                    itemType="http://schema.org/ListItem"
                    className="breadcrumb-item"
                  >
                    <a href="/" itemProp="item">
                      <span itemProp="name">
                        Home
                        <meta itemProp="position" content="1" />
                      </span>
                    </a>
                  </li>
                  <li
                    itemProp="itemListElement"
                    itemScope
                    itemType="http://schema.org/ListItem"
                    className="breadcrumb-item"
                  >
                    <a href="/results" itemProp="item">
                      <span itemProp="name">
                        Results
                        <meta itemProp="position" content="2" />
                      </span>
                    </a>
                  </li>
                  <li
                    itemProp="itemListElement"
                    itemScope
                    itemType="http://schema.org/ListItem"
                    className="breadcrumb-item"
                  >
                    <a href={`/games/${match.season}`} itemProp="item">
                      <span itemProp="name">
                        {match.season}
                        <meta itemProp="position" content="3" />
                      </span>
                    </a>
                  </li>
                  <li
                    itemProp="itemListElement"
                    itemScope
                    itemType="http://schema.org/ListItem"
                    className="breadcrumb-item active"
                    aria-current="page"
                  >
                    <span itemProp="name">{match.date}</span>
                    <meta itemProp="position" content="4" />
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <section className="match" id="match">
        <div className="container overlay-item-top">
          <div className="row">
            <div className="col">
              <div className="content boxed">
                <div className="row separated">
                  <aside className="col-md-4 content-aside bg-light">
                    <div className="widget">
                      {match.programme ? (
                        <>
                          <img
                            src={`https://images.tranmere-web.com/${match.programme}`}
                            alt={`Match Programme For ${match.homeTeam} ${match.score} ${match.awayTeam}, ${match.competition}, ${match.date}`}
                          />
                          <br />
                          <br />
                          <br />
                        </>
                      ) : (
                        ""
                      )}
                      {match.referee ? (
                        <>
                          <br />
                          Referee: <strong>{match.referee}</strong>
                        </>
                      ) : (
                        ""
                      )}
                      {match.venue ? (
                        <>
                          <br />
                          Venue: <strong>{match.venue}</strong>
                        </>
                      ) : (
                        ""
                      )}
                      {match.attendance ? (
                        <>
                          <br />
                          Attendance: <strong>{match.attendance}</strong>
                        </>
                      ) : (
                        ""
                      )}
                      <br />
                      <div itemScope itemType="https://schema.org/SportsTeam">
                        <span itemProp="name">Tranmere Rovers:</span>
                        {match.apps!.map((p, idx) => (
                          <>
                            <a
                              key={idx}
                              href={`/page/player/${p.Name}`}
                              itemProp="member"
                              itemScope
                              itemType="https://schema.org/athlete"
                            >
                              <span itemProp="name">{p.Name}</span>
                            </a>
                            {p.SubbedBy ? (
                              <>
                                {" "}
                                (
                                <a href={`/page/player/${p.SubbedBy}`}>
                                  {p.SubbedBy}
                                </a>{" "}
                                {p.SubTime}),{" "}
                              </>
                            ) : (
                              ", "
                            )}
                          </>
                        ))}
                      </div>
                      <br />
                      Scorers: <strong>{match.formattedGoals}</strong>
                    </div>
                  </aside>
                  <article className="col-md-8 content-body tranmere-results">
                    <div
                      className="col-md-12"
                      style={{ paddingBottom: "20px" }}
                    >
                      {match.pens ? <h2>{match.pens}</h2> : ""}
                      {match.report ? (
                        <>
                          <h2>Report</h2>
                          <span
                            dangerouslySetInnerHTML={{ __html: match.report }}
                          />
                        </>
                      ) : (
                        ""
                      )}

                      <h2>Team</h2>
                      <table className="pitch">
                        <tbody>
                          <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          <tr>
                            <SquadAppearance
                              players={goalkeepers}
                              colSpan={24}
                            ></SquadAppearance>
                          </tr>
                          <tr>
                            <SquadAppearance
                              players={fullback1}
                              colSpan={defColspan}
                            ></SquadAppearance>
                            <SquadAppearance
                              players={defenders}
                              colSpan={defColspan}
                            ></SquadAppearance>
                            <SquadAppearance
                              players={fullback2}
                              colSpan={defColspan}
                            ></SquadAppearance>
                          </tr>
                          <tr>
                            <SquadAppearance
                              players={wingers1}
                              colSpan={midColspan}
                            ></SquadAppearance>
                            <SquadAppearance
                              players={midfielders}
                              colSpan={midColspan}
                            ></SquadAppearance>
                            <SquadAppearance
                              players={wingers2}
                              colSpan={midColspan}
                            ></SquadAppearance>
                          </tr>
                          <tr>
                            <SquadAppearance
                              players={strikers}
                              colSpan={strColspan}
                            ></SquadAppearance>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-12">
                      {previous && previous.results.length > 0 ? (
                        <>
                          <h2>Previous 5 Matches</h2>
                          <div id="previous-five-content">
                            <ResultTable
                              results={previous.results}
                            ></ResultTable>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="col-md-12">
                      {next && next.results.length > 0 ? (
                        <>
                          <h2>Next 5 Matches</h2>
                          <div id="previous-five-content">
                            <ResultTable results={next.results}></ResultTable>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </>
  );
}
