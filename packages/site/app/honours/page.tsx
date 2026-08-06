import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import {
  HONOURS_SEASONS,
  type HonoursAchievementKind,
} from "@tranmere-web/lib/src/honours-constants";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers honours and landmark seasons",
  description:
    "Explore every season in which Tranmere Rovers won a trophy, earned promotion or reached a major cup milestone.",
  pathname: "/honours",
});

const achievementCount = HONOURS_SEASONS.reduce(
  (total, season) => total + season.achievements.length,
  0,
);
const winningHonourCount = HONOURS_SEASONS.reduce(
  (total, season) =>
    total +
    season.achievements.filter(
      (achievement) =>
        achievement.kind === "Trophy" || achievement.kind === "Play-offs",
    ).length,
  0,
);

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

function badgeClasses(kind: HonoursAchievementKind) {
  switch (kind) {
    case "Trophy":
      return "bg-amber-100 text-amber-900";
    case "Promotion":
      return "bg-emerald-100 text-emerald-900";
    case "Play-offs":
      return "bg-blue-100 text-blue-900";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function HonoursPage() {
  const recentFirst = [...HONOURS_SEASONS].reverse();

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Honours", pathname: "/honours" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers honours and landmark seasons",
          description:
            "Seasons in which Tranmere Rovers won a trophy, earned promotion or reached a major cup milestone.",
          url: "https://www.tranmere-web.com/honours",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: HONOURS_SEASONS.length,
            itemListElement: recentFirst.map(({ season }, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `${seasonLabel(season)} season`,
              url: `https://www.tranmere-web.com/season/${season}`,
            })),
          },
        }}
      />

      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Honours archive
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
                The seasons that
                <br />
                made history.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Every recorded title, promotion, play-off triumph and landmark
                cup run—collected into one journey through the Rovers archive.
              </p>
            </div>
            <dl className="grid grid-cols-3 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Seasons
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {HONOURS_SEASONS.length}
                </dd>
              </div>
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Achievements
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {achievementCount}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Honour wins
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {winningHonourCount}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-9 flex flex-col gap-5 border-b border-[#071a2b]/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              The roll of honour
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Every landmark season
            </h2>
          </div>
          <Link
            href="/page/blog/honours"
            className="group inline-flex items-center gap-2 text-sm font-bold text-blue-700"
          >
            Read the original honours list
            <ArrowUpRightIcon className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="relative">
          <div className="absolute bottom-0 left-[27px] top-0 hidden w-px bg-[#071a2b]/15 sm:block" />
          <div className="space-y-5">
            {recentFirst.map(({ season, achievements }) => (
              <article
                key={season}
                className="relative grid gap-4 sm:grid-cols-[56px_160px_minmax(0,1fr)] sm:gap-6"
              >
                <div className="relative z-10 hidden h-14 w-14 place-items-center rounded-full border border-[#071a2b]/15 bg-[#f4f0e8] sm:grid">
                  {achievements.some(
                    (achievement) => achievement.kind === "Trophy",
                  ) ? (
                    <TrophyIcon className="h-6 w-6 text-amber-700" />
                  ) : (
                    <CalendarDaysIcon className="h-6 w-6 text-blue-700" />
                  )}
                </div>
                <Link
                  href={`/season/${season}`}
                  className="group flex items-center justify-between border border-[#071a2b]/15 bg-[#071a2b] px-5 py-4 text-white sm:min-h-36 sm:flex-col sm:items-start"
                >
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-blue-300">
                    Season
                  </span>
                  <strong className="font-display text-3xl font-semibold tracking-[-0.04em]">
                    {seasonLabel(season)}
                  </strong>
                  <span className="hidden items-center gap-1 text-xs font-bold text-white/55 transition group-hover:text-white sm:flex">
                    Open season
                    <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15">
                  {achievements.map((achievement) => {
                    const content = (
                      <>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${badgeClasses(achievement.kind)}`}
                          >
                            {achievement.kind}
                          </span>
                          <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                            {achievement.title}
                          </h3>
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-5">
                          <p className="text-sm leading-6 text-[#071a2b]/60">
                            {achievement.detail}
                          </p>
                          {achievement.href && (
                            <ArrowUpRightIcon className="h-5 w-5 shrink-0 text-blue-700 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          )}
                        </div>
                      </>
                    );

                    return achievement.href ? (
                      <Link
                        key={achievement.title}
                        href={achievement.href}
                        className="group bg-[#fffdf8] p-5 transition hover:bg-white sm:p-6"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        key={achievement.title}
                        className="bg-[#fffdf8] p-5 sm:p-6"
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
