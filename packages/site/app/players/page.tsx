import { PlayerSearch } from "@/components/apps/PlayerSearch";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { getPlayerStatistics } from "@/lib/playerStatistics";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers players",
  description: "Tranmere Rovers player profiles, appearances and statistics.",
  pathname: "/players",
});

export default async function PlayerSearchPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const players = await getPlayerStatistics(env.DB, {
    sort: "Starts",
    limit: 50,
  });

  return (
    <main className="pb-24 text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers player archive",
          description:
            "Tranmere Rovers player statistics and profiles from 1977 onwards.",
          url: "https://www.tranmere-web.com/players",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: players.length,
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
        ])}
      />
      <header className="border-b border-[#071a2b]/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Player archive
          </p>
          <div className="mt-3 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Every player. Every season.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#071a2b]/65">
                Explore Tranmere careers from 1977 onwards. Filter the archive
                by season or position, then open any player for their complete
                Rovers record.
              </p>
            </div>
            <nav
              aria-label="Player record highlights"
              className="grid grid-cols-2 gap-px border border-[#071a2b]/15 bg-[#071a2b]/15"
            >
              {[
                ["Most appearances", "/players/records/most-appearances"],
                ["Only played once", "/players/records/only-one-appearance"],
                ["Top scorers", "/players/records/top-scorers"],
                ["Hat-tricks", "/players/hat-tricks"],
                ["Season leaders", "/players/top-scorers-by-season"],
                ["Lethal finishers", "/players/lethal-finishers"],
                ["Super subs", "/players/super-subs"],
                ["Misfiring strikers", "/players/misfiring-strikers"],
                ["Cult heroes", "/players/cult-heroes"],
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
        <PlayerSearch default={players} />
      </div>
    </main>
  );
}
