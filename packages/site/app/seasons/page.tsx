import Link from "next/link";
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers seasons",
  description: "Browse every recorded Tranmere Rovers season by decade.",
  pathname: "/seasons",
});

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

export default function SeasonsIndexPage() {
  const seasons = GetSeasons().filter(
    (season) => season < 1939 || season > 1944,
  );
  const decades = seasons.reduce((groups, season) => {
    const decade = Math.floor(season / 10) * 10;
    groups.set(decade, [...(groups.get(decade) ?? []), season]);
    return groups;
  }, new Map<number, number[]>());

  return (
    <main className="min-h-screen pb-24 text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers season archive",
          description: "A decade-by-decade index of Tranmere Rovers seasons.",
          url: "https://www.tranmere-web.com/seasons",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: seasons.length,
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Seasons", pathname: "/seasons" },
        ])}
      />

      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Season archive
          </p>
          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
                Every season, one Rovers story at a time.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Open a season to explore its results, squad, transfers, shirts
                and the moments that shaped it.
              </p>
            </div>
            <div className="border border-white/15 p-6">
              <CalendarDaysIcon className="h-6 w-6 text-blue-300" />
              <p className="mt-8 font-display text-5xl font-semibold">
                {seasons.length}
              </p>
              <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                Recorded seasons
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="space-y-14">
          {[...decades.entries()]
            .sort(([a], [b]) => b - a)
            .map(([decade, decadeSeasons]) => (
              <section key={decade}>
                <div className="mb-5 flex items-end justify-between border-b border-[#071a2b]/15 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                      Decade
                    </p>
                    <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                      {decade}s
                    </h2>
                  </div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
                    {decadeSeasons.length} seasons
                  </p>
                </div>
                <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {decadeSeasons.map((season) => (
                    <Link
                      key={season}
                      href={`/season/${season}`}
                      className="group flex min-h-32 flex-col justify-between bg-[#fffdf8] p-5 transition hover:bg-blue-700 hover:text-white"
                    >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40 group-hover:text-blue-100">
                        Season review
                      </span>
                      <span className="flex items-end justify-between gap-3">
                        <strong className="font-display text-2xl font-semibold tracking-[-0.04em]">
                          {seasonLabel(season)}
                        </strong>
                        <ArrowUpRightIcon className="h-5 w-5 text-blue-700 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </main>
  );
}
