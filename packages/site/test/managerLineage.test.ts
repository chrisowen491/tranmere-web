import { describe, expect, it } from "vitest";
import type { ManagerRecord } from "@/lib/managers";
import {
  deriveManagerLineage,
  managerForDate,
  managerTenureLabels,
} from "@/lib/managerLineage";

const managers: ManagerRecord[] = [
  {
    id: "first",
    name: "First Manager",
    dateJoined: "2000-01-01",
    dateLeft: "2001-06-30",
  },
  {
    id: "caretaker",
    name: "Second Manager (Caretaker)",
    dateJoined: "2001-06-20",
    dateLeft: "2001-07-10",
  },
  {
    id: "current",
    name: "Current Manager",
    dateJoined: "2001-07-11",
    dateLeft: "Now",
    favouriteFormation: "4-4-2",
  },
];

describe("manager lineage tenure handling", () => {
  it("attributes overlapping dates to the most recent appointment", () => {
    expect(managerForDate(managers, "2001-06-25", "2002-01-01")?.id).toBe(
      "caretaker",
    );
  });

  it("labels caretaker appointments", () => {
    expect(managerTenureLabels(managers[1])).toEqual(["Caretaker"]);
  });
});

describe("manager lineage derivation", () => {
  it("derives inherited players, formations and a landmark win", () => {
    const lineage = deriveManagerLineage(
      managers,
      [
        {
          manager_id: "current",
          id: "game-1",
          season: 2001,
          match_date: "2001-08-01",
          opposition: "Example FC",
          home_team: "Tranmere Rovers",
          away_team: "Example FC",
          full_time_score: "4-0",
          home_goals: "4",
          away_goals: "0",
          formation: "4-4-2",
        },
      ],
      [
        {
          manager_id: "caretaker",
          player_name: "Shared Player",
          selections: 2,
        },
        { manager_id: "current", player_name: "Shared Player", selections: 8 },
        { manager_id: "current", player_name: "New Player", selections: 4 },
      ],
      [],
      "2002-01-01",
    );
    const current = lineage.find((entry) => entry.manager.id === "current");

    expect(current?.previous?.id).toBe("caretaker");
    expect(current?.inheritedPlayers).toEqual([
      { name: "Shared Player", selections: 8 },
    ]);
    expect(current?.commonFormations).toEqual([
      { formation: "4-4-2", games: 1 },
    ]);
    expect(current?.keyResult).toMatchObject({
      opposition: "Example FC",
      margin: 4,
    });
  });
});
