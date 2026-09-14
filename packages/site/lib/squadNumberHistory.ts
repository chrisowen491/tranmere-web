import type { AppRow } from "@tranmere-web/lib/src/d1-types";

export interface SquadNumberFilters {
  number?: number;
  season?: number;
}

export interface NumberPlayerRecord {
  player: string;
  appearances: number;
  firstDate: string;
  lastDate: string;
  seasons: number[];
}

export interface SquadNumberRecord {
  number: number;
  appearances: number;
  players: number;
  seasons: number[];
  firstDate: string;
  lastDate: string;
  leadingPlayer: NumberPlayerRecord;
  playerRecords: NumberPlayerRecord[];
}

function validNumber(value: number | null) {
  return value !== null && Number.isInteger(value) && value > 0 && value < 100;
}

function numberedAppearances(rows: AppRow[]) {
  return rows.flatMap((row) => {
    const appearances = [row];
    if (row.substituted_by) {
      appearances.push({
        ...row,
        id: `${row.id}:substitute`,
        player_name: row.substituted_by,
        shirt_number: row.substituted_by_shirt_number,
      });
    }
    if (row.substitute_substituted_by) {
      appearances.push({
        ...row,
        id: `${row.id}:second-substitute`,
        player_name: row.substitute_substituted_by,
        shirt_number: row.substitute_substituted_by_shirt_number,
      });
    }
    return appearances;
  });
}

function playerRecords(rows: AppRow[]) {
  const players = new Map<string, AppRow[]>();
  for (const row of rows) {
    players.set(row.player_name, [
      ...(players.get(row.player_name) ?? []),
      row,
    ]);
  }
  return [...players].map(([player, appearances]) => ({
    player,
    appearances: appearances.length,
    firstDate: appearances.map((row) => row.match_date).sort()[0],
    lastDate: appearances
      .map((row) => row.match_date)
      .sort()
      .at(-1)!,
    seasons: [...new Set(appearances.map((row) => row.season))].sort(
      (left, right) => left - right,
    ),
  }));
}

export function buildSquadNumberHistory(
  rows: AppRow[],
  filters: SquadNumberFilters = {},
) {
  const numberedRows = numberedAppearances(rows).filter((row) =>
    validNumber(row.shirt_number),
  );
  const filteredRows = numberedRows.filter(
    (row) =>
      (!filters.number || row.shirt_number === filters.number) &&
      (!filters.season || row.season === filters.season),
  );
  const numberGroups = new Map<number, AppRow[]>();
  for (const row of filteredRows) {
    const number = row.shirt_number!;
    numberGroups.set(number, [...(numberGroups.get(number) ?? []), row]);
  }

  const numbers: SquadNumberRecord[] = [...numberGroups]
    .map(([number, appearances]) => {
      const players = playerRecords(appearances).sort(
        (left, right) =>
          right.appearances - left.appearances ||
          left.firstDate.localeCompare(right.firstDate) ||
          left.player.localeCompare(right.player),
      );
      const dates = appearances.map((row) => row.match_date).sort();
      return {
        number,
        appearances: appearances.length,
        players: players.length,
        seasons: [...new Set(appearances.map((row) => row.season))].sort(
          (left, right) => left - right,
        ),
        firstDate: dates[0],
        lastDate: dates.at(-1)!,
        leadingPlayer: players[0],
        playerRecords: players,
      };
    })
    .sort((left, right) => left.number - right.number);

  const byPlayer = new Map<string, AppRow[]>();
  for (const row of numberedRows) {
    byPlayer.set(row.player_name, [
      ...(byPlayer.get(row.player_name) ?? []),
      row,
    ]);
  }
  const versatilePlayers = [...byPlayer]
    .map(([player, appearances]) => ({
      player,
      numbers: [...new Set(appearances.map((row) => row.shirt_number!))].sort(
        (left, right) => left - right,
      ),
      appearances: appearances.length,
    }))
    .filter((player) => player.numbers.length > 1)
    .sort(
      (left, right) =>
        right.numbers.length - left.numbers.length ||
        right.appearances - left.appearances ||
        left.player.localeCompare(right.player),
    );

  return {
    numberedRows,
    filteredRows,
    numbers,
    versatilePlayers,
    seasons: [...new Set(numberedRows.map((row) => row.season))].sort(
      (left, right) => right - left,
    ),
    players: new Set(numberedRows.map((row) => row.player_name)).size,
  };
}
