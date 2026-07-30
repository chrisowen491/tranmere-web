import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import {
  ArrowUpRightIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

function appearances(record: PlayerSeasonSummary) {
  return record.starts + record.subs;
}

function seasonLabel(season: string) {
  const nextYear = String(Number(season) + 1).slice(-2);
  return `${season}/${nextYear}`;
}

function StatBadge({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "yellow" | "red";
}) {
  const toneClass =
    tone === "yellow"
      ? "bg-amber-100 text-amber-900"
      : tone === "red"
        ? "bg-red-100 text-red-800"
        : "bg-[#e8e2d6] text-[#071a2b]/65";

  return (
    <span
      title={label}
      className={`inline-flex min-w-7 items-center justify-center px-2 py-1 font-mono text-[10px] font-bold ${toneClass}`}
    >
      {value}
    </span>
  );
}

export function PlayerStatsTable({
  title,
  records,
}: {
  title: string;
  records: PlayerSeasonSummary[];
}) {
  const maxAppearances = Math.max(...records.map(appearances), 1);
  const busiestSeason = [...records].sort(
    (a, b) => appearances(b) - appearances(a),
  )[0];
  const topScoringSeason = [...records].sort(
    (a, b) => b.goals - a.goals || appearances(b) - appearances(a),
  )[0];
  const goalContributions = records.reduce(
    (total, record) => total + record.goals + record.assists,
    0,
  );

  if (records.length === 0) {
    return (
      <div className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] p-6 text-sm text-[#071a2b]/55">
        No season statistics are currently recorded.
      </div>
    );
  }

  return (
    <section className="mt-6">
      <div className="grid border border-[#071a2b]/15 bg-[#fffdf8] sm:grid-cols-3">
        <div className="border-b border-[#071a2b]/15 p-5 sm:border-b-0 sm:border-r">
          <ChartBarIcon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Busiest season
          </p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {seasonLabel(busiestSeason.Season)}
          </p>
          <p className="mt-1 text-xs text-[#071a2b]/50">
            {appearances(busiestSeason)} appearances
          </p>
        </div>
        <div className="border-b border-[#071a2b]/15 p-5 sm:border-b-0 sm:border-r">
          <FireIcon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Top-scoring season
          </p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {seasonLabel(topScoringSeason.Season)}
          </p>
          <p className="mt-1 text-xs text-[#071a2b]/50">
            {topScoringSeason.goals} goals
          </p>
        </div>
        <div className="p-5">
          <TrophyIcon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Goal contributions
          </p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {goalContributions}
          </p>
          <p className="mt-1 text-xs text-[#071a2b]/50">
            Goals and recorded assists
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="flex items-end justify-between gap-4 border-b border-[#071a2b]/15 bg-[#071a2b] px-5 py-5 text-white">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
              Career timeline
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {title}
            </h2>
          </div>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 sm:block">
            {records.length} seasons
          </p>
        </div>

        <div className="divide-y divide-[#071a2b]/10 sm:hidden">
          {records.map((record) => (
            <article key={record.Season} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/season/${record.Season}`}
                    className="group inline-flex items-center gap-1 font-display text-2xl font-semibold hover:text-blue-700"
                  >
                    {seasonLabel(record.Season)}
                    <ArrowUpRightIcon className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                  <p className="mt-1 text-xs text-[#071a2b]/45">
                    {record.starts} starts · {record.subs} substitute
                    {record.subs === 1 ? " appearance" : " appearances"}
                  </p>
                </div>
                <span className="bg-blue-700 px-3 py-2 font-mono text-sm font-bold text-white">
                  {appearances(record)} apps
                </span>
              </div>
              <div className="mt-4 h-1.5 bg-[#e8e2d6]">
                <div
                  className="h-full bg-blue-700"
                  style={{
                    width: `${(appearances(record) / maxAppearances) * 100}%`,
                  }}
                />
              </div>
              <dl className="mt-5 grid grid-cols-4 gap-3 text-center">
                {[
                  ["Goals", record.goals],
                  ["Assists", record.assists],
                  ["Yellow", record.yellow],
                  ["Red", record.red],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dd className="font-mono text-lg font-bold">{value}</dd>
                    <dt className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#071a2b]/40">
                      {label}
                    </dt>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#e8e2d6] font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
              <tr>
                <th scope="col" className="px-5 py-4">
                  Season
                </th>
                <th scope="col" className="min-w-56 px-4 py-4">
                  Appearances
                </th>
                <th scope="col" className="px-4 py-4 text-center">
                  Goals
                </th>
                <th scope="col" className="px-4 py-4 text-center">
                  Assists
                </th>
                <th scope="col" className="px-4 py-4">
                  Goal detail
                </th>
                <th scope="col" className="px-5 py-4">
                  Cards
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {records.map((record) => {
                const apps = appearances(record);
                return (
                  <tr
                    key={record.Season}
                    className="group transition hover:bg-blue-50/60"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/season/${record.Season}`}
                        className="inline-flex items-center gap-1 font-display text-lg font-semibold hover:text-blue-700"
                      >
                        {seasonLabel(record.Season)}
                        <ArrowUpRightIcon className="h-3.5 w-3.5 opacity-35 transition group-hover:opacity-100" />
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-sm font-bold">
                          {apps}
                        </span>
                        <span className="text-xs text-[#071a2b]/45">
                          {record.starts} + {record.subs}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-[#e8e2d6]">
                        <div
                          className="h-full bg-blue-700 transition-all group-hover:bg-blue-500"
                          style={{
                            width: `${(apps / maxAppearances) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={
                          record.goals > 0
                            ? "inline-grid min-h-9 min-w-9 place-items-center bg-blue-700 px-2 font-mono font-bold text-white"
                            : "font-mono text-[#071a2b]/35"
                        }
                      >
                        {record.goals}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold">
                      {record.assists}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <StatBadge
                          value={record.headers}
                          label="Headers scored"
                        />
                        <StatBadge
                          value={record.freekicks}
                          label="Free kicks scored"
                        />
                        <StatBadge
                          value={record.penalties}
                          label="Penalties scored"
                        />
                      </div>
                      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#071a2b]/35">
                        Head · FK · Pen
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <StatBadge
                          value={record.yellow}
                          label="Yellow cards"
                          tone="yellow"
                        />
                        <StatBadge
                          value={record.red}
                          label="Red cards"
                          tone="red"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
