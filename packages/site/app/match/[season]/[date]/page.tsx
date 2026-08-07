import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MatchParams } from "@/lib/types";
import { MatchPageData } from "@tranmere-web/lib/src/tranmere-web-types";
import { GetBaseUrl } from "@/lib/apiFunctions";
import MatchReport from "@/components/apps/MatchReport";
import { GetCommentsByUrl } from "@/lib/comments";
import { notFound } from "next/navigation";
import { enrichMatchPlayers } from "@/lib/matchPlayers";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getManagerAtDate } from "@/lib/managers";
import {
  getGameBySeasonAndDate,
  getMatchReport,
  searchGames,
} from "@/lib/games";

export async function generateMetadata(props: { params: MatchParams }) {
  const params = await props.params;
  const env = getCloudflareContext().env;
  const match = await getGameBySeasonAndDate(
    env.DB,
    params.season,
    params.date,
  );
  if (!match) notFound();
  return pageMetadata({
    title: `${match.home} ${match.ft} ${match.visitor}`,
    description: `${match.competition ?? "Football"} match report: ${match.home} ${match.ft} ${match.visitor}, played on ${match.date}.`,
    pathname: `/match/${params.season}/${params.date}`,
  });
}

export default async function MatchPage(props: { params: MatchParams }) {
  const params = await props.params;
  const env = (await getCloudflareContext({ async: true })).env;
  const baseUrl = `/match/${params.season}/${params.date}`;
  const [game, reportRow, matchRequest] = await Promise.all([
    getGameBySeasonAndDate(env.DB, params.season, params.date),
    getMatchReport(env.DB, params.date),
    fetch(`${GetBaseUrl(env)}${baseUrl}`),
  ]);
  if (!game) notFound();
  const apiMatch = matchRequest.ok
    ? ((await matchRequest.json()) as MatchPageData)
    : null;
  const matchData: MatchPageData = {
    ...game,
    ...apiMatch,
    ...game,
    report: reportRow
      ? { day: reportRow.match_date, report: reportRow.report }
      : apiMatch?.report,
    apps: apiMatch?.apps,
    goals: apiMatch?.goals,
  };
  const [match, manager] = await Promise.all([
    enrichMatchPlayers(env.DB, matchData),
    getManagerAtDate(env.DB, matchData.date),
  ]);

  const matches = await searchGames(env.DB, { season: Number(match.season) });

  const next = matches.results.filter((m) => m.date > match.date).slice(0, 5);
  const previousMatches = matches.results.filter((m) => m.date < match.date);
  const previous = previousMatches.slice(
    Math.max(previousMatches.length - 5, 0),
  );

  const comments = await GetCommentsByUrl(env, baseUrl);
  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          name: `${match.homeTeam} ${match.score} ${match.awayTeam}`,
          url: absoluteUrl(baseUrl),
          startDate: match.date,
          eventStatus: "https://schema.org/EventScheduled",
          competitor: [
            { "@type": "SportsTeam", name: match.homeTeam },
            { "@type": "SportsTeam", name: match.awayTeam },
          ],
          location: match.venue
            ? { "@type": "Place", name: match.venue }
            : undefined,
          description: `${match.competition ?? "Football"} match: ${match.homeTeam} ${match.score} ${match.awayTeam}.`,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Results", pathname: "/results" },
          {
            name: `${match.season}/${Number(match.season) + 1}`,
            pathname: `/season/${match.season}`,
          },
          {
            name: `${match.homeTeam} ${match.score} ${match.awayTeam}`,
            pathname: baseUrl,
          },
        ])}
      />
      <MatchReport
        match={match}
        next={next}
        previous={previous}
        comments={comments}
        url={baseUrl}
        avg={avg}
        manager={manager}
      ></MatchReport>
    </>
  );
}
