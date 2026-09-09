import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import {
  GoalkeeperRecords,
  type GoalkeeperSeasonRecord,
} from "@/components/apps/GoalkeeperRecords";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getPlayerStatisticsProfiles } from "@/lib/playerStatistics";

export const metadata: Metadata = {
  title: "Tranmere Rovers goalkeeper records",
  description:
    "Goalkeeper appearances, clean sheets and goals-conceded records from the Tranmere Rovers archive.",
};

type Row = {
  player: string;
  season: number;
  matches: number;
  clean_sheets: number;
  goals_conceded: number;
};

export default async function GoalkeeperRecordPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const result = await env.DB.prepare(
    `SELECT Apps.player_name AS player, Apps.season, COUNT(*) AS matches,
    SUM(CASE WHEN (CASE WHEN Games.home_team = 'Tranmere Rovers' THEN CAST(Games.away_goals AS INTEGER) ELSE CAST(Games.home_goals AS INTEGER) END) = 0 THEN 1 ELSE 0 END) AS clean_sheets,
    SUM(CASE WHEN Games.home_team = 'Tranmere Rovers' THEN CAST(Games.away_goals AS INTEGER) ELSE CAST(Games.home_goals AS INTEGER) END) AS goals_conceded
    FROM Apps JOIN Players ON Players.name = Apps.player_name JOIN Games ON Games.season = Apps.season AND Games.match_date = Apps.match_date
    WHERE Players.position = 'Goalkeeper' OR Players.secondary_position = 'Goalkeeper'
    GROUP BY Apps.player_name, Apps.season ORDER BY clean_sheets DESC`,
  ).all<Row>();
  const profiles = await getPlayerStatisticsProfiles(
    env.DB,
    result.results.map((row) => row.player),
  );
  const records: GoalkeeperSeasonRecord[] = result.results.map((row) => ({
    player: row.player,
    season: Number(row.season),
    matches: Number(row.matches),
    cleanSheets: Number(row.clean_sheets),
    goalsConceded: Number(row.goals_conceded),
    picLink: profiles.get(row.player)!.picLink,
  }));
  const totalCleanSheets = records.reduce(
    (sum, record) => sum + record.cleanSheets,
    0,
  );
  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          {
            name: "Goalkeeper records",
            pathname: "/players/goalkeeper-record",
          },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Player records
          </p>
          <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="font-display text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">
                The last line
                <br />
                of defence.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Every recorded Rovers starting goalkeeper, ranked by appearances
                and clean sheets.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Goalkeepers
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {new Set(records.map((record) => record.player)).size}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Clean sheets
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {totalCleanSheets}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-8 border-b border-[#071a2b]/15 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Matches &amp; clean sheets
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
            Goalkeeper record.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#071a2b]/60">
            Statistics count the goalkeeper recorded as starting each match.
            Emergency or substitute goalkeepers appearing later are not included
            in the starting-goalkeeper totals.
          </p>
        </div>
        <GoalkeeperRecords records={records} />
      </section>
    </main>
  );
}
