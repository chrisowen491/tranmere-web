import { PlayerSearch } from "@/components/apps/PlayerSearch";
import { Title } from "@/components/fragments/Title";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { GetBaseUrl } from "@/lib/apiFunctions";
export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  let description: string | null = null;
  let title: string | null = null;

  if (params.slug === "most-appearances") {
    description = "Tranmere Rovers FC Top Appearances Since 1977";
    title = "Tranmere Record Appearances";
  } else if (params.slug === "only-one-appearance") {
    description = "Tranmere Rovers FC Players Who Only Played Once Since 1977";
    title = "Only Played Once For Tranmere";
  } else if (params.slug === "top-scorers") {
    description = "Tranmere Rovers FC Top Scorers Since 1977";
    title = "Tranmere Record Goalscorers";
  } else if (params.slug === "top-scorers") {
    description = "Tranmere Rovers FC Player Stats Season " + params.slug;
    title = "Tranmere Record Player Stats - Season " + params.slug;
  }

  return {
    title: title,
    description: description,
  };
}

export default async function PlayerSearchPage({
  params,
}: {
  params: { slug: string };
}) {
  const base = GetBaseUrl(getRequestContext().env) + "/player-search/";

  let season: string = "";
  let sort: string = "";
  let filter: string = "";
  let title: string | null = null;

  if (params.slug === "most-appearances") {
    sort = "Starts";
    title = "Tranmere Record Appearances";
  } else if (params.slug === "only-one-appearance") {
    filter = "OnlyOneApp";
    title = "Only Played Once For Tranmere";
  } else if (params.slug === "top-scorers") {
    sort = "Goals";
    title = "Tranmere Record Goalscorers";
  } else {
    season = params.slug;
    title = "Player Stats - Season " + params.slug;
  }

  const latestSeasonRequest = await fetch(
    base + `?season=${season}&sort=${sort}&filter=${filter}`,
  );

  const playerResults = (await latestSeasonRequest.json()) as {
    players: PlayerSeasonSummary[];
  };

  return (
    <>
      <Title title={title!} subTitle="Player Records"></Title>
      <PlayerSearch
        default={playerResults.players}
        sort={sort!}
        filter={filter!}
        season={season!}
      />
    </>
  );
}
