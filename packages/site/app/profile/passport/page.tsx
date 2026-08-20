import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import {
  attendanceResult,
  getAttendedMatches,
  type AttendanceResult,
} from "@/lib/matchAttendance";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { AttendedMatchRow } from "@tranmere-web/lib/src/d1-types";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Rovers passport",
  description: "Your private record of Tranmere Rovers matches attended.",
};

function countBy<T extends string | number>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts].sort((a, b) => b[1] - a[1]);
}

function resultTotals(matches: AttendedMatchRow[]) {
  return matches.reduce<Record<AttendanceResult, number>>(
    (totals, match) => {
      totals[attendanceResult(match)] += 1;
      return totals;
    },
    { W: 0, D: 0, L: 0 },
  );
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

const resultStyles: Record<AttendanceResult, string> = {
  W: "bg-emerald-600 text-white",
  D: "bg-amber-400 text-[#071a2b]",
  L: "bg-rose-500 text-white",
};

export default async function PassportPage(props: {
  searchParams: Promise<{ season?: string }>;
}) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=%2Fprofile%2Fpassport");
  const db = getCloudflareContext().env.DB;
  const account = await resolveAccount(db, session.user.sub);
  const matches = await getAttendedMatches(db, account.id);
  const searchParams = await props.searchParams;
  const seasons = [...new Set(matches.map((match) => match.season))].sort(
    (a, b) => b - a,
  );
  const selectedSeason = seasons.includes(Number(searchParams.season))
    ? Number(searchParams.season)
    : null;
  const visibleMatches = selectedSeason
    ? matches.filter((match) => match.season === selectedSeason)
    : [...matches].reverse();
  const totals = resultTotals(matches);
  const seasonTotals = countBy(matches.map((match) => match.season));
  const competitionTotals = countBy(matches.map((match) => match.competition));
  const venueTotals = countBy(matches.map((match) => match.venue));
  const awayGround = countBy(
    matches
      .filter(
        (match) =>
          match.home_team !== "Tranmere Rovers" &&
          !match.neutral &&
          match.venue !== "Unknown",
      )
      .map((match) => match.venue),
  )[0];
  const firstMatch = matches[0];
  const fiftiethMatch = matches[49];

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
            Supporter archive · Private to you
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Your Rovers passport
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Every ground, season and scoreline you witnessed, gathered into one
            personal matchday record.
          </p>
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-px bg-white/15 sm:grid-cols-4">
            {[
              ["Matches", matches.length],
              ["Won", totals.W],
              ["Drawn", totals.D],
              ["Lost", totals.L],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#071a2b] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                  {label}
                </p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-12 px-6 py-12 sm:px-10 lg:px-12">
        {matches.length === 0 ? (
          <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-8 sm:p-12">
            <h2 className="font-display text-4xl font-semibold tracking-[-0.04em]">
              Your first stamp is waiting
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#071a2b]/60">
              Open any archived match and choose “Mark as attended”. Your
              passport will build automatically and remains private.
            </p>
            <Link
              href="/results"
              className="mt-6 inline-block bg-[#1557ff] px-5 py-3 text-sm font-bold text-white"
            >
              Browse the results archive →
            </Link>
          </section>
        ) : (
          <>
            <section>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                Passport milestones
              </p>
              <div className="mt-4 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 md:grid-cols-3">
                <Milestone
                  label="First match"
                  value={firstMatch ? dateLabel(firstMatch.match_date) : "—"}
                  detail={
                    firstMatch
                      ? `${firstMatch.home_team} ${firstMatch.full_time_score} ${firstMatch.away_team}`
                      : ""
                  }
                />
                <Milestone
                  label="50th match"
                  value={
                    fiftiethMatch
                      ? dateLabel(fiftiethMatch.match_date)
                      : `${matches.length} of 50`
                  }
                  detail={
                    fiftiethMatch
                      ? `${fiftiethMatch.home_team} ${fiftiethMatch.full_time_score} ${fiftiethMatch.away_team}`
                      : "Keep adding matches to unlock this milestone."
                  }
                />
                <Milestone
                  label="Most-visited away ground"
                  value={awayGround?.[0] || "Not recorded yet"}
                  detail={
                    awayGround
                      ? `${awayGround[1]} visits`
                      : "Add an away match to start this record."
                  }
                />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <Breakdown
                title="By season"
                entries={seasonTotals.map(([season, count]) => [
                  `${season}/${String(Number(season) + 1).slice(-2)}`,
                  count,
                ])}
              />
              <Breakdown title="By competition" entries={competitionTotals} />
              <Breakdown title="By venue" entries={venueTotals} />
            </section>

            <section>
              <div className="flex flex-col justify-between gap-4 border-b border-[#071a2b]/15 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    Match log
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                    {selectedSeason
                      ? `${selectedSeason}/${String(selectedSeason + 1).slice(-2)}`
                      : "All matches"}
                  </h2>
                </div>
                <form className="flex gap-2">
                  <select
                    name="season"
                    defaultValue={selectedSeason || ""}
                    className="border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-bold"
                  >
                    <option value="">All seasons</option>
                    {seasons.map((season) => (
                      <option key={season} value={season}>
                        {season}/{String(season + 1).slice(-2)}
                      </option>
                    ))}
                  </select>
                  <button className="bg-[#071a2b] px-4 py-3 text-sm font-bold text-white">
                    Filter
                  </button>
                </form>
              </div>
              <div className="mt-6 grid gap-3">
                {visibleMatches.map((match) => {
                  const result = attendanceResult(match);
                  return (
                    <Link
                      key={match.game_id}
                      href={`/match/${match.season}/${match.match_date}`}
                      className="grid items-center gap-4 border border-[#071a2b]/15 bg-[#fffdf8] p-4 transition hover:border-blue-700 sm:grid-cols-[52px_130px_1fr_auto]"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center font-mono text-sm font-bold ${resultStyles[result]}`}
                      >
                        {result}
                      </span>
                      <span className="font-mono text-xs text-[#071a2b]/55">
                        {dateLabel(match.match_date)}
                      </span>
                      <span className="font-semibold">
                        {match.home_team}{" "}
                        <strong className="mx-2">
                          {match.full_time_score}
                        </strong>{" "}
                        {match.away_team}
                      </span>
                      <span className="text-xs text-[#071a2b]/50">
                        {match.competition}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
        <Link
          href="/profile"
          className="inline-block text-sm font-bold text-blue-700"
        >
          ← Back to your profile
        </Link>
      </div>
    </main>
  );
}

function Milestone({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="bg-[#fffdf8] p-6">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
        {label}
      </p>
      <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em]">
        {value}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#071a2b]/55">{detail}</p>
    </article>
  );
}

function Breakdown({
  title,
  entries,
}: {
  title: string;
  entries: (readonly [string | number, number])[];
}) {
  return (
    <article className="border border-[#071a2b]/15 bg-[#fffdf8] p-6">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
        {title}
      </h2>
      <div className="mt-5 divide-y divide-[#071a2b]/10">
        {entries.slice(0, 8).map(([label, count]) => (
          <div key={label} className="flex justify-between gap-4 py-3 text-sm">
            <span>{label}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
