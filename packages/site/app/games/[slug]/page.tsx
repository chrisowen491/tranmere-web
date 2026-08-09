import { ResultsSearch } from "@/components/apps/Results";
import { Title } from "@/components/fragments/Title";
import { GetAllCupCompetitions } from "@tranmere-web/lib/src/apiFunctions";
import { searchGames } from "@/lib/games";
import { getClubs } from "@/lib/clubs";
import { getManagers } from "@/lib/managers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import { SlugParams } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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

  return pageMetadata({
    title: title ?? "Tranmere Rovers results",
    description: description ?? "Tranmere Rovers results archive.",
    pathname: `/games/${encodeURIComponent(params.slug)}`,
  });
}

export default async function GamesPage(props: { params: SlugParams }) {
  const params = await props.params;
  await connection();
  const env = getCloudflareContext().env;

  let title: string | null = null;
  let sort = "Date";
  let venue = "";
  let pens = "";
  let season = "";
  let opposition = "";
  const competition = "";
  const manager = "";
  const [competitions, managers, teams] = await Promise.all([
    GetAllCupCompetitions(),
    getManagers(env.DB),
    getClubs(env.DB),
  ]);

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

  const results = await searchGames(env.DB, {
    season: season ? Number(season) : undefined,
    venue: venue || undefined,
    opposition: opposition || undefined,
    penalties: pens || undefined,
    sort: sort === "Top Attendance" ? "attendance-desc" : "date-asc",
  });

  return (
    <>
      <Title title={title!}></Title>
      <div className="  mx-auto flex w-full max-w-7xl">
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
      </div>
    </>
  );
}
