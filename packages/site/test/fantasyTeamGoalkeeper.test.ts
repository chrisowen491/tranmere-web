import { describe, expect, it } from "vitest";
import {
  hasValidFantasyDefenders,
  hasValidFantasyGoalkeeper,
  hasValidFantasyMidfielders,
  hasValidFantasyStrikers,
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

  it("accepts goalkeeper as a secondary position", () => {
    expect(
      hasValidFantasyGoalkeeper(
        [assignment("utility-player")],
        new Map([["utility-player", "Full Back"]]),
        new Map([["utility-player", "Goalkeeper"]]),
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

const strikerAssignment = (
  slotId: string,
  playerId: string,
): FantasyAssignment => ({
  slotId,
  position: "ST",
  playerId,
  playerName: "Archive player",
});

describe("fantasy XI striker selection", () => {
  it.each(["Striker", "Inside Forward", "Outside Left", "Outside Right"])(
    "accepts a recorded %s",
    (position) => {
      expect(
        hasValidFantasyStrikers(
          [strikerAssignment("f1", "forward")],
          new Map([["forward", position]]),
        ),
      ).toBe(true);
    },
  );

  it("rejects an ineligible player in a striker slot", () => {
    expect(
      hasValidFantasyStrikers(
        [strikerAssignment("f1", "midfielder")],
        new Map([["midfielder", "Central Midfielder"]]),
      ),
    ).toBe(false);
  });

  it("accepts an eligible secondary striker position", () => {
    expect(
      hasValidFantasyStrikers(
        [strikerAssignment("f1", "forward")],
        new Map([["forward", "Winger"]]),
        new Map([["forward", "Inside Forward"]]),
      ),
    ).toBe(true);
  });

  it("requires every striker slot to contain an eligible forward", () => {
    expect(
      hasValidFantasyStrikers(
        [
          strikerAssignment("f1", "striker"),
          strikerAssignment("f2", "defender"),
        ],
        new Map([
          ["striker", "Striker"],
          ["defender", "Central Defender"],
        ]),
      ),
    ).toBe(false);
  });
});

const positionalAssignment = (
  slotId: string,
  position: string,
  playerId: string,
): FantasyAssignment => ({
  slotId,
  position,
  playerId,
  playerName: "Archive player",
});

describe("fantasy XI midfield selection", () => {
  it.each([
    "Winger",
    "Left Midfield",
    "Right Midfield",
    "Central Midfielder",
    "Attacking Midfield",
    "Defensive Midfield",
    "Wing Half",
  ])("accepts a recorded %s in any midfield slot", (position) => {
    expect(
      hasValidFantasyMidfielders(
        [positionalAssignment("m1", "CM", "midfielder")],
        new Map([["midfielder", position]]),
      ),
    ).toBe(true);
  });

  it("rejects an ineligible player in a midfield slot", () => {
    expect(
      hasValidFantasyMidfielders(
        [positionalAssignment("m1", "LM", "defender")],
        new Map([["defender", "Central Defender"]]),
      ),
    ).toBe(false);
  });

  it("accepts an eligible secondary midfield position", () => {
    expect(
      hasValidFantasyMidfielders(
        [positionalAssignment("m1", "RM", "utility-player")],
        new Map([["utility-player", "Full Back"]]),
        new Map([["utility-player", "Right Midfield"]]),
      ),
    ).toBe(true);
  });
});

describe("fantasy XI defensive selection", () => {
  it.each([
    "Central Defender",
    "Sweeper",
    "Full Back",
    "Left Back",
    "Right Back",
  ])("accepts a recorded %s in any defensive slot", (position) => {
    expect(
      hasValidFantasyDefenders(
        [positionalAssignment("d1", "CB", "defender")],
        new Map([["defender", position]]),
      ),
    ).toBe(true);
  });

  it("rejects an ineligible player in a defensive slot", () => {
    expect(
      hasValidFantasyDefenders(
        [positionalAssignment("d1", "RB", "midfielder")],
        new Map([["midfielder", "Central Midfielder"]]),
      ),
    ).toBe(false);
  });

  it("accepts an eligible secondary defensive position", () => {
    expect(
      hasValidFantasyDefenders(
        [positionalAssignment("d1", "LB", "utility-player")],
        new Map([["utility-player", "Left Midfield"]]),
        new Map([["utility-player", "Full Back"]]),
      ),
    ).toBe(true);
  });
});
