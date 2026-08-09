import type { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { queryPlayerSeasonSummaryRows } from "@tranmere-web/lib/src/d1-queries";
import type { PlayerSeasonSummaryRow } from "@tranmere-web/lib/src/d1-types";
import { getPlayersByNames } from "@/lib/players";

export const defaultPlayerAvatar =
  "https://www.tranmere-web.com/builder/2026/none/cccccc/none/000000/cccccc/none/cccccc";

export interface PlayerStatisticsProfile {
  picLink: string;
  position: string | null;
  secondaryPosition: string | null;
}

export interface PlayerStatisticsView extends Omit<
  PlayerSeasonSummary,
  "bio" | "picLink"
> {
  profile: PlayerStatisticsProfile;
}

export interface PlayerStatisticsOptions {
  player?: string;
  season?: string;
  sort?: string;
  filter?: string;
  limit?: number;
}

export function mapPlayerSeasonSummary(
  row: PlayerSeasonSummaryRow,
): PlayerSeasonSummary {
  return {
    Season: row.season,
    Player: row.player_name,
    Apps: row.appearances,
    goals: row.goals,
    assists: row.assists,
    yellow: row.yellow_cards,
    red: row.red_cards,
    penalties: row.penalties,
    headers: row.headers,
    starts: row.starts,
    subs: row.substitute_appearances,
    freekicks: row.free_kicks,
    goalsPerGame:
      row.appearances > 0
        ? Math.round((row.goals / row.appearances) * 100) / 100
        : 0,
  };
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
          secondaryPosition: profile?.secondaryPosition || null,
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
    profile: profiles.get(player.Player) ?? {
      picLink: defaultPlayerAvatar,
      position: null,
      secondaryPosition: null,
    },
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
  if (sort === "Subs") {
    return players.sort(
      (a, b) =>
        b.subs - a.subs ||
        a.starts - b.starts ||
        a.Player.localeCompare(b.Player),
    );
  }
  return players;
}

function filterPlayers(players: PlayerStatisticsView[], filter?: string) {
  if (!filter) return players;
  if (filter === "OnlyOneApp") {
    return players.filter(
      (player) =>
        (Number(player.Apps) || Number(player.starts) + Number(player.subs)) ===
        1,
    );
  }
  const position = positionFilters[filter];
  if (!position) return players;
  return players.filter(
    (player) =>
      player.profile.position === position ||
      player.profile.secondaryPosition === position,
  );
}

export async function getPlayerStatistics(
  db: D1Database,
  options: PlayerStatisticsOptions = {},
) {
  const rows = await queryPlayerSeasonSummaryRows(db, {
    player: options.player,
    playerMatch: options.player ? "contains" : undefined,
    season: options.season || "TOTAL",
    limit: options.limit,
  });
  const players = await enrichPlayerStatistics(
    db,
    rows.map(mapPlayerSeasonSummary),
  );

  return sortPlayers(filterPlayers(players, options.filter), options.sort);
}
