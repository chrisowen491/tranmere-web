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
  PlayerSeasonSummary,
  Transfer,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import SeasonReview from "@/components/apps/SeasonReview";
import { getAllArticlesForTag } from "@/lib/api";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  let description: string | null = null;
  let title: string | null = null;

  title = "Season Review - " + decodeURI(params.slug) + " Tranmere-Web";
  description = "Tranmere Rovers Season REview : " + decodeURI(params.slug);

  return {
    title: title,
    description: description,
  };
}

export default async function GamesPage({
  params,
}: {
  params: { slug: string };
}) {
  const base = GetBaseUrl(getRequestContext().env) + "/result-search/";

  let title: string | null = null;
  let sort = "Date";
  let venue = "";
  let pens = "";
  let season = "";
  let opposition = "";
  let competition = "";
  let manager = "";
  const competitions = await GetAllCupCompetitions();
  const managers = await GetAllTranmereManagers();
  const teams = await GetAllTeams();

  title = "Season Summary - " + decodeURI(params.slug);
  season = decodeURI(params.slug);

  const latestSeasonRequest = await fetch(
    base +
      `?season=${season}&venue=${venue}&pens=${encodeURI(pens)}&sort=${sort}&opposition=${opposition}&competition=${competition}`,
  );
  const results = (await latestSeasonRequest.json()) as {
    results: Match[];
    h2hresults: H2HResult[];
    h2htotal: H2HTotal[];
  };

  const latestSeasonPlayerRequest = await fetch(
    GetBaseUrl(getRequestContext().env) +
      `/player-search/?season=${season}&sort==&filter=`,
  );

  const playerResults = (await latestSeasonPlayerRequest.json()) as {
    players: PlayerSeasonSummary[];
  };

  const request = await fetch(
    GetBaseUrl(getRequestContext().env) + `/transfer-search/?season=${season}`,
  );
  const transfers = (await request.json()) as {
    transfers: Transfer[];
  };

  const articles = await getAllArticlesForTag(100, season);

  return (
    <>
      <Title title={title!}></Title>
      <SeasonReview
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
        players={playerResults.players}
        season={season}
        transfers={transfers.transfers}
        articles={articles}
      ></SeasonReview>
    </>
  );
}
