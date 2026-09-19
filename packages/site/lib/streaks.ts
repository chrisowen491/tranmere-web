import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import {
  goalsAgainst,
  goalsFor,
  matchOutcome,
  outcomeCounts,
  type MatchOutcome,
} from "./seasonMatchUtils";

export type StreakKind =
  "wins" | "unbeaten" | "winless" | "losses" | "cleanSheets" | "scoring";

export interface Streak {
  kind: StreakKind;
  label: string;
  matches: Match[];
  record: Record<MatchOutcome, number>;
  goalsFor: number;
  goalsAgainst: number;
}

const definitions: Record<
  StreakKind,
  { label: string; matches: (match: Match) => boolean }
> = {
  wins: {
    label: "Winning run",
    matches: (match) => matchOutcome(match) === "W",
  },
  unbeaten: {
    label: "Unbeaten run",
    matches: (match) => matchOutcome(match) !== "L",
  },
  winless: {
    label: "Winless run",
    matches: (match) => matchOutcome(match) !== "W",
  },
  losses: {
    label: "Losing run",
    matches: (match) => matchOutcome(match) === "L",
  },
  cleanSheets: {
    label: "Clean-sheet run",
    matches: (match) => goalsAgainst(match) === 0,
  },
  scoring: { label: "Scoring run", matches: (match) => goalsFor(match) > 0 },
};

function summarise(kind: StreakKind, matches: Match[]): Streak {
  return {
    kind,
    label: definitions[kind].label,
    matches,
    record: outcomeCounts(matches),
    goalsFor: matches.reduce((total, match) => total + goalsFor(match), 0),
    goalsAgainst: matches.reduce(
      (total, match) => total + goalsAgainst(match),
      0,
    ),
  };
}

export function longestStreak(
  matches: Match[],
  kind: StreakKind,
): Streak | null {
  const ordered = [...matches].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
  const predicate = definitions[kind].matches;
  let current: Match[] = [];
  let longest: Match[] = [];

  for (const match of ordered) {
    if (predicate(match)) {
      current.push(match);
      if (current.length > longest.length) longest = [...current];
    } else {
      current = [];
    }
  }
  return longest.length ? summarise(kind, longest) : null;
}

export function buildStreakExplorer(matches: Match[]) {
  const kinds: StreakKind[] = [
    "wins",
    "unbeaten",
    "winless",
    "losses",
    "cleanSheets",
    "scoring",
  ];
  return kinds.flatMap((kind) => {
    const streak = longestStreak(matches, kind);
    return streak ? [streak] : [];
  });
}
