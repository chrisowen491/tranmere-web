import { PlayerSearch } from "@/components/apps/PlayerSearch";
import { Title } from "@/components/layout/Title";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
    title = "Tranmere Record Appearances - Tranmere-Web";
  } else if (params.slug === "only-one-appearance") {
    description = "Tranmere Rovers FC Players Who Only Played Once Since 1977";
    title = "Only Played Once For Tranmere  - Tranmere-Web";
  } else if (params.slug === "top-scorers") {
    description = "Tranmere Rovers FC Top Scorers Since 1977";
    title = "Tranmere Record Goalscorers - Tranmere-Web";
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
  }

  const latestSeasonRequest = await fetch(
    base + `?season=${season}&sort=${sort}&filter=${filter}`,
  );

  const playerResults = (await latestSeasonRequest.json()) as {
    players: PlayerSeasonSummary[];
  };

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title={title!}></Title>
        </div>
      </section>

      <section className="overlay">
        <PlayerSearch
          default={playerResults.players}
          sort={sort!}
          filter={filter!}
          season={season!}
        />
      </section>
      <Footer></Footer>
    </>
  );
}
