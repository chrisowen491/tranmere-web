import { ResultsSearch } from "@/components/apps/Results";
import {
  GetAllCupCompetitions,
  GetYear,
} from "@tranmere-web/lib/src/apiFunctions";
import { getClubs } from "@/lib/clubs";
import { getManagers } from "@/lib/managers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { searchGames } from "@/lib/games";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = pageMetadata({
  title: "Tranmere Rovers results",
  description: "Search the complete Tranmere Rovers match-results archive.",
  pathname: "/results",
});

export default async function ResultsSearchPage() {
  await connection();
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
              aria-label="Explore the archive"
              className="grid grid-cols-2 gap-px border border-[#071a2b]/15 bg-[#071a2b]/15"
            >
              {[
                ["Wembley matches", "/games/at-wembley"],
                ["Penalty shootouts", "/games/penalty-shootouts"],
                ["FA Cup archive", "/results/fa-cup"],
                ["League Cup archive", "/results/league-cup"],
                ["Highest attendances", "/results/top-attendances"],
                ["Head-to-head records", "/head-to-head"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-[#fffdf8] px-4 py-4 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
                >
                  {label}
                </Link>
              ))}
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
