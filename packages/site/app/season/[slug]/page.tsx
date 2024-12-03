import { Title } from "@/components/fragments/Title";
import {
  GetAllTranmereManagers,
  GetBaseUrl,
  GetSeasons,
  GetYear,
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
import { SlugParams } from "@/lib/types";
import { parse } from "path";
import { notFound } from "next/navigation";
import { JumpBox } from "@/components/forms/JumpBox";

export const runtime = "edge";

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  let description: string | null = null;
  let title: string | null = null;

  title = "Season Review - " + decodeURI(params.slug) + " Tranmere-Web";
  description = "Tranmere Rovers Season Review : " + decodeURI(params.slug);

  return {
    title: title,
    description: description,
  };
}

export default async function SeasonPage(props: { params: SlugParams }) {
  const params = await props.params;
  const season = decodeURI(params.slug);

  if (parseInt(season) < 1920 || parseInt(season) > GetYear()) notFound();

  const base = GetBaseUrl(getRequestContext().env) + "/result-search/";
  let title: string | null = null;
  let sort = "Date";
  let venue = "";
  let pens = "";
  let opposition = "";
  let competition = "";
  const managers = await GetAllTranmereManagers();

  title = "Season: " + season;

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
      `/player-search/?season=${season}&sort=&filter=`,
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

  const seasons = GetSeasons();
  return (
    <>
      <Title title={title!}>
        <JumpBox season={season} seasons={seasons}></JumpBox>
      </Title>
      <SeasonReview
        managers={managers}
        results={results.results}
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
