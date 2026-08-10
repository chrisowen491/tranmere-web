import type { PlayerAppearanceRow } from "@tranmere-web/lib/src/d1-types";
import type { Appearance } from "@tranmere-web/lib/src/tranmere-web-types";

export function goalCountsByDate(rows: Array<{ match_date: string }>) {
  return rows.reduce((counts, row) => {
    counts.set(row.match_date, (counts.get(row.match_date) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
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
    Number: row.shirt_number?.toString(),
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
