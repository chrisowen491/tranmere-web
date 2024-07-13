import { ResultsSearch } from "@/components/apps/Results";
import { Title } from "@/components/fragments/Title";
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
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Results Home",
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
    <Title title="Results Home" summary={""}>
      <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-50">Search for results by season or opposition - or view <a href='/games/at-wembley' className='text-indigo-600'>results at wembley</a> or <a href='/games/penalty-shootouts' className='text-indigo-600'>penalty shootouts</a></p>
    </Title>
    <ResultsSearch
      teams={teams}
      managers={managers}
      competitions={competitions}
      results={results.results}
      h2hresults={results.h2hresults}
      h2htotal={results.h2htotal}
      season={theYear.toString()}
    />
    </>
  );
}
