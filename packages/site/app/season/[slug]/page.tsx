import { GetSeasons, GetYear } from "@tranmere-web/lib/src/apiFunctions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import SeasonReview from "@/components/apps/SeasonReview";
import { getAllArticlesForTag } from "@/lib/api";
import { getShirtsBySeason } from "@/lib/shirts";
import { SlugParams } from "@/lib/types";
import { notFound } from "next/navigation";
import { getManagers } from "@/lib/managers";
import { getTransfers } from "@/lib/transfers";
import { getPlayerStatistics } from "@/lib/playerStatistics";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { searchGames } from "@/lib/games";
import { queryLeagueSeasonSummaryRows } from "@tranmere-web/lib/src/d1-queries";

export const revalidate = 7200;

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  const season = decodeURI(params.slug);
  const seasonLabel = `${season}/${String(Number(season) + 1).slice(-2)}`;
  return pageMetadata({
    title: `Tranmere Rovers ${seasonLabel} season review`,
    description: `Tranmere Rovers ${seasonLabel} results, players, transfers and season story.`,
    pathname: `/season/${season}`,
  });
}

export default async function SeasonPage(props: { params: SlugParams }) {
  const params = await props.params;
  const season = decodeURI(params.slug);

  if (parseInt(season) < 1920 || parseInt(season) > GetYear()) notFound();

  const env = (await getCloudflareContext({ async: true })).env;
  const managers = await getManagers(env.DB);

  const results = await searchGames(env.DB, { season: Number(season) });

  const [leagueSummary] = await queryLeagueSeasonSummaryRows(env.DB, {
    season: Number(season),
  });

  const players = await getPlayerStatistics(env.DB, {
    season,
  });

  const transfers = await getTransfers(env.DB, { season });

  const articles = await getAllArticlesForTag(100, season);

  const shirts = await getShirtsBySeason(env.DB, season);

  const seasons = GetSeasons();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Tranmere Rovers ${season}/${String(Number(season) + 1).slice(-2)} season`,
          description: `Tranmere Rovers results, squad, transfers and season story for ${season}/${String(Number(season) + 1).slice(-2)}.`,
          url: `https://www.tranmere-web.com/season/${season}`,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Seasons", pathname: "/seasons" },
          {
            name: `${season}/${String(Number(season) + 1).slice(-2)}`,
            pathname: `/season/${season}`,
          },
        ])}
      />
      <SeasonReview
        managers={managers}
        results={results.results}
        h2hresults={results.h2hresults}
        h2htotal={results.h2htotal}
        players={players}
        season={season}
        seasons={seasons}
        transfers={transfers}
        articles={articles}
        shirts={shirts}
        leagueSummary={leagueSummary}
      ></SeasonReview>
    </>
  );
}
