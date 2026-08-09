import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PhotoIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Image from "next/image";
import Link from "next/link";
import { searchGames } from "@/lib/games";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers highest attendances",
  description:
    "Explore the 50 largest recorded crowds for competitive Tranmere Rovers matches.",
  pathname: "/results/top-attendances",
});

const TRANMERE = "Tranmere Rovers";

function attendance(match: Match) {
  return Number(match.attendance) || 0;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function matchHref(match: Match) {
  return `/match/${match.season}/${match.date.slice(0, 10)}`;
}

function scoreline(match: Match) {
  return `${match.home} ${match.hgoal}–${match.vgoal} ${match.visitor}`;
}

function opposition(match: Match) {
  return (
    match.opposition || (match.home === TRANMERE ? match.visitor : match.home)
  );
}

function seasonLabel(season: string) {
  const year = Number(season);
  return Number.isFinite(year)
    ? `${year}/${String(year + 1).slice(-2)}`
    : season;
}

export default async function TopAttendancesPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const { results } = await searchGames(env.DB, { sort: "attendance-desc" });
  const matches = results
    .filter((match) => attendance(match) > 0)
    .toSorted(
      (left, right) =>
        attendance(right) - attendance(left) ||
        new Date(left.date).getTime() - new Date(right.date).getTime(),
    )
    .slice(0, 50);

  const podium = matches.slice(0, 3);
  const highestHome = matches.find(
    (match) => match.venue?.trim().toLowerCase() === "prenton park",
  );
  const highestAway = matches.find((match) => match.home !== TRANMERE);
  const seasonsCovered = new Set(matches.map((match) => match.season)).size;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers highest attendances",
          description:
            "The 50 largest recorded crowds for competitive Tranmere Rovers matches.",
          url: absoluteUrl("/results/top-attendances"),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: matches.map((match, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(matchHref(match)),
              name: `${scoreline(match)} — ${attendance(match).toLocaleString("en-GB")}`,
            })),
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Results", pathname: "/results" },
          { name: "Highest attendances", pathname: "/results/top-attendances" },
        ])}
      />

      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Results archive
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Through the turnstiles
              </p>
              <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
                Rovers&rsquo; 50 biggest crowds.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                The largest recorded attendances in the competitive match
                archive—from packed days at Prenton Park to landmark trips on
                the road.
              </p>
            </div>
            <div className="grid grid-cols-2 border border-white/15">
              <div className="border-b border-r border-white/15 p-5">
                <strong className="block font-display text-4xl">
                  {matches[0]
                    ? attendance(matches[0]).toLocaleString("en-GB")
                    : "—"}
                </strong>
                <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                  Record crowd
                </span>
              </div>
              <div className="border-b border-white/15 p-5">
                <strong className="block font-display text-4xl">50</strong>
                <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                  Matches ranked
                </span>
              </div>
              <div className="border-r border-white/15 p-5">
                <strong className="block font-display text-4xl">
                  {seasonsCovered}
                </strong>
                <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                  Seasons represented
                </span>
              </div>
              <div className="p-5">
                <strong className="block font-display text-4xl">
                  {matches.at(-1)
                    ? attendance(matches.at(-1)!).toLocaleString("en-GB")
                    : "—"}
                </strong>
                <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                  Top-50 threshold
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                The podium
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                The biggest gates on record.
              </h2>
            </div>
            <TrophyIcon className="h-9 w-9 text-blue-700" />
          </div>

          <div className="mt-9 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 lg:grid-cols-3">
            {podium.map((match, index) => (
              <Link
                key={`${match.season}-${match.date}`}
                href={matchHref(match)}
                className="group flex min-h-72 flex-col bg-[#fffdf8] p-6 transition hover:bg-white sm:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="grid h-12 w-12 place-items-center bg-blue-700 font-display text-2xl font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="h-40 w-28 overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6] shadow-sm">
                    {match.programme ? (
                      <Image
                        src={`https://images.tranmere-web.com/${
                          match.largeProgramme ?? match.programme
                        }`}
                        alt={`${match.home} v ${match.visitor} programme cover`}
                        width={224}
                        height={320}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="grid h-full place-items-center">
                        <PhotoIcon className="h-10 w-10 text-[#071a2b]/20" />
                      </span>
                    )}
                  </div>
                </div>
                <strong className="mt-8 font-display text-5xl font-semibold tracking-[-0.04em] text-blue-700">
                  {attendance(match).toLocaleString("en-GB")}
                </strong>
                <p className="mt-4 text-lg font-bold">{scoreline(match)}</p>
                <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                  <p className="text-xs leading-5 text-[#071a2b]/50">
                    {formatDate(match.date)}
                    <br />
                    {match.competition} · {match.venue}
                  </p>
                  <ArrowRightIcon className="h-5 w-5 text-blue-700 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              label: "Highest home crowd",
              match: highestHome,
              icon: MapPinIcon,
            },
            {
              label: "Highest away crowd",
              match: highestAway,
              icon: CalendarDaysIcon,
            },
          ].map(({ label, match, icon: Icon }) => (
            <div
              key={label}
              className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-7"
            >
              <Icon className="h-6 w-6 text-blue-700" />
              <p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-[#071a2b]/45">
                {label}
              </p>
              {match ? (
                <>
                  <strong className="mt-2 block font-display text-4xl text-blue-700">
                    {attendance(match).toLocaleString("en-GB")}
                  </strong>
                  <Link
                    href={matchHref(match)}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold hover:text-blue-700"
                  >
                    {opposition(match)} · {formatDate(match.date)}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <strong className="mt-2 block font-display text-4xl">—</strong>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="border-b border-[#071a2b]/15 pb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Full ranking
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              All 50 matches.
            </h2>
          </div>

          <div className="overflow-x-auto border-x border-[#071a2b]/15">
            <table className="w-full min-w-[900px] border-collapse bg-[#fffdf8] text-left">
              <thead className="bg-[#071a2b] text-white">
                <tr className="font-mono text-[9px] uppercase tracking-[0.14em]">
                  <th className="w-16 px-4 py-4 text-center">Rank</th>
                  <th className="w-20 px-3 py-4 text-center">Programme</th>
                  <th className="px-4 py-4">Match</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Competition</th>
                  <th className="px-4 py-4">Venue</th>
                  <th className="px-4 py-4 text-right">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, index) => (
                  <tr
                    key={`${match.season}-${match.date}`}
                    className="group border-b border-[#071a2b]/10 transition hover:bg-blue-50"
                  >
                    <td className="px-4 py-4 text-center font-mono text-sm font-bold text-blue-700">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="mx-auto h-20 w-14 overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6]">
                        {match.programme ? (
                          <Image
                            src={`https://images.tranmere-web.com/${match.programme}`}
                            alt={`${match.home} v ${match.visitor} programme cover`}
                            width={112}
                            height={160}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full place-items-center">
                            <PhotoIcon className="h-6 w-6 text-[#071a2b]/20" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={matchHref(match)}
                        className="font-bold transition group-hover:text-blue-700"
                      >
                        {scoreline(match)}
                      </Link>
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-[#071a2b]/40">
                        {seasonLabel(match.season)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#071a2b]/65">
                      {formatDate(match.date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#071a2b]/65">
                      {match.competition}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#071a2b]/65">
                      {match.venue || "—"}
                    </td>
                    <td className="px-4 py-4 text-right font-display text-2xl font-semibold">
                      {attendance(match).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
