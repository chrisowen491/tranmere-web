import {
  queryAppRows,
  queryGoalRows,
  queryPlayerSeasonSummaryRows,
} from "@tranmere-web/lib/src/d1-queries";
import type { ManagerRecord } from "@/lib/managers";
import { getPlayersByNames, type PlayerRecord } from "@/lib/players";
import { arrangeLineup, formationLabel } from "@/lib/matchLineup";
import { searchGames } from "@/lib/games";
import { statisticalMatches } from "@tranmere-web/lib/src/competition-constants";

export interface TrustedXiPlayer {
  name: string;
  position: string;
  secondaryPosition: string;
  picLink: string;
  starts: number;
  substituteAppearances: number;
  goals: number;
}

export interface ManagerTrustedXi {
  manager: ManagerRecord;
  formation: string;
  rows: TrustedXiPlayer[][];
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  captain: string;
  archiveStarts: string;
}

function seasonForDate(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  return date.getUTCMonth() >= 6 ? year : year - 1;
}

function seasonsForManager(manager: ManagerRecord) {
  const first = Math.max(1960, seasonForDate(manager.dateJoined));
  const dateLeft = manager.dateLeft.toLowerCase().startsWith("now")
    ? new Date().toISOString().slice(0, 10)
    : manager.dateLeft;
  const final = Math.max(first, seasonForDate(dateLeft));
  return Array.from({ length: final - first + 1 }, (_, index) => first + index);
}

function positionGroup(position?: string | null) {
  const value = position?.toLowerCase() || "";
  if (value.includes("goalkeeper")) return "goalkeeper";
  if (value.includes("full back") || value.includes("fullback"))
    return "fullback";
  if (value.includes("defender")) return "defender";
  if (value.includes("winger")) return "winger";
  if (value.includes("midfielder")) return "midfielder";
  if (value.includes("striker") || value.includes("forward")) return "striker";
  return "other";
}

export async function getManagerTrustedXi(
  db: D1Database,
  manager: ManagerRecord,
): Promise<ManagerTrustedXi> {
  const seasons = seasonsForManager(manager);
  const seasonSummaries = (await queryPlayerSeasonSummaryRows(db)).filter(
    (summary) => seasons.includes(Number(summary.season)),
  );
  const playerProfiles = await getPlayersByNames(
    db,
    seasonSummaries.map((summary) => summary.player_name),
  );
  const candidates = new Map<
    string,
    { player: PlayerRecord; appearances: number }
  >();
  seasonSummaries.forEach((summary) => {
    const existing = candidates.get(summary.player_name);
    const player = playerProfiles.get(summary.player_name);
    if (!player) return;
    candidates.set(summary.player_name, {
      player,
      appearances:
        (existing?.appearances || 0) +
        summary.starts +
        summary.substitute_appearances,
    });
  });

  const candidatePool = [
    ...new Set(
      [
        "goalkeeper",
        "fullback",
        "defender",
        "winger",
        "midfielder",
        "striker",
        "other",
      ].flatMap((group) =>
        [...candidates.entries()]
          .filter(
            ([, value]) =>
              positionGroup(value.player.position) === group ||
              positionGroup(value.player.secondaryPosition) === group,
          )
          .sort((a, b) => b[1].appearances - a[1].appearances)
          .slice(0, group === "other" ? 8 : 12)
          .map(([name]) => name),
      ),
    ),
  ];
  const joined = manager.dateJoined.slice(0, 10);
  const left = manager.dateLeft.toLowerCase().startsWith("now")
    ? new Date().toISOString().slice(0, 10)
    : manager.dateLeft.slice(0, 10);
  const [apps, goals] = await Promise.all([
    queryAppRows(db, {
      dateFrom: joined,
      dateTo: left,
      statisticsOnly: true,
    }),
    queryGoalRows(db, {
      dateFrom: joined,
      dateTo: left,
      statisticsOnly: true,
    }),
  ]);
  const starts = new Map<string, number>();
  const substituteAppearances = new Map<string, number>();
  const goalTotals = new Map<string, number>();
  for (const app of apps) {
    if (candidates.has(app.player_name)) {
      starts.set(app.player_name, (starts.get(app.player_name) ?? 0) + 1);
    }
    if (app.substituted_by && candidates.has(app.substituted_by)) {
      substituteAppearances.set(
        app.substituted_by,
        (substituteAppearances.get(app.substituted_by) ?? 0) + 1,
      );
    }
  }
  for (const goal of goals) {
    if (candidates.has(goal.scorer)) {
      goalTotals.set(goal.scorer, (goalTotals.get(goal.scorer) ?? 0) + 1);
    }
  }
  const ranked = candidatePool
    .map((name) => {
      const player = playerProfiles.get(name)!;
      return {
        name,
        position: player.position || "",
        secondaryPosition: player.secondaryPosition || "",
        picLink: player.picLink || "",
        starts: starts.get(name) ?? 0,
        substituteAppearances: substituteAppearances.get(name) ?? 0,
        goals: goalTotals.get(name) ?? 0,
      } satisfies TrustedXiPlayer;
    })
    .filter((player) => player.starts > 0)
    .sort(
      (a, b) =>
        b.starts - a.starts ||
        b.starts +
          b.substituteAppearances -
          (a.starts + a.substituteAppearances),
    );
  const lineup = arrangeLineup(
    ranked,
    manager.favouriteFormation,
    (player) => ({
      position: player.position,
      secondaryPosition: player.secondaryPosition,
    }),
    (_player, index) => Math.max(0, 100 - index),
  );
  const selectedPlayers = lineup.rows.flat();

  const { results: matches } = await searchGames(db, {
    dateFrom: joined,
    dateTo: left,
    statisticsOnly: true,
  });
  const countedMatches = statisticalMatches(matches);
  const outcomes = countedMatches.map((match) => {
    const home = match.home === "Tranmere Rovers";
    const scored = home ? match.hgoal : match.vgoal;
    const conceded = home ? match.vgoal : match.hgoal;
    return scored > conceded ? "W" : scored < conceded ? "L" : "D";
  });

  return {
    manager,
    formation: formationLabel(lineup.formation),
    rows: lineup.rows,
    matches: countedMatches.length,
    wins: outcomes.filter((outcome) => outcome === "W").length,
    draws: outcomes.filter((outcome) => outcome === "D").length,
    losses: outcomes.filter((outcome) => outcome === "L").length,
    captain:
      [...selectedPlayers].sort((a, b) => b.starts - a.starts)[0]?.name || "",
    archiveStarts: `${firstSeasonLabel(seasons[0])}`,
  };
}

function firstSeasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}
