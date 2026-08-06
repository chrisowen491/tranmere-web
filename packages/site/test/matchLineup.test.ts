import { describe, expect, it } from "vitest";
import { arrangeLineup, formationLabel } from "@/lib/matchLineup";

interface TestPlayer {
  name: string;
  position: string | null;
  secondaryPosition?: string | null;
}

const player = (
  name: string,
  position: string | null,
  secondaryPosition: string | null = null,
): TestPlayer => ({ name, position, secondaryPosition });

const positions = (candidate: TestPlayer) => candidate;

describe("formation and lineup assignment", () => {
  it("places natural positions into the correct 4-4-2 rows", () => {
    const lineup = arrangeLineup(
      [
        player("Centre back two", "Central Defender"),
        player("Striker one", "Striker"),
        player("Right winger", "Winger"),
        player("Goalkeeper", "Goalkeeper"),
        player("Full back one", "Full Back"),
        player("Midfielder one", "Central Midfielder"),
        player("Striker two", "Striker"),
        player("Full back two", "Full Back"),
        player("Left winger", "Winger"),
        player("Centre back one", "Central Defender"),
        player("Midfielder two", "Central Midfielder"),
      ],
      "4-4-2",
      positions,
    );

    expect(lineup.formation).toBe("4-4-2");
    expect(lineup.rows.map((row) => row.length)).toEqual([2, 4, 4, 1]);
    expect(lineup.rows[0].every((item) => item.position === "Striker")).toBe(
      true,
    );
    expect(lineup.rows[2].map((item) => item.position)).toEqual([
      "Full Back",
      "Central Defender",
      "Central Defender",
      "Full Back",
    ]);
    expect(lineup.rows[3][0].name).toBe("Goalkeeper");
  });

  it("uses a secondary position before an unrelated fallback", () => {
    const lineup = arrangeLineup(
      [
        player("First midfielder", "Central Midfielder"),
        player("Second midfielder", "Central Midfielder"),
        player("Emergency keeper", "Central Midfielder", "Goalkeeper"),
        player("Unknown player", null),
      ],
      "442",
      positions,
    );

    expect(lineup.rows.at(-1)?.[0].name).toBe("Emergency keeper");
  });

  it("honours the requested formation and defaults to 4-4-2", () => {
    const players = [
      player("Keeper", "Goalkeeper"),
      player("Defender one", "Full Back"),
      player("Defender two", "Central Defender"),
      player("Defender three", "Central Defender"),
      player("Defender four", "Full Back"),
      player("Midfielder one", "Central Midfielder"),
      player("Midfielder two", "Central Midfielder"),
      player("Midfielder three", "Central Midfielder"),
      player("Forward one", "Winger"),
      player("Forward two", "Striker"),
      player("Forward three", "Winger"),
    ];

    expect(
      arrangeLineup(players, "4-3-3", positions).rows.map((row) => row.length),
    ).toEqual([3, 3, 4, 1]);
    expect(arrangeLineup(players, undefined, positions).formation).toBe("442");
    expect(formationLabel("5-3-2")).toBe("5-3-2");
  });
});
