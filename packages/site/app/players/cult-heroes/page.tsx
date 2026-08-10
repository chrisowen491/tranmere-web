import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getCultHeroSections } from "@/lib/cultHeroes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers cult heroes",
  description:
    "Discover Tranmere Rovers cult heroes through long spells, comebacks, cup goals, promotion campaigns and appearances from the bench.",
  pathname: "/players/cult-heroes",
});

export default async function CultHeroesPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const sections = await getCultHeroSections(env.DB);
  const totalHeroes = new Set(
    sections.flatMap((section) => section.heroes.map((hero) => hero.name)),
  ).size;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          { name: "Cult heroes", pathname: "/players/cult-heroes" },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Player archive
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
                Cult heroes.
                <br />
                By the numbers.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                The archive has its own way of identifying the players fans
                remember: lengthy Rovers spells, unexpected returns, cup
                moments, promotion runs and the trusted names from the bench.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Hero routes
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {sections.length}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Players found
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {totalHeroes}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <nav
        aria-label="Cult hero categories"
        className="border-b border-[#071a2b]/15 bg-[#e8e2d6]"
      >
        <div className="mx-auto flex max-w-7xl gap-px overflow-x-auto px-6 sm:px-10 lg:px-12">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 border-x border-[#071a2b]/10 bg-[#fffdf8] px-4 py-4 text-sm font-bold transition hover:bg-[#071a2b] hover:text-white"
            >
              {section.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-12 max-w-3xl border-l-2 border-blue-700 pl-5 text-sm leading-6 text-[#071a2b]/65">
          This is a discovery index rather than a definitive ranking. Each
          route surfaces a different kind of Rovers story from the recorded
          appearances, goals and season summaries in the Tranmere-Web database.
        </div>

        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-6">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    {section.eyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                    {section.title}
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-[#071a2b]/60">
                  {section.description}
                </p>
              </div>

              {section.heroes.length ? (
                <ol className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 md:grid-cols-2">
                  {section.heroes.map((hero, index) => (
                    <li key={hero.name} className="bg-[#fffdf8]">
                      <Link
                        href={`/page/player/${encodeURIComponent(hero.name)}`}
                        className="group flex min-h-full gap-3 p-4 transition hover:bg-white sm:gap-5 sm:p-6"
                      >
                        <span className="w-5 shrink-0 pt-1 text-center font-mono text-xs text-[#071a2b]/40">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <Image
                          src={hero.profile.picLink}
                          alt=""
                          width={96}
                          height={96}
                          unoptimized
                          className="h-14 w-14 shrink-0 rounded-full border border-[#071a2b]/10 bg-[#071a2b] object-cover sm:h-16 sm:w-16"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2 sm:gap-4">
                            <div>
                              <h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.03em] transition group-hover:text-blue-700 sm:text-2xl">
                                {hero.name}
                              </h3>
                              <p className="mt-1 text-sm font-semibold text-blue-700">
                                {hero.headline}
                              </p>
                            </div>
                            <ArrowRightIcon className="mt-1 h-5 w-5 shrink-0 text-blue-700 transition group-hover:translate-x-1" />
                          </div>
                          <div className="mt-3 flex flex-col items-start gap-2 border-t border-[#071a2b]/10 pt-3 sm:mt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                            <p className="text-xs leading-5 text-[#071a2b]/55">
                              {hero.detail}
                            </p>
                            <span className="flex max-w-full flex-wrap items-center gap-x-1.5 font-mono text-xs font-bold text-[#071a2b] sm:shrink-0">
                              <SparklesIcon className="h-3.5 w-3.5 text-blue-700" />
                              {hero.value} {hero.valueLabel}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 text-sm text-[#071a2b]/60">
                  No recorded players meet this route yet.
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
