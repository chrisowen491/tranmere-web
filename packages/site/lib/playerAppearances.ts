import type { PlayerAppearanceRow } from "@tranmere-web/lib/src/d1-types";
import type { Appearance } from "@tranmere-web/lib/src/tranmere-web-types";

export function goalCountsByDate(rows: Array<{ match_date: string }>) {
  return rows.reduce((counts, row) => {
    counts.set(row.match_date, (counts.get(row.match_date) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

export interface PlayerShirtNumberRecord {
  number: number;
  appearances: number;
  starts: number;
  substituteAppearances: number;
}

function validShirtNumber(value: number | null) {
  return value !== null && Number.isInteger(value) && value > 0 && value < 100;
}

export function buildPlayerShirtNumberHistory(
  rows: PlayerAppearanceRow[],
  playerName: string,
) {
  const records = new Map<number, PlayerShirtNumberRecord>();

  for (const row of rows) {
    const isSubstitute = row.appearance_type === "Sub";
    const number = isSubstitute
      ? row.substituted_by === playerName
        ? row.substituted_by_shirt_number
        : row.substitute_substituted_by_shirt_number
      : row.shirt_number;

    if (!validShirtNumber(number)) continue;

    const record = records.get(number!) ?? {
      number: number!,
      appearances: 0,
      starts: 0,
      substituteAppearances: 0,
    };
    record.appearances += 1;
    if (isSubstitute) record.substituteAppearances += 1;
    else record.starts += 1;
    records.set(number!, record);
  }

  return [...records.values()].sort(
    (left, right) =>
      right.appearances - left.appearances || left.number - right.number,
  );
}

export function mapPlayerAppearance(
  row: PlayerAppearanceRow,
  playerName: string,
  goals: number,
): Appearance {
  const isSubstitute = row.appearance_type === "Sub";

  return {
    id: `${row.id}-${row.appearance_type.toLowerCase()}`,
    Date: row.match_date,
    Opposition: row.opposition,
    Competition: row.competition ?? "",
    Season: String(row.season),
    Name: playerName,
    Number: (isSubstitute
      ? row.substituted_by === playerName
        ? row.substituted_by_shirt_number
        : row.substitute_substituted_by_shirt_number
      : row.shirt_number
    )?.toString(),
    SubbedBy: isSubstitute ? row.player_name : row.substituted_by,
    SubTime: row.substitute_time,
    YellowCard: (isSubstitute ? row.substitute_yellow_card : row.yellow_card)
      ? "TRUE"
      : null,
    RedCard: (isSubstitute ? row.substitute_red_card : row.red_card)
      ? "TRUE"
      : null,
    Type: row.appearance_type,
    Goals: goals,
  };
}
