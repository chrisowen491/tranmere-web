import { ResultsSearch } from "@/components/apps/Results";
import {
  GetAllCupCompetitions,
  GetYear,
} from "@tranmere-web/lib/src/apiFunctions";
import { getClubs } from "@/lib/clubs";
import { getManagers } from "@/lib/managers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { searchGames } from "@/lib/games";

export const metadata = pageMetadata({
  title: "Tranmere Rovers results",
  description: "Search the complete Tranmere Rovers match-results archive.",
  pathname: "/results",
});

export default async function ResultsSearchPage() {
  const env = (await getCloudflareContext({ async: true })).env;

  const theYear = GetYear();
  const [competitions, managers, teams] = await Promise.all([
    GetAllCupCompetitions(),
    getManagers(env.DB),
    getClubs(env.DB),
  ]);

  const results = await searchGames(env.DB, { season: theYear });

  return (
    <main className="pb-24 text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers results archive",
          description: "Searchable Tranmere Rovers match results archive.",
          url: "https://www.tranmere-web.com/results",
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Results", pathname: "/results" },
        ])}
      />
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
              className="rounded-sm border border-[#071a2b]/15 bg-[#fffdf8] p-2 shadow-[0_12px_28px_rgba(7,26,43,0.06)]"
            >
              <p className="px-3 pt-2 text-xs font-bold uppercase tracking-[0.15em] text-[#071a2b]/45">
                Explore the archive
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["Wembley matches", "/games/at-wembley"],
                  ["Penalty shootouts", "/games/penalty-shootouts"],
                  ["FA Cup archive", "/results/fa-cup"],
                  ["League Cup archive", "/results/league-cup"],
                  ["Highest attendances", "/results/top-attendances"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex min-h-20 flex-col justify-between rounded-sm bg-[#f4f0e8] px-4 py-3 text-sm font-bold transition hover:bg-[#071a2b] hover:text-white ${
                      href === "/results/top-attendances" ? "col-span-2" : ""
                    }`}
                  >
                    {label}
                    <ArrowRightIcon className="mt-3 h-4 w-4 text-blue-700 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                ))}
                <Link
                  href="/head-to-head"
                  className="group col-span-2 flex items-center justify-between rounded-sm bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-[#071a2b]"
                >
                  Head-to-head records
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
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
