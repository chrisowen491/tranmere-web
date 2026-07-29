import { GetSeasons, GetYear } from "@tranmere-web/lib/src/apiFunctions";
import {
  H2HResult,
  H2HTotal,
  Match,
  PlayerSeasonSummary,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import SeasonReview from "@/components/apps/SeasonReview";
import { getAllArticlesForTag, getAllShirts } from "@/lib/api";
import { SlugParams } from "@/lib/types";
import { notFound } from "next/navigation";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getManagers } from "@/lib/managers";
import { getTransfers } from "@/lib/transfers";

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

  const env = (await getCloudflareContext({ async: true })).env;
  const baseUrl = GetBaseUrl(env);
  const base = baseUrl + "/result-search/";
  const sort = "Date";
  const venue = "";
  const pens = "";
  const opposition = "";
  const competition = "";
  const managers = await getManagers(env.DB);

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
    baseUrl + `/player-search/?season=${season}&sort=&filter=`,
  );

  const playerResults = (await latestSeasonPlayerRequest.json()) as {
    players: PlayerSeasonSummary[];
  };

  const transfers = await getTransfers(env.DB, { season });

  const articles = await getAllArticlesForTag(100, season);

  const shirts = await getAllShirts();
  const filteredShirts = shirts.filter((s) => s.seasons.includes(season));

  const seasons = GetSeasons();
  return (
    <SeasonReview
      managers={managers}
      results={results.results}
      h2hresults={results.h2hresults}
      h2htotal={results.h2htotal}
      players={playerResults.players}
      season={season}
      seasons={seasons}
      transfers={transfers}
      articles={articles}
      shirts={filteredShirts}
    ></SeasonReview>
  );
}
