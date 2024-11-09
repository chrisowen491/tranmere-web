import { getRequestContext } from "@cloudflare/next-on-pages";
import { MatchPageData, MatchParams } from "@/lib/types";
import { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { GetBaseUrl } from "@/lib/apiFunctions";
import MatchReport from "@/components/apps/MatchReport";
import { GetCommentsByUrl } from "@/lib/comments";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata(props: { params: MatchParams }) {

  const params = await props.params;
  const url = `${GetBaseUrl(getRequestContext().env)}/match/${params.season}/${params.date}`;

  const matchRequest = await fetch(url);
  const match = (await matchRequest.json()) as MatchPageData;
  return {
    title: `Match Summary - ${match.homeTeam} ${match.score} ${match.awayTeam}`,
    description: `Match Summary For ${match.homeTeam} ${match.score} ${match.awayTeam} - ${match.date}`,
  };
}

export default async function MatchPage(props: { params: MatchParams }) {

  const params = await props.params;
  const baseUrl = `/match/${params.season}/${params.date}`;
  const url = `${GetBaseUrl(getRequestContext().env)}${baseUrl}`;

  const matchRequest = await fetch(url);

  if (matchRequest.status != 200) notFound();

  const match = (await matchRequest.json()) as MatchPageData;

  const seasonMatchesUrl = `${GetBaseUrl(getRequestContext().env)}/result-search/?season=${match.season}`;

  const seasonMatches = await fetch(seasonMatchesUrl);

  const matches = (await seasonMatches.json()) as {
    results: Match[];
  };


  const next = matches.results.filter((m) => m.date > match.date).slice(0, 5);
  const previous = matches.results.filter((m) => m.date < match.date).slice(0, 5);

  const comments = await GetCommentsByUrl(getRequestContext().env, baseUrl);
  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  return (
    <MatchReport
      match={match}
      next={next}
      previous={previous}
      comments={comments}
      url={baseUrl}
      avg={avg}
    ></MatchReport>
  );
}
