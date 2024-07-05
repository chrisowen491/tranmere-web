import { Title } from "@/components/layout/Title";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TransferSearch } from "@/components/apps/TransferSearch";
import { GetAllTeams, GetBaseUrl } from "@/lib/apiFunctions";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { Metadata } from "next";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Transfers Home",
  description: "Tranmere Rovers transfer information index",
};

export default async function Transfers() {
  const base = GetBaseUrl(getRequestContext().env) + "/transfer-search/";

  const request = await fetch(base);
  const results = (await request.json()) as {
    transfers: Transfer[];
  };

  const teams = await GetAllTeams();

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title="Transfers Home"></Title>
        </div>
      </section>

      <section className="overlay">
        <TransferSearch default={results.transfers} teams={teams} />
      </section>
      <Footer></Footer>
    </>
  );
}
