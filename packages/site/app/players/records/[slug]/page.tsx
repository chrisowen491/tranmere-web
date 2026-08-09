import { PlayerSearch } from "@/components/apps/PlayerSearch";
import { Title } from "@/components/fragments/Title";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import { SlugParams } from "@/lib/types";
import { getPlayerStatistics } from "@/lib/playerStatistics";
import { pageMetadata } from "@/lib/seo";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
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
  }

  return pageMetadata({
    title: title ?? "Tranmere Rovers player records",
    description:
      description ?? "Tranmere Rovers player records and statistics.",
    pathname: `/players/records/${encodeURIComponent(params.slug)}`,
  });
}

export default async function PlayerSearchPage(props: { params: SlugParams }) {
  const params = await props.params;
  await connection();
  const env = (await getCloudflareContext({ async: true })).env;

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

  const players = await getPlayerStatistics(env.DB, {
    season,
    sort,
    filter,
  });

  return (
    <>
      <Title title={title!} subTitle="Player Records">
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-50">
          Use the filters to switch season or focus on a groups of players.
          Player records only go far back as 1977, though I am slowly filling in
          other years.
        </p>
      </Title>
      <div className="  mx-auto flex w-full max-w-7xl">
        <PlayerSearch
          default={players}
          sort={sort!}
          filter={filter!}
          season={season!}
        />
      </div>
    </>
  );
}
