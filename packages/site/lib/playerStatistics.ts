import type { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { getPlayersByNames } from "@/lib/players";

export const defaultPlayerAvatar =
  "https://www.tranmere-web.com/builder/2026/none/cccccc/none/000000/cccccc/none/cccccc";

export interface PlayerStatisticsProfile {
  picLink: string;
  position: string | null;
}

export interface PlayerStatisticsView extends Omit<
  PlayerSeasonSummary,
  "bio" | "picLink"
> {
  profile: PlayerStatisticsProfile;
}

export interface PlayerStatisticsOptions {
  season?: string;
  sort?: string;
  filter?: string;
}

export async function getPlayerStatisticsProfiles(
  db: D1Database,
  names: string[],
) {
  const profiles = await getPlayersByNames(db, names);
  return new Map(
    [...new Set(names)].map((name) => {
      const profile = profiles.get(name);
      return [
        name,
        {
          picLink: profile?.picLink || defaultPlayerAvatar,
          position: profile?.position || null,
        },
      ];
    }),
  );
}

export async function enrichPlayerStatistics(
  db: D1Database,
  players: PlayerSeasonSummary[],
) {
  const profiles = await getPlayerStatisticsProfiles(
    db,
    players.map((player) => player.Player),
  );
  return players.map<PlayerStatisticsView>((player) => ({
    Season: player.Season,
    Player: player.Player,
    Apps: player.Apps,
    goals: player.goals,
    assists: player.assists,
    yellow: player.yellow,
    red: player.red,
    penalties: player.penalties,
    headers: player.headers,
    starts: player.starts,
    subs: player.subs,
    freekicks: player.freekicks,
    goalsPerGame: player.goalsPerGame,
    profile: profiles.get(player.Player)!,
  }));
}

const positionFilters: Record<string, string> = {
  GK: "Goalkeeper",
  FB: "Full Back",
  CD: "Central Defender",
  CM: "Central Midfielder",
  WIN: "Winger",
  STR: "Striker",
};

function sortPlayers(players: PlayerStatisticsView[], sort?: string) {
  if (sort === "Goals") {
    return players.sort(
      (a, b) =>
        b.goals - a.goals ||
        b.starts + b.subs - (a.starts + a.subs) ||
        a.Player.localeCompare(b.Player),
    );
  }
  if (sort === "Starts") {
    return players.sort(
      (a, b) =>
        b.starts - a.starts ||
        b.starts + b.subs - (a.starts + a.subs) ||
        a.Player.localeCompare(b.Player),
    );
  }
  return players;
}

function filterPlayers(players: PlayerStatisticsView[], filter?: string) {
  if (!filter) return players;
  if (filter === "OnlyOneApp") {
    return players.filter(
      (player) => (player.Apps || player.starts + player.subs) === 1,
    );
  }
  const position = positionFilters[filter];
  if (!position) return players;
  return players.filter((player) => player.profile.position === position);
}

export async function getPlayerStatistics(
  db: D1Database,
  baseUrl: string,
  options: PlayerStatisticsOptions = {},
) {
  const search = new URLSearchParams({
    season: options.season ?? "",
    sort: "",
    filter: "",
  });
  const response = await fetch(`${baseUrl}/player-search/?${search}`, {
    next: { revalidate: 7200 },
  });
  if (!response.ok) {
    throw new Error("Unable to load player statistics");
  }

  const result = (await response.json()) as {
    players: PlayerSeasonSummary[];
  };
  const players = await enrichPlayerStatistics(db, result.players);

  return sortPlayers(filterPlayers(players, options.filter), options.sort);
}
