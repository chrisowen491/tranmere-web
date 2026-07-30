import { Appearance } from "@tranmere-web/lib/src/tranmere-web-types";
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  FlagIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

function isSubstitute(record: Appearance) {
  return record.Type?.toLowerCase().includes("sub") ?? false;
}

function seasonLabel(season: string) {
  return `${season}/${String(Number(season) + 1).slice(-2)}`;
}

export function PlayerAppsTable({
  title,
  records,
}: {
  title: string;
  records: Appearance[];
}) {
  const starts = records.filter((record) => !isSubstitute(record)).length;
  const substituteAppearances = records.length - starts;
  const goals = records.reduce(
    (total, record) => total + (record.Goals ?? 0),
    0,
  );
  const competitions = new Set(
    records.map((record) => record.Competition).filter(Boolean),
  ).size;

  if (records.length === 0) {
    return (
      <div className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] p-6 text-sm text-[#071a2b]/55">
        No individual appearances are currently recorded.
      </div>
    );
  }

  return (
    <section className="mt-6">
      <div className="grid border border-[#071a2b]/15 bg-[#fffdf8] sm:grid-cols-3">
        <div className="border-b border-[#071a2b]/15 p-5 sm:border-b-0 sm:border-r">
          <CalendarDaysIcon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Recorded appearances
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {records.length}
          </p>
          <p className="mt-1 text-xs text-[#071a2b]/50">
            {starts} starts · {substituteAppearances} from the bench
          </p>
        </div>
        <div className="border-b border-[#071a2b]/15 p-5 sm:border-b-0 sm:border-r">
          <TrophyIcon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Goals
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">{goals}</p>
          <p className="mt-1 text-xs text-[#071a2b]/50">
            Across the match archive
          </p>
        </div>
        <div className="p-5">
          <FlagIcon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Competitions
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {competitions}
          </p>
          <p className="mt-1 text-xs text-[#071a2b]/50">
            Distinct competitions represented
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="flex items-end justify-between gap-4 border-b border-[#071a2b]/15 bg-[#071a2b] px-5 py-5 text-white">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
              Match log
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {title}
            </h2>
          </div>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 sm:block">
            Every recorded game
          </p>
        </div>

        <div className="divide-y divide-[#071a2b]/10 sm:hidden">
          {records.map((record) => (
            <article key={record.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                    {record.Date} · {seasonLabel(record.Season)}
                  </p>
                  <Link
                    href={`/match/${record.Season}/${record.Date}`}
                    className="group mt-2 inline-flex items-center gap-1 font-display text-xl font-semibold hover:text-blue-700"
                  >
                    {record.Opposition}
                    <ArrowUpRightIcon className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                  <p className="mt-1 text-xs text-[#071a2b]/50">
                    {record.Competition}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                    isSubstitute(record)
                      ? "bg-[#e8e2d6] text-[#071a2b]/65"
                      : "bg-blue-700 text-white"
                  }`}
                >
                  {isSubstitute(record) ? "Sub" : "Start"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
                {(record.Goals ?? 0) > 0 && (
                  <span className="bg-blue-700 px-2.5 py-1.5 font-bold text-white">
                    {record.Goals} {record.Goals === 1 ? "goal" : "goals"}
                  </span>
                )}
                {record.YellowCard && (
                  <span className="bg-amber-100 px-2.5 py-1.5 font-bold text-amber-900">
                    Yellow card
                  </span>
                )}
                {record.RedCard && (
                  <span className="bg-red-100 px-2.5 py-1.5 font-bold text-red-800">
                    Red card
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#e8e2d6] font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
              <tr>
                <th scope="col" className="px-5 py-4">
                  Date
                </th>
                <th scope="col" className="px-4 py-4">
                  Opposition
                </th>
                <th scope="col" className="px-4 py-4">
                  Competition
                </th>
                <th scope="col" className="px-4 py-4">
                  Role
                </th>
                <th scope="col" className="px-5 py-4">
                  Match record
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {records.map((record) => (
                <tr
                  key={record.id}
                  className="group transition hover:bg-blue-50/60"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-mono text-xs font-bold">{record.Date}</p>
                    <Link
                      href={`/player-records/${record.Season}`}
                      className="mt-1 inline-block text-[10px] font-bold text-blue-700 hover:underline"
                    >
                      {seasonLabel(record.Season)}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/match/${record.Season}/${record.Date}`}
                      className="inline-flex items-center gap-1 font-semibold hover:text-blue-700"
                    >
                      {record.Opposition}
                      <ArrowUpRightIcon className="h-3.5 w-3.5 opacity-30 transition group-hover:opacity-100" />
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-xs text-[#071a2b]/55">
                    {record.Competition}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                        isSubstitute(record)
                          ? "bg-[#e8e2d6] text-[#071a2b]/65"
                          : "bg-blue-700 text-white"
                      }`}
                    >
                      {isSubstitute(record) ? "Sub" : "Start"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(record.Goals ?? 0) > 0 ? (
                        <span className="bg-blue-700 px-2.5 py-1.5 font-mono text-[10px] font-bold text-white">
                          {record.Goals}G
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-[#071a2b]/25">
                          —
                        </span>
                      )}
                      {record.YellowCard && (
                        <span
                          title="Yellow card"
                          className="h-6 w-4 bg-amber-400"
                        />
                      )}
                      {record.RedCard && (
                        <span title="Red card" className="h-6 w-4 bg-red-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
