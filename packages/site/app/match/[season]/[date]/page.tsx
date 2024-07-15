import { getRequestContext } from "@cloudflare/next-on-pages";
import { MatchPageData } from "@/lib/types";
import { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { GetBaseUrl } from "@/lib/apiFunctions";
import MatchReport from "@/components/apps/MatchReport";
import { GetCommentsByUrl } from "@/lib/comments";

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
  const baseUrl = `/match/${params.season}/${params.date}`;
  const url = `${GetBaseUrl(getRequestContext().env)}${baseUrl}`;

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

  const comments = await GetCommentsByUrl(getRequestContext().env, baseUrl);
  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  return (
    <MatchReport
      match={match}
      next={next.results}
      previous={previous.results}
      comments={comments}
      url={baseUrl}
      avg={avg}
    ></MatchReport>
  );
}
