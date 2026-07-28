import { ResultsSearch } from "@/components/apps/Results";
import {
  GetAllTeams,
  GetAllCupCompetitions,
  GetYear,
} from "@tranmere-web/lib/src/apiFunctions";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getManagers } from "@/lib/managers";
import {
  H2HResult,
  H2HTotal,
  Match,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Results Home",
  description: "Tranmere Rovers results infomation index",
};

export default async function ResultsSearchPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const base = GetBaseUrl(env) + "/result-search/";

  const theYear = GetYear();
  const [competitions, managers, teams] = await Promise.all([
    GetAllCupCompetitions(),
    getManagers(env.DB),
    GetAllTeams(),
  ]);

  const latestSeasonRequest = await fetch(base + `?season=${theYear}`);
  const results = (await latestSeasonRequest.json()) as {
    results: Match[];
    h2hresults: H2HResult[];
    h2htotal: H2HTotal[];
  };

  return (
    <main className="pb-24 text-[#071a2b]">
      <header className="border-b border-[#071a2b]/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Match archive
          </p>
          <div className="mt-3 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
                The complete Rovers record.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#071a2b]/65">
                Search every result by season, opposition, competition, manager
                or venue—from Prenton Park to Wembley.
              </p>
            </div>
            <nav
              aria-label="Featured result collections"
              className="grid grid-cols-2 gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-3"
            >
              <Link
                href="/games/at-wembley"
                className="bg-[#fffdf8] px-4 py-4 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
              >
                Wembley matches
              </Link>
              <Link
                href="/games/penalty-shootouts"
                className="bg-[#fffdf8] px-4 py-4 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
              >
                Penalty shootouts
              </Link>
              <Link
                href="/head-to-head"
                className="col-span-2 bg-[#fffdf8] px-4 py-4 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700 sm:col-span-1"
              >
                Head-to-head
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl">
        <ResultsSearch
          teams={teams}
          managers={managers}
          competitions={competitions}
          results={results.results}
          h2hresults={results.h2hresults}
          h2htotal={results.h2htotal}
          season={theYear.toString()}
        />
      </div>
    </main>
  );
}
