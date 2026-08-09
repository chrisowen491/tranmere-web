import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";

export type MatchOutcome = "W" | "D" | "L";

export function isTranmereHome(match: Match) {
  return (
    match.location === "H" ||
    match.venue?.toLowerCase() === "home" ||
    match.home?.toLowerCase().includes("tranmere")
  );
}

export function goalsFor(match: Match) {
  return isTranmereHome(match) ? match.hgoal : match.vgoal;
}

export function goalsAgainst(match: Match) {
  return isTranmereHome(match) ? match.vgoal : match.hgoal;
}

export function matchOutcome(match: Match): MatchOutcome {
  const recorded = match.ft?.trim().charAt(0).toUpperCase();
  if (recorded === "W" || recorded === "D" || recorded === "L") {
    return recorded;
  }

  const difference = goalsFor(match) - goalsAgainst(match);
  return difference > 0 ? "W" : difference < 0 ? "L" : "D";
}

export function resultLabel(match: Match) {
  return match.ft?.trim() || `${goalsFor(match)}–${goalsAgainst(match)}`;
}

export function outcomeClass(
  outcome: MatchOutcome,
  drawClass = "bg-slate-500",
) {
  return {
    W: "bg-emerald-600",
    D: drawClass,
    L: "bg-red-600",
  }[outcome];
}

export function outcomeCounts(matches: Match[]) {
  return matches.reduce(
    (counts, match) => {
      counts[matchOutcome(match)] += 1;
      return counts;
    },
    { W: 0, D: 0, L: 0 } satisfies Record<MatchOutcome, number>,
  );
}

export function parseArchiveDate(value?: string) {
  if (!value || value.toLowerCase().startsWith("now")) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
