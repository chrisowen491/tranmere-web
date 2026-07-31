import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MatchParams } from "@/lib/types";
import { Match, MatchPageData } from "@tranmere-web/lib/src/tranmere-web-types";
import { GetBaseUrl } from "@/lib/apiFunctions";
import MatchReport from "@/components/apps/MatchReport";
import { GetCommentsByUrl } from "@/lib/comments";
import { notFound } from "next/navigation";
import { getApprovedAttendance } from "@/lib/attendanceCorrections";
import { enrichMatchPlayers } from "@/lib/matchPlayers";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata(props: { params: MatchParams }) {
  const params = await props.params;
  const url = `${GetBaseUrl(getCloudflareContext().env)}/match/${params.season}/${params.date}`;

  const matchRequest = await fetch(url);
  const match = (await matchRequest.json()) as MatchPageData;
  const approvedAttendance = await getApprovedAttendance(
    getCloudflareContext().env.DB,
    params.season,
    params.date,
  );
  if (approvedAttendance !== null) {
    match.attendance = approvedAttendance;
  }
  return pageMetadata({
    title: `${match.homeTeam} ${match.score} ${match.awayTeam}`,
    description: `${match.competition ?? "Football"} match report: ${match.homeTeam} ${match.score} ${match.awayTeam}, played on ${match.date}.`,
    pathname: `/match/${params.season}/${params.date}`,
  });
}

export default async function MatchPage(props: { params: MatchParams }) {
  const params = await props.params;
  const env = (await getCloudflareContext({ async: true })).env;
  const baseUrl = `/match/${params.season}/${params.date}`;
  const url = `${GetBaseUrl(env)}${baseUrl}`;

  const matchRequest = await fetch(url);

  if (matchRequest.status != 200) notFound();

  const match = await enrichMatchPlayers(
    env.DB,
    (await matchRequest.json()) as MatchPageData,
  );

  const seasonMatchesUrl = `${GetBaseUrl(env)}/result-search/?season=${match.season}`;

  const seasonMatches = await fetch(seasonMatchesUrl);

  const matches = (await seasonMatches.json()) as {
    results: Match[];
  };

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
      ></MatchReport>
    </>
  );
}
