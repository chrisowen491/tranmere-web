import { queryGoalRows } from "@tranmere-web/lib/src/d1-queries";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { getHeadToHead, searchGames } from "@/lib/games";
import { matchOutcome, resultLabel } from "@/lib/seasonMatchUtils";

type Streak = { length: number; start?: Match; end?: Match };

function sortByDate(matches: Match[], direction: "asc" | "desc" = "asc") {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...matches].sort(
    (left, right) =>
      multiplier *
      (new Date(left.date).getTime() - new Date(right.date).getTime()),
  );
}

function longestStreak(matches: Match[], predicate: (match: Match) => boolean) {
  let best: Streak = { length: 0 };
  let current: Streak = { length: 0 };

  for (const match of sortByDate(matches)) {
    if (!predicate(match)) {
      current = { length: 0 };
      continue;
    }
    current = {
      length: current.length + 1,
      start: current.start ?? match,
      end: match,
    };
    if (current.length > best.length) best = current;
  }
  return best;
}

function scoreDifference(match: Match) {
  const home = match.home === "Tranmere Rovers";
  return home ? match.hgoal - match.vgoal : match.vgoal - match.hgoal;
}

function maximumBy<T>(items: T[], score: (item: T) => number) {
  return items.reduce<T | undefined>(
    (best, item) => (!best || score(item) > score(best) ? item : best),
    undefined,
  );
}

export async function getOpponentDossier(db: D1Database, opposition: string) {
  const [{ results }, goals] = await Promise.all([
    searchGames(db, { opposition, sort: "date-asc" }),
    queryGoalRows(db, { opposition }),
  ]);
  const matches = sortByDate(results);
  const scorers = [
    ...goals.reduce((totals, goal) => {
      totals.set(goal.scorer, (totals.get(goal.scorer) ?? 0) + 1);
      return totals;
    }, new Map<string, number>()),
  ]
    .map(([name, goals]) => ({ name, goals }))
    .sort(
      (left, right) =>
        right.goals - left.goals || left.name.localeCompare(right.name),
    );

  const wins = matches.filter((match) => matchOutcome(match) === "W");
  const defeats = matches.filter((match) => matchOutcome(match) === "L");

  return {
    matches,
    recentMatches: sortByDate(matches, "desc").slice(0, 6),
    firstMeeting: matches[0],
    latestMeeting: matches.at(-1),
    record: getHeadToHead(matches),
    scorers: scorers.slice(0, 5),
    biggestWin: maximumBy(wins, scoreDifference),
    heaviestDefeat: maximumBy(defeats, (match) => -scoreDifference(match)),
    longestWinningRun: longestStreak(
      matches,
      (match) => matchOutcome(match) === "W",
    ),
    longestWinlessRun: longestStreak(
      matches,
      (match) => matchOutcome(match) !== "W",
    ),
  };
}

export function opponentMatchSummary(match?: Match) {
  if (!match) return "No fixture recorded";
  return `${match.opposition} · ${resultLabel(match)}`;
}
