import type { Manager, Match } from "@tranmere-web/lib/src/tranmere-web-types";

export interface ManagerSelection {
  manager: Manager;
  key: string;
  label: string;
}

export interface ManagerStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  winRate: number;
  pointsPerGame: number;
  bestWinningRun: number;
  bestUnbeatenRun: number;
  homeWinRate: number;
  awayWinRate: number;
}

export type ManagerOutcome = "W" | "D" | "L";

export function formatManagerDate(value: string) {
  if (value.toLowerCase().startsWith("now")) return "present";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getManagerSelections(managers: Manager[]): ManagerSelection[] {
  return managers.map((manager) => ({
    manager,
    key: `${manager.name}|${manager.dateJoined}|${manager.dateLeft}`,
    label: `${manager.name} · ${formatManagerDate(manager.dateJoined)}–${formatManagerDate(manager.dateLeft)}`,
  }));
}

export function managerResult(match: Match) {
  const home = match.home === "Tranmere Rovers";
  const scored = home ? match.hgoal : match.vgoal;
  const conceded = home ? match.vgoal : match.hgoal;
  return {
    label: (scored > conceded
      ? "W"
      : scored < conceded
        ? "L"
        : "D") as ManagerOutcome,
    scored,
    conceded,
    home,
  };
}

function percentage(value: number, total: number) {
  return total ? (value / total) * 100 : 0;
}

export function calculateManagerStats(matches: Match[]): ManagerStats {
  const chronological = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const state = {
    winningRun: 0,
    unbeatenRun: 0,
    bestWinningRun: 0,
    bestUnbeatenRun: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    homeMatches: 0,
    homeWins: 0,
    awayMatches: 0,
    awayWins: 0,
  };

  chronological.forEach((match) => {
    const result = managerResult(match);
    state.goalsFor += result.scored;
    state.goalsAgainst += result.conceded;

    if (result.home) {
      state.homeMatches += 1;
      state.homeWins += Number(result.label === "W");
    } else {
      state.awayMatches += 1;
      state.awayWins += Number(result.label === "W");
    }

    if (result.label === "W") {
      state.won += 1;
      state.winningRun += 1;
      state.unbeatenRun += 1;
    } else if (result.label === "D") {
      state.drawn += 1;
      state.winningRun = 0;
      state.unbeatenRun += 1;
    } else {
      state.lost += 1;
      state.winningRun = 0;
      state.unbeatenRun = 0;
    }

    state.bestWinningRun = Math.max(state.bestWinningRun, state.winningRun);
    state.bestUnbeatenRun = Math.max(state.bestUnbeatenRun, state.unbeatenRun);
  });

  return {
    played: matches.length,
    won: state.won,
    drawn: state.drawn,
    lost: state.lost,
    goalsFor: state.goalsFor,
    goalsAgainst: state.goalsAgainst,
    winRate: percentage(state.won, matches.length),
    pointsPerGame: matches.length
      ? (state.won * 3 + state.drawn) / matches.length
      : 0,
    bestWinningRun: state.bestWinningRun,
    bestUnbeatenRun: state.bestUnbeatenRun,
    homeWinRate: percentage(state.homeWins, state.homeMatches),
    awayWinRate: percentage(state.awayWins, state.awayMatches),
  };
}

export async function loadManagerMatches(selection: ManagerSelection) {
  const { dateJoined, dateLeft } = selection.manager;
  const endDate = dateLeft.toLowerCase().startsWith("now")
    ? new Date().toISOString().slice(0, 10)
    : dateLeft;
  const managerRange = encodeURIComponent(`${dateJoined},${endDate}`);
  return loadAllResultPages({ manager: managerRange, sort: "Date" });
}

export async function loadAllResultPages(
  parameters: Record<string, string>,
  signal?: AbortSignal,
) {
  const results: Match[] = [];
  let cursor = 0;

  for (let page = 0; page < 100; page += 1) {
    const search = new URLSearchParams({
      ...parameters,
      cursor: String(cursor),
      limit: "100",
    });
    const response = await fetch(`/api/result-search?${search}`, { signal });
    if (!response.ok) throw new Error("Unable to load manager results");
    const data = (await response.json()) as {
      results: Match[];
      pagination: { nextCursor: number | null };
    };
    results.push(...data.results);
    if (data.pagination.nextCursor === null) return results;
    cursor = data.pagination.nextCursor;
  }

  throw new Error("Too many manager results to load safely.");
}
