import { describe, expect, it } from "vitest";
import type { FantasyRankingRow } from "@tranmere-web/lib/src/d1-types";
import { getFantasyPlayerOfSeasonWinners } from "@/lib/fantasyRankings";

function ranking(player_name: string, total_points: number) {
  return { player_name, total_points } as FantasyRankingRow;
}

describe("TranmereWeb Player of the Season", () => {
  it("returns the highest-ranked player", () => {
    expect(
      getFantasyPlayerOfSeasonWinners([
        ranking("Top Player", 100),
        ranking("Runner Up", 90),
      ]),
    ).toEqual([ranking("Top Player", 100)]);
  });

  it("recognises joint winners on equal points", () => {
    expect(
      getFantasyPlayerOfSeasonWinners([
        ranking("Joint Winner One", 100),
        ranking("Joint Winner Two", 100),
        ranking("Third Place", 90),
      ]).map((player) => player.player_name),
    ).toEqual(["Joint Winner One", "Joint Winner Two"]);
  });

  it("returns no award when the season has no rankings", () => {
    expect(getFantasyPlayerOfSeasonWinners([])).toEqual([]);
  });
});
