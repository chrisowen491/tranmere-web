import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import type { PlayerStatisticsView } from "@/lib/playerStatistics";
import { goalsAgainst, goalsFor, matchOutcome } from "@/lib/seasonMatchUtils";

const DIVISION_NAMES: Record<number, Record<number, string>> = {
  0: { 2: "Division 2", 3: "Division 3", 4: "Division 4" },
  1: { 2: "Division 1", 3: "Division 2", 4: "Division 3" },
  2: { 2: "The Championship", 3: "League One", 4: "League Two" },
};

export function seasonLabel(season: string) {
  return `${season}–${String(Number(season) + 1).slice(-2)}`;
}

export function shortDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

export function divisionName(results: Match[], season: number) {
  const tier = results.reduce<number | undefined>((currentTier, result) => {
    const isLeague =
      result.competition === "League" || result.competition === "Conference";
    return isLeague && result.tier ? result.tier : currentTier;
  }, undefined);

  if (tier === 5) return "National League";
  if (!tier) return "Season archive";

  const era = season < 1992 ? 0 : season < 2004 ? 1 : 2;
  return DIVISION_NAMES[era]?.[tier] ?? "Season archive";
}

export function uniqueMatches(matches: Array<Match | undefined>) {
  const seen = new Set<string>();
  return matches.filter((match): match is Match => {
    if (!match) return false;
    const key = `${match.date}-${match.opposition}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function maxBy<T>(items: T[], score: (item: T) => number) {
  return items.reduce<T | undefined>(
    (best, item) => (!best || score(item) > score(best) ? item : best),
    undefined,
  );
}

export function summarizeResults(results: Match[]) {
  return results.reduce(
    (summary, match) => {
      const result = matchOutcome(match);
      summary[result] += 1;
      summary.scored += goalsFor(match);
      summary.conceded += goalsAgainst(match);
      if (match.attendance && match.attendance > 0) {
        summary.attendanceTotal += match.attendance;
        summary.attendanceCount += 1;
      }
      return summary;
    },
    {
      W: 0,
      D: 0,
      L: 0,
      scored: 0,
      conceded: 0,
      attendanceTotal: 0,
      attendanceCount: 0,
    },
  );
}

function positionGroup(position?: string | null) {
  const normalized = position?.toLowerCase() ?? "";
  if (normalized.includes("goalkeeper")) return "goalkeeper";
  if (
    normalized.includes("defender") ||
    normalized.includes("full back") ||
    normalized.includes("fullback")
  ) {
    return "defence";
  }
  if (normalized.includes("striker") || normalized.includes("forward")) {
    return "attack";
  }
  if (
    normalized.includes("midfielder") ||
    normalized.includes("midfield") ||
    normalized.includes("winger")
  ) {
    return "midfield";
  }
  return "other";
}

function arrangeWidePlayers<T>(widePlayers: T[], centralPlayers: T[]) {
  return widePlayers.length < 2
    ? [...widePlayers, ...centralPlayers]
    : [widePlayers[0], ...centralPlayers, ...widePlayers.slice(1).reverse()];
}

export function buildMostUsedXi(players: PlayerStatisticsView[]) {
  const ranked = [...players].sort(
    (a, b) => b.starts + b.subs - (a.starts + a.subs),
  );
  const selected = new Set<string>();
  const select = (group: string, count: number) => {
    const available = ranked.filter((player) => !selected.has(player.Player));
    const positional = available.filter(
      (player) => positionGroup(player.profile.position) === group,
    );
    const selection = [
      ...positional,
      ...available.filter((player) => !positional.includes(player)),
    ].slice(0, count);
    selection.forEach((player) => selected.add(player.Player));
    return selection;
  };

  const goalkeeper = select("goalkeeper", 1);
  const defence = select("defence", 4);
  const midfield = select("midfield", 4);
  const attack = select("attack", 2);
  return [
    attack,
    arrangeWidePlayers(
      midfield.filter((player) => player.profile.position === "Winger"),
      midfield.filter((player) => player.profile.position !== "Winger"),
    ),
    arrangeWidePlayers(
      defence.filter((player) => player.profile.position === "Full Back"),
      defence.filter((player) => player.profile.position !== "Full Back"),
    ),
    goalkeeper,
  ];
}
