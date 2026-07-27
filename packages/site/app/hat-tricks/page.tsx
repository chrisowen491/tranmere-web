import {
  ArrowRightIcon,
  CalendarDaysIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { GetAllHatTricks } from "@tranmere-web/lib/src/apiFunctions";
import type { HatTrick } from "@tranmere-web/lib/src/tranmere-web-types";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Tranmere Hat Tricks",
  description: "Tranmere Rovers hat-trick scorers since 1977",
};

const defaultPlayerImageSignature =
  "simple/cccccc/none/cccccc/cccccc/none/cccccc";

function hasPlayerImage(record: HatTrick) {
  return (
    record.picLink &&
    !record.picLink.toLowerCase().includes(defaultPlayerImageSignature)
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function HatTricks() {
  const records = await GetAllHatTricks();
  const playerTotals = records.reduce<Map<string, number>>((totals, record) => {
    totals.set(record.Player, (totals.get(record.Player) ?? 0) + 1);
    return totals;
  }, new Map());
  const leaders = [...playerTotals.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3);
  const uniqueScorers = playerTotals.size;
  const biggestHaul = Math.max(...records.map((record) => record.Goals));
  const fourOrMore = records.filter((record) => record.Goals >= 4).length;
  const newestFirst = [...records].reverse();

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Player records
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[1fr_430px] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-display text-6xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-8xl">
                Three goals.
                <br />
                One match.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65">
                Every recorded Tranmere hat-trick—and the exceptional four-goal
                displays—from the 1977/78 season onwards.
              </p>
            </div>
            <dl className="grid grid-cols-3 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Hat-tricks
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {records.length}
                </dd>
              </div>
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Scorers
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {uniqueScorers}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Record
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {biggestHaul}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Hat-trick leaders
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em]">
                Repeat performers
              </h2>
            </div>
            <div className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-3">
              {leaders.map(([player, total], index) => (
                <Link
                  key={player}
                  href={`/page/player/${encodeURIComponent(player)}`}
                  className="group flex items-center justify-between bg-[#fffdf8] px-5 py-5 transition hover:bg-[#071a2b] hover:text-white"
                >
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-blue-700 group-hover:text-blue-300">
                      No. {index + 1}
                    </span>
                    <h3 className="mt-1 font-display text-xl font-semibold">
                      {player}
                    </h3>
                  </div>
                  <strong className="font-display text-3xl font-semibold">
                    {total}
                  </strong>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              The complete archive
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Every match ball claimed.
            </h2>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#071a2b]/45">
            {fourOrMore} performances of four goals or more
          </p>
        </div>

        <ol className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 md:grid-cols-2">
          {newestFirst.map((record) => (
            <li
              key={`${record.Player}-${record.Date}`}
              className="group bg-[#fffdf8] p-5 transition hover:bg-white sm:p-6"
            >
              <div className="flex gap-5">
                <Link
                  href={`/page/player/${encodeURIComponent(record.Player)}`}
                  aria-label={`View ${record.Player}'s player profile`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#071a2b]"
                >
                  {hasPlayerImage(record) ? (
                    <Image
                      width={160}
                      height={160}
                      alt={record.Player}
                      src={record.picLink!}
                      unoptimized
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <UserIcon className="h-full w-full p-6 text-white/20" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-blue-700">
                        {record.Season}/
                        {String(Number(record.Season) + 1).slice(-2)}
                      </p>
                      <Link
                        href={`/page/player/${encodeURIComponent(record.Player)}`}
                        className="mt-1 block font-display text-2xl font-semibold tracking-[-0.03em] hover:text-blue-700"
                      >
                        {record.Player}
                      </Link>
                    </div>
                    <div className="grid h-14 w-14 shrink-0 place-items-center bg-blue-700 text-white">
                      <span className="font-display text-3xl font-semibold">
                        {record.Goals}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#071a2b]/15 pt-4">
                    <div className="text-sm">
                      <strong>vs {record.Opposition}</strong>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-[#071a2b]/50">
                        <CalendarDaysIcon className="h-3.5 w-3.5" />
                        {formatDate(record.Date)}
                      </span>
                    </div>
                    <Link
                      href={`/match/${record.Season}/${record.Date}`}
                      prefetch={false}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-700"
                    >
                      Match details
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex items-start gap-3 border border-[#071a2b]/15 bg-[#e8e2d6] p-5 text-sm leading-6 text-[#071a2b]/65">
          <TrophyIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          This archive currently covers first-team hat-tricks from the 1977/78
          season onwards.
        </div>
      </section>
    </main>
  );
}
