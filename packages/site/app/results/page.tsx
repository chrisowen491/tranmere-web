import { ResultsSearch } from "@/components/apps/Results";
import { Title } from "@/components/layout/Title";
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
} from "@tranmere-web/lib/src/tranmere-web-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Results Home - Tranmere-Web",
  description: "Tranmere Rovers results infomation index",
};

export default async function ResultsSearchPage() {
  const base = GetBaseUrl(getRequestContext().env) + "/result-search/";

  var dateobj = new Date();
  var theYear =
    dateobj.getUTCMonth() > 6
      ? dateobj.getFullYear()
      : dateobj.getFullYear() - 1;

  const competitions = await GetAllCupCompetitions();
  const managers = await GetAllTranmereManagers();
  const teams = await GetAllTeams();

  const latestSeasonRequest = await fetch(base + `?season=${theYear}`);
  const results = (await latestSeasonRequest.json()) as {
    results: Match[];
    h2hresults: H2HResult[];
    h2htotal: H2HTotal[];
  };

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title="Results Home"></Title>
        </div>
      </section>

      <section className="overlay">
        <ResultsSearch
          teams={teams}
          managers={managers}
          competitions={competitions}
          results={results.results}
          h2hresults={results.h2hresults}
          h2htotal={results.h2htotal}
          season={theYear.toString()}
        />
      </section>
      <Footer></Footer>
    </>
  );
}
