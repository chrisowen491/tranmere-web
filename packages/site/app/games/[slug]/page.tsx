import { ResultsSearch } from "@/components/apps/Results";
import { Title } from "@/components/fragments/Title";
import {
  GetAllTeams,
  GetAllCupCompetitions,
  GetAllTranmereManagers,
  GetBaseUrl,
} from "@/lib/apiFunctions";
import {
  H2HResult,
  H2HTotal,
  Match,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { SlugParams } from "@/lib/types";

export const runtime = "edge";

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  let description: string | null = null;
  let title: string | null = null;

  if (params.slug === "at-wembley") {
    description = "Tranmere Rovers FC Results At Wembley Stadium";
    title = "Results At Wembley";
  } else if (params.slug === "penalty-shootouts") {
    description = "Tranmere Rovers FC Results In Penalty Shootouts";
    title = "Results - Penalty Shootouts";
  } else if (params.slug === "top-attendances") {
    description = "Tranmere Rovers FC Results Top Attendences";
    title = "Top Attendences";
  } else if (params.slug === "top-home-attendances") {
    description =
      "Tranmere Rovers FC Results Top Attendences At Home Prenton Park";
    title = "Top Home Attendences";
  } else if (params.slug.startsWith("19") || params.slug.startsWith("20")) {
    title = "Results - " + decodeURI(params.slug) + " Tranmere-Web";
    description =
      "Tranmere Rovers FC Results For Season " + decodeURI(params.slug);
  } else {
    description = "Tranmere Rovers FC Results Against" + decodeURI(params.slug);
    title = "Results vs " + decodeURI(params.slug);
  }

  return {
    title: title,
    description: description,
  };
}

export default async function GamesPage(props: { params: SlugParams }) {
  const params = await props.params;
  const base = GetBaseUrl(getRequestContext().env) + "/result-search/";

  let title: string | null = null;
  let sort = "Date";
  let venue = "";
  let pens = "";
  let season = "";
  let opposition = "";
  const competition = "";
  const manager = "";
  const competitions = await GetAllCupCompetitions();
  const managers = await GetAllTranmereManagers();
  const teams = await GetAllTeams();

  if (params.slug === "at-wembley") {
    venue = "Wembley Stadium";
    title = "Results At Wembley";
  } else if (params.slug === "penalty-shootouts") {
    pens = "Penalty Shootout";
    title = "Results - Penalty Shootouts";
  } else if (params.slug === "top-attendances") {
    sort = "Top Attendance";
    title = "Top Attendences";
  } else if (params.slug === "top-home-attendances") {
    sort = "Top Attendance";
    venue = "Prenton Park";
    title = "Top Home Attendences";
  } else if (params.slug.startsWith("19") || params.slug.startsWith("20")) {
    title = "Results - " + decodeURI(params.slug);
    season = decodeURI(params.slug);
  } else {
    title = "Results vs " + decodeURI(params.slug);
    opposition = decodeURI(params.slug);
  }

  const latestSeasonRequest = await fetch(
    base +
      `?season=${season}&venue=${venue}&pens=${encodeURI(pens)}&sort=${sort}&opposition=${opposition}&competition=${competition}`,
  );
  const results = (await latestSeasonRequest.json()) as {
    results: Match[];
    h2hresults: H2HResult[];
    h2htotal: H2HTotal[];
  };

  return (
    <>
      <Title title={title!}></Title>
      <ResultsSearch
        teams={teams}
        managers={managers}
        competitions={competitions}
        results={results.results}
        venue={venue}
        manager={manager}
        pens={pens}
        sort={sort}
        opposition={opposition}
        competition={competition}
        h2hresults={results.h2hresults}
        h2htotal={results.h2htotal}
        season={season}
        fullDate={true}
      />
    </>
  );
}
