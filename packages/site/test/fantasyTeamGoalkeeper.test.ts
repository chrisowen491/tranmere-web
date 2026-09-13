import { describe, expect, it } from "vitest";
import {
  hasValidFantasyGoalkeeper,
  type FantasyAssignment,
} from "@/lib/fantasyTeams";

const assignment = (playerId: string): FantasyAssignment => ({
  slotId: "g1",
  position: "GK",
  playerId,
  playerName: "Archive player",
});

describe("fantasy XI goalkeeper selection", () => {
  it("accepts a recorded goalkeeper", () => {
    expect(
      hasValidFantasyGoalkeeper(
        [assignment("goalkeeper")],
        new Map([["goalkeeper", "Goalkeeper"]]),
      ),
    ).toBe(true);
  });

  it("rejects an outfield player in goal", () => {
    expect(
      hasValidFantasyGoalkeeper(
        [assignment("striker")],
        new Map([["striker", "Forward"]]),
      ),
    ).toBe(false);
  });
});
