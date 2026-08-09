import { queryAppRows, queryGoalRows } from "@tranmere-web/lib/src/d1-queries";
import type { AppRow } from "@tranmere-web/lib/src/d1-types";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { getPlayersByNames } from "@/lib/players";
import { searchGames } from "@/lib/games";

export interface PartnershipMatch {
  date: string;
  season: string;
  opposition: string;
  competition: string;
  result: "W" | "D" | "L" | null;
  scored: number | null;
  conceded: number | null;
  firstPlayerGoals: number;
  secondPlayerGoals: number;
}

export interface PlayerPartnership {
  firstPlayer: string;
  secondPlayer: string;
  matches: PartnershipMatch[];
  sharedSeasons: string[];
}

interface PartnershipAppearance {
  key: string;
  date: string;
  season: string;
  opposition: string;
  competition: string;
  goals: number;
}

function appearanceKey(season: number, date: string) {
  return `${season}|${date.slice(0, 10)}`;
}

function toAppearances(
  starts: AppRow[],
  substituteAppearances: AppRow[],
  goalsByMatch: Map<string, number>,
) {
  const appearances = new Map<string, PartnershipAppearance>();
  for (const app of [...substituteAppearances, ...starts]) {
    const key = appearanceKey(app.season, app.match_date);
    appearances.set(key, {
      key,
      date: app.match_date,
      season: String(app.season),
      opposition: app.opposition,
      competition: app.competition ?? "",
      goals: goalsByMatch.get(key) ?? 0,
    });
  }
  return appearances;
}

function matchKey(match: Match) {
  return `${match.season}|${match.date.slice(0, 10)}`;
}

function matchResult(match?: Match) {
  if (!match) return null;
  const isHome = match.home === "Tranmere Rovers";
  const scored = isHome ? match.hgoal : match.vgoal;
  const conceded = isHome ? match.vgoal : match.hgoal;
  return {
    result: (scored > conceded ? "W" : scored < conceded ? "L" : "D") as
      "W" | "D" | "L",
    scored,
    conceded,
  };
}

export async function getPlayerPartnership(
  db: D1Database,
  firstPlayer: string,
  secondPlayer: string,
): Promise<PlayerPartnership> {
  const profiles = await getPlayersByNames(db, [firstPlayer, secondPlayer]);
  if (!profiles.has(firstPlayer) || !profiles.has(secondPlayer)) {
    throw new Error("Player not found");
  }

  const [
    firstStarts,
    firstSubstitutes,
    firstGoals,
    secondStarts,
    secondSubstitutes,
    secondGoals,
  ] = await Promise.all([
    queryAppRows(db, { player: firstPlayer, playerMatch: "exact" }),
    queryAppRows(db, { substitutedBy: firstPlayer }),
    queryGoalRows(db, { scorer: firstPlayer, scorerMatch: "exact" }),
    queryAppRows(db, { player: secondPlayer, playerMatch: "exact" }),
    queryAppRows(db, { substitutedBy: secondPlayer }),
    queryGoalRows(db, { scorer: secondPlayer, scorerMatch: "exact" }),
  ]);
  const goalsByMatch = (goals: typeof firstGoals) =>
    goals.reduce((totals, goal) => {
      const key = appearanceKey(goal.season, goal.match_date);
      totals.set(key, (totals.get(key) ?? 0) + 1);
      return totals;
    }, new Map<string, number>());
  const firstAppearances = toAppearances(
    firstStarts,
    firstSubstitutes,
    goalsByMatch(firstGoals),
  );
  const secondAppearances = toAppearances(
    secondStarts,
    secondSubstitutes,
    goalsByMatch(secondGoals),
  );
  const sharedAppearances = [...firstAppearances.values()]
    .filter((appearance) => secondAppearances.has(appearance.key))
    .toSorted((a, b) => b.date.localeCompare(a.date));
  const sharedSeasons = [
    ...new Set(sharedAppearances.map((appearance) => appearance.season)),
  ].sort((a, b) => Number(a) - Number(b));

  const seasonResults = await Promise.all(
    sharedSeasons.map(
      async (season) =>
        (await searchGames(db, { season: Number(season) })).results,
    ),
  );
  const results = new Map(
    seasonResults.flat().map((match) => [matchKey(match), match]),
  );

  return {
    firstPlayer,
    secondPlayer,
    sharedSeasons,
    matches: sharedAppearances.map((firstAppearance) => {
      const key = firstAppearance.key;
      const secondAppearance = secondAppearances.get(key)!;
      const match = results.get(key);
      const outcome = matchResult(match);
      return {
        date: firstAppearance.date.slice(0, 10),
        season: firstAppearance.season,
        opposition:
          match?.opposition ||
          firstAppearance.opposition ||
          secondAppearance.opposition,
        competition:
          match?.competition ||
          firstAppearance.competition ||
          secondAppearance.competition,
        result: outcome?.result || null,
        scored: outcome?.scored ?? null,
        conceded: outcome?.conceded ?? null,
        firstPlayerGoals: firstAppearance.goals,
        secondPlayerGoals: secondAppearance.goals,
      };
    }),
  };
}
