import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { GetAllPlayers } from "@tranmere-web/lib/src/apiFunctions";
import { GetBaseUrl } from "@/lib/apiFunctions";
import type { PlayerProfile } from "@/lib/types";
import { WhoAmIGame } from "@/components/apps/WhoAmIGame";

export const revalidate = 3600;

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

function avatarSeason(picLink?: string) {
  return picLink?.match(/\/builder\/(\d{4})\//)?.[1];
}

export default async function WhoAmIPage() {
  const players = await GetAllPlayers();
  const eligiblePlayers = players.filter(
    (player) =>
      player.picLink &&
      player.position &&
      !player.picLink.toLowerCase().includes(defaultPlayerImageSignature),
  );
  const date = dailyKey();
  const dailyPlayer = eligiblePlayers[hash(date) % eligiblePlayers.length];
  const context = await getCloudflareContext({ async: true });
  const profileRequest = await fetch(
    `${GetBaseUrl(context.env)}/page/player/${encodeURIComponent(dailyPlayer.name)}?json=true`,
  );
  const profile = profileRequest.ok
    ? ((await profileRequest.json()) as PlayerProfile)
    : null;
  const seasons = (profile?.seasons ?? [])
    .filter((season) => /^\d{4}$/.test(season.Season))
    .sort((a, b) => Number(a.Season) - Number(b.Season));
  const totalAppearances = seasons.reduce(
    (total, season) => total + (season.Apps || season.starts + season.subs),
    0,
  );
  const totalGoals = seasons.reduce((total, season) => total + season.goals, 0);
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
          position: profile?.player.position ?? dailyPlayer.position!,
          image: profile?.image ?? dailyPlayer.picLink!,
          firstSeason:
            seasons.at(0)?.Season ?? avatarSeason(dailyPlayer.picLink),
          lastSeason:
            seasons.at(-1)?.Season ?? avatarSeason(dailyPlayer.picLink),
          appearances: totalAppearances,
          goals: totalGoals,
          debutDate: profile?.debut?.Date,
          debutOpposition: profile?.debut?.Opposition,
        }}
      />
    </main>
  );
}
