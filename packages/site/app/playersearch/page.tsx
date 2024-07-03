import { PlayerSearch } from "@/components/apps/PlayerSearch";
import { Title } from "@/components/layout/Title";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Metadata } from "next";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Players Home - Tranmere-Web",
  description: "Tranmere Rovers player infomation index",
};

export default async function PlayerSearchPage() {
  const base = GetBaseUrl(getRequestContext().env) + "/player-search/";

  var dateobj = new Date();
  var theYear =
    dateobj.getUTCMonth() > 6
      ? dateobj.getFullYear()
      : dateobj.getFullYear() - 1;

  const latestSeasonRequest = await fetch(
    base + `?season=${theYear}&sort=&filter=`,
  );
  const playerResults = (await latestSeasonRequest.json()) as {
    players: PlayerSeasonSummary[];
  };

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title="Players Home"></Title>
        </div>
      </section>

      <section className="overlay">
        <PlayerSearch default={playerResults.players} season="2023" />
      </section>
      <Footer></Footer>
    </>
  );
}
