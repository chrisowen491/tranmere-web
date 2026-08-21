import { describe, expect, it } from "vitest";
import {
  countsTowardsStatistics,
  statisticalMatches,
} from "@tranmere-web/lib/src/competition-constants";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { getHeadToHead } from "@/lib/games";
import { calculateManagerStats } from "@/lib/managerComparisonData";

function match(overrides: Partial<Match>): Match {
  return {
    date: "1991-08-17",
    competition: "League",
    home: "Tranmere Rovers",
    visitor: "Brighton & Hove Albion",
    opposition: "Brighton & Hove Albion",
    venue: "Prenton Park",
    season: "1991",
    hgoal: 0,
    vgoal: 2,
    ft: "0-2",
    tier: 2,
    location: "H",
    ...overrides,
  };
}

const friendlies1991 = [
  match({
    date: "1991-08-03",
    competition: "Friendly",
    visitor: "Oldham Athletic",
    opposition: "Oldham Athletic",
    hgoal: 0,
    vgoal: 1,
    ft: "0-1",
    tier: 0,
  }),
  match({
    date: "1991-08-06",
    competition: "Friendly",
    visitor: "Everton",
    opposition: "Everton",
    hgoal: 1,
    vgoal: 3,
    ft: "1-3",
    tier: 0,
  }),
  match({
    date: "1991-08-09",
    competition: "Friendly",
    home: "Altrincham",
    visitor: "Tranmere Rovers",
    opposition: "Altrincham",
    venue: "Moss Lane",
    hgoal: 0,
    vgoal: 3,
    ft: "0-3",
    tier: 0,
    location: "A",
  }),
  match({
    date: "1991-08-12",
    competition: "Friendly",
    visitor: "Liverpool",
    opposition: "Liverpool",
    hgoal: 1,
    vgoal: 0,
    ft: "1-0",
    tier: 0,
  }),
];

describe("statistical match exclusions", () => {
  it("recognises Friendly case-insensitively without rejecting missing data", () => {
    expect(countsTowardsStatistics("Friendly")).toBe(false);
    expect(countsTowardsStatistics(" friendly ")).toBe(false);
    expect(countsTowardsStatistics("League")).toBe(true);
    expect(countsTowardsStatistics(undefined)).toBe(true);
  });

  it("keeps the 1991 friendlies in the archive input but out of the record", () => {
    const competitiveMatch = match({});
    const archiveMatches = [...friendlies1991, competitiveMatch];
    const record = getHeadToHead(archiveMatches);

    expect(archiveMatches).toHaveLength(5);
    expect(statisticalMatches(archiveMatches)).toEqual([competitiveMatch]);
    expect(record.h2htotal).toEqual([
      {
        venue: "Total",
        pld: 1,
        wins: 0,
        draws: 0,
        lost: 1,
        for: 0,
        against: 2,
        diff: -2,
      },
    ]);
  });

  it("does not include the 1991 friendlies in manager statistics", () => {
    const stats = calculateManagerStats([...friendlies1991, match({})]);

    expect(stats).toMatchObject({
      played: 1,
      won: 0,
      drawn: 0,
      lost: 1,
      goalsFor: 0,
      goalsAgainst: 2,
      pointsPerGame: 0,
    });
  });
});
