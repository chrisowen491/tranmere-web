import { GetBaseUrl } from "@/lib/apiFunctions";
import { PlayerProfile } from "@/lib/types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";

import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return {
    title: `Player Profile - ${decodeURI(params.slug)}`,
    description: `Player Profile for the Tranmere Rovers career of ${decodeURI(params.slug)}`,
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const url =
    GetBaseUrl(getRequestContext().env) +
    `/page/player/${decodeURI(params.slug)}?json=true`;

  const playerRequest = await fetch(url);

  const profile = (await playerRequest.json()) as PlayerProfile;

  if (!profile || !profile.player) notFound();

  const player = profile.player;

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section
        itemScope
        itemType="http://schema.org/athlete"
        className="hero overlay"
      >
        <div
          className="image image-overlay"
          style={{ backgroundImage: `url(${profile.image})` }}
        ></div>
        <div className="container">
          <div className="row align-items-end justify-content-between">
            <div className="col-7 text-white mb-md-0">
              <div className="row gutter-2">
                <div className="col">
                  <h1 className="mb-3" itemProp="name" id="PlayerName">
                    {player.name}
                  </h1>
                </div>
              </div>
            </div>
            <div className="col-5 pic">
              {player.picLink ? (
                <img
                  src={player.picLink}
                  alt="Image"
                  className="overlay-item-bottom"
                />
              ) : (
                <img
                  src="/assets/shirts/blank.svg"
                  alt="Image"
                  className="overlay-item-bottom"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="overlay" id="profile">
        <div className="container">
          {player.biography ? (
            <>
              {documentToReactComponents(
                player.biography as unknown as Document,
              )}
            </>
          ) : (
            ""
          )}
          <p>
            <strong>Debut:</strong> {profile.debut.Opposition} (
            {profile.debut.Date})
          </p>
          {player.position ? (
            <p>
              <strong>Born:</strong> {player.dateOfBirth}, {player.placeOfBirth}{" "}
            </p>
          ) : (
            ""
          )}
          <ul className="nav nav-tabs lavalamp mb-2" id="myTab" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link active"
                id="stats-tab"
                data-toggle="tab"
                href="#stats"
                role="tab"
                aria-controls="stats"
                aria-selected="true"
              >
                Stats
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="transfers-tab"
                data-toggle="tab"
                href="#transfers"
                role="tab"
                aria-controls="transfers"
                aria-selected="false"
              >
                Transfers
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="links-tab"
                data-toggle="tab"
                href="#links"
                role="tab"
                aria-controls="links"
                aria-selected="false"
              >
                Links
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="apps-tab"
                data-toggle="tab"
                href="#apps"
                role="tab"
                aria-controls="apps"
                aria-selected="false"
              >
                Apps
              </a>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className="tab-pane fade  show active"
              id="stats"
              role="tabpanel"
              aria-labelledby="stats-tab"
            >
              <table className="table table-striped boxed">
                <thead>
                  <tr>
                    <th scope="col">Season</th>
                    <th scope="col" className="text-center">
                      Starts
                    </th>
                    <th scope="col" className="text-center">
                      Goals
                    </th>
                    <th
                      scope="col"
                      className="text-center d-none d-md-table-cell"
                    >
                      Assists
                    </th>
                    <th
                      scope="col"
                      className="text-center d-none d-lg-table-cell"
                    >
                      Headers
                    </th>
                    <th
                      scope="col"
                      className="text-center d-none d-lg-table-cell"
                    >
                      Free Kicks
                    </th>
                    <th
                      scope="col"
                      className="text-center d-none d-lg-table-cell"
                    >
                      Penalties
                    </th>
                    <th
                      scope="col"
                      className="text-center d-none d-md-table-cell"
                    >
                      Yellow Cards
                    </th>
                    <th
                      scope="col"
                      className="text-center d-none d-md-table-cell"
                    >
                      Red Cards
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profile.seasons.map((season, idx) => (
                    <tr key={idx}>
                      <td>
                        <a href={`/games/${season.Season}`}>{season.Season}</a>
                      </td>
                      <td className="text-center">
                        {season.starts} ({season.subs})
                      </td>
                      <td className="text-center">{season.goals}</td>
                      <td className="text-center d-none d-md-table-cell">
                        {season.assists}
                      </td>
                      <td className="text-center d-none d-lg-table-cell">
                        {season.headers}
                      </td>
                      <td className="text-center d-none d-lg-table-cell">
                        {season.freekicks}
                      </td>
                      <td className="text-center d-none d-lg-table-cell">
                        {season.penalties}
                      </td>
                      <td className="text-center d-none d-md-table-cell">
                        {season.yellow}
                      </td>
                      <td className="text-center d-none d-md-table-cell">
                        {season.red}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="tab-pane fade"
              id="transfers"
              role="tabpanel"
              aria-labelledby="transfers-tab"
            >
              <table className="table table-striped boxed">
                <thead>
                  <tr>
                    <th scope="col">Season</th>
                    <th scope="col">In/Out</th>
                    <th scope="col">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.transfers.map((transfer, idx) => (
                    <tr key={idx}>
                      <td>
                        <small>
                          <time
                            dateTime={transfer.season.toString()}
                            className="text-muted d-block"
                          >
                            {transfer.season}
                          </time>
                        </small>
                      </td>
                      <td>
                        <small>
                          <span className="icon-arrow-{{type}}"></span>
                          {transfer.club}
                        </small>
                      </td>
                      <td>
                        <small>{transfer.value}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="tab-pane fade"
              id="links"
              role="tabpanel"
              aria-labelledby="links-tab"
            >
              <table className="table table-striped boxed">
                <tbody>
                  {profile.links.map((link, idx) => (
                    <tr key={idx}>
                      <td>
                        <a href={link.link}>{link.description}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="tab-pane fade"
              id="apps"
              role="tabpanel"
              aria-labelledby="apps-tab"
            >
              <table className="table table-striped boxed">
                <thead>
                  <tr>
                    <th scope="col">Season</th>
                    <th
                      scope="col"
                      className="text-center d-none d-md-table-cell"
                    >
                      Competition
                    </th>
                    <th
                      scope="col"
                      className="text-center d-none d-md-table-cell"
                    >
                      Start/Sub
                    </th>
                    <th scope="col">Opposition</th>
                    <th scope="col" className="text-center">
                      Goals
                    </th>
                    <th
                      scope="col"
                      className="text-center d-none d-md-table-cell"
                    >
                      Subbed By/For
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profile.appearances.map((appearance, idx) => (
                    <tr key={idx}>
                      <td scope="col">
                        <a href={`/games/${appearance.Season}`}>
                          {appearance.Season}
                        </a>
                      </td>
                      <td
                        scope="col"
                        className="text-center d-none d-md-table-cell"
                      >
                        {appearance.Competition}
                      </td>
                      <td
                        scope="col"
                        className="text-center d-none d-md-table-cell"
                      >
                        {appearance.Type}
                      </td>
                      <td scope="col">
                        <a
                          href={`/match/${appearance.Season}/${appearance.Date}`}
                        >
                          {appearance.Opposition} ({appearance.Date})
                        </a>
                      </td>
                      <td scope="col" className="text-center">
                        {appearance.Goals}
                      </td>
                      <td
                        scope="col"
                        className="text-center d-none d-md-table-cell"
                      >
                        <a href={`/page/player/${appearance.SubbedBy}`}>
                          {appearance.SubbedBy}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </>
  );
}
