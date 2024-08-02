import { GetLastMatch } from "@/lib/apiFunctions";
import Link from "next/link";
import { LinkButton } from "../forms/LinkButton";

export async function LastMatch() {
  const match = await GetLastMatch();
  if (!match) {
    return <div></div>;
  }
  const score = `${match.home} ${match.ft} ${match.visitor}`;
  return (
    <div
      className="card mb-8"
      itemScope
      itemType="https://schema.org/SportsEvent"
    >
      <div className="card-body pr-8">
        <h3 className="fs-28 text-dark">
          <b>Last Match</b>{" "}
        </h3>
        {match.largeProgramme ? (
          <meta
            itemProp="image"
            content={`https://images.tranmere-web.com/${match.largeProgramme}`}
          />
        ) : (
          ""
        )}

        <meta itemProp="startDate" content={match.date} />
        <meta itemProp="awayTeam" content={match.visitor} />
        <meta itemProp="homeTeam" content={match.home} />
        <meta itemProp="name" content={score} />
        <meta itemProp="location" content={match.home} />
        <h5>
          {match.opposition} ({match.ft})
        </h5>
        {match.largeProgramme ? (
          <p className="mt-2">
            {" "}
            <img
              src={`https://images.tranmere-web.com/${match.largeProgramme}`}
            />
          </p>
        ) : (
          ""
        )}
        <LinkButton
          href={`/match/${match.season}/${match.date}`}
          text="Match Report"
        ></LinkButton>
        <i className="icon-trophy icon-background"></i>
      </div>
    </div>
  );
}
