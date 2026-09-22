import { describe, expect, it } from "vitest";
import type { AppRow } from "@tranmere-web/lib/src/d1-types";
import { buildSquadNumberHistory } from "@/lib/squadNumberHistory";
import { buildPlayerShirtNumberHistory } from "@/lib/playerAppearances";

function appearance(
  player: string,
  number: number | null,
  season: number,
  date: string,
): AppRow {
  return {
    id: `${player}-${date}`,
    player_name: player,
    shirt_number: number,
    season,
    match_date: date,
    competition: "League",
    opposition: "Oldham Athletic",
    yellow_card: 0,
    red_card: 0,
    substitute_yellow_card: 0,
    substitute_red_card: 0,
    substitute_time: null,
    substituted_by: null,
    substitute_substituted_by: null,
    substituted_by_shirt_number: null,
    substitute_substituted_by_shirt_number: null,
  };
}

describe("squad number history", () => {
  const rows = [
    appearance("Goalkeeper A", 1, 2000, "2000-08-01"),
    appearance("Goalkeeper A", 1, 2000, "2000-08-08"),
    appearance("Goalkeeper B", 1, 2001, "2001-08-01"),
    appearance("Utility Player", 2, 2000, "2000-08-01"),
    appearance("Utility Player", 4, 2001, "2001-08-01"),
    appearance("Unknown Number", null, 2001, "2001-08-01"),
  ];

  it("summarises players and seasons for each number", () => {
    const history = buildSquadNumberHistory(rows);
    const numberOne = history.numbers.find((record) => record.number === 1);

    expect(numberOne).toMatchObject({
      appearances: 3,
      players: 2,
      seasons: [2000, 2001],
    });
    expect(numberOne?.leadingPlayer.player).toBe("Goalkeeper A");
    expect(history.players).toBe(3);
    expect(history.versatilePlayers[0]).toMatchObject({
      player: "Utility Player",
      numbers: [2, 4],
    });
  });

  it("filters the archive by number and season", () => {
    const history = buildSquadNumberHistory(rows, {
      number: 1,
      season: 2001,
    });

    expect(history.filteredRows).toHaveLength(1);
    expect(history.numbers).toHaveLength(1);
    expect(history.numbers[0].leadingPlayer.player).toBe("Goalkeeper B");
  });

  it("includes recorded shirt numbers for substitutes", () => {
    const row = appearance("Starter", 9, 1985, "1985-08-01");
    row.substituted_by = "Substitute";
    row.substituted_by_shirt_number = 12;

    const history = buildSquadNumberHistory([row]);

    expect(
      history.numbers.find((record) => record.number === 12),
    ).toMatchObject({
      appearances: 1,
      leadingPlayer: { player: "Substitute" },
    });
  });

  it("summarises every shirt number worn by one player", () => {
    const starts = [
      appearance("Kenny Irons", 4, 1991, "1991-08-17"),
      appearance("Kenny Irons", 4, 1991, "1991-08-24"),
      appearance("Starter", 8, 1991, "1991-08-31"),
    ];
    starts[2].substituted_by = "Kenny Irons";
    starts[2].substituted_by_shirt_number = 12;

    const rows = [
      { ...starts[0], appearance_type: "Start" as const },
      { ...starts[1], appearance_type: "Start" as const },
      { ...starts[2], appearance_type: "Sub" as const },
    ];

    expect(buildPlayerShirtNumberHistory(rows, "Kenny Irons")).toEqual([
      { number: 4, appearances: 2, starts: 2, substituteAppearances: 0 },
      { number: 12, appearances: 1, starts: 0, substituteAppearances: 1 },
    ]);
  });
});
