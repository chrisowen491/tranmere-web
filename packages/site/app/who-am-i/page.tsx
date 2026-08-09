import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  queryAppRows,
  queryPlayerSeasonSummaryRows,
} from "@tranmere-web/lib/src/d1-queries";
import { WhoAmIGame } from "@/components/apps/WhoAmIGame";
import { getUniquePlayers } from "@/lib/players";

export const metadata: Metadata = {
  title: "Who Am I? — Daily Tranmere player",
  description:
    "Identify a Tranmere Rovers player from a new set of archive clues every day.",
};

const defaultPlayerImageSignature =
  "simple/cccccc/none/cccccc/cccccc/none/cccccc";

function dailyKey() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date());
}

function hash(value: string) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function avatarSeason(picLink?: string | null) {
  return picLink?.match(/\/builder\/(\d{4})\//)?.[1];
}

export default async function WhoAmIPage() {
  const context = await getCloudflareContext({ async: true });
  const players = await getUniquePlayers(context.env.DB);
  const eligiblePlayers = players.filter(
    (player) =>
      player.picLink &&
      player.position &&
      !player.picLink.toLowerCase().includes(defaultPlayerImageSignature),
  );
  const date = dailyKey();
  const dailyPlayer = eligiblePlayers[hash(date) % eligiblePlayers.length];
  const [summaryRows, starts, substituteAppearances] = await Promise.all([
    queryPlayerSeasonSummaryRows(context.env.DB, {
      player: dailyPlayer.name,
      playerMatch: "exact",
    }),
    queryAppRows(context.env.DB, {
      player: dailyPlayer.name,
      playerMatch: "exact",
    }),
    queryAppRows(context.env.DB, { substitutedBy: dailyPlayer.name }),
  ]);
  const seasons = summaryRows
    .filter((season) => /^\d{4}$/.test(season.season))
    .sort((a, b) => Number(a.season) - Number(b.season));
  const totalAppearances = seasons.reduce(
    (total, season) =>
      total +
      (season.appearances || season.starts + season.substitute_appearances),
    0,
  );
  const totalGoals = seasons.reduce((total, season) => total + season.goals, 0);
  const debut = [...starts, ...substituteAppearances].sort((a, b) =>
    a.match_date.localeCompare(b.match_date),
  )[0];
  const gameNumber = Math.floor(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse("2026-01-01T00:00:00Z")) /
      86400000,
  );

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <WhoAmIGame
        date={date}
        gameNumber={gameNumber}
        candidates={players.map((player) => player.name)}
        player={{
          name: dailyPlayer.name,
          position: dailyPlayer.position!,
          image: dailyPlayer.picLink!,
          firstSeason:
            seasons.at(0)?.season ?? avatarSeason(dailyPlayer.picLink),
          lastSeason:
            seasons.at(-1)?.season ?? avatarSeason(dailyPlayer.picLink),
          appearances: totalAppearances,
          goals: totalGoals,
          debutDate: debut?.match_date,
          debutOpposition: debut?.opposition,
        }}
      />
    </main>
  );
}
