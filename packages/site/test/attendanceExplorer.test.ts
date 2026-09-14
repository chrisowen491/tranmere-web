import { describe, expect, it } from "vitest";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { buildAttendanceExplorer } from "@/lib/attendanceExplorer";

function match(
  season: number,
  attendance: number | null,
  location: "H" | "A" | "N",
  opposition: string,
  competition = "League",
): Match {
  return {
    date: `${season}-09-01`,
    season: String(season),
    competition,
    opposition,
    location,
    attendance,
    hgoal: 1,
    vgoal: 0,
    tier: 4,
  };
}

describe("attendance explorer", () => {
  const matches = [
    match(2000, 5_000, "H", "Oldham Athletic"),
    match(2000, 7_000, "A", "Oldham Athletic"),
    match(2001, 9_000, "H", "Oldham Athletic"),
    match(2001, null, "H", "Wigan Athletic", "FA Cup"),
  ];

  it("calculates totals, averages, medians and coverage", () => {
    const result = buildAttendanceExplorer(matches);

    expect(result.summary).toEqual({
      matches: 4,
      recorded: 3,
      coverage: 75,
      total: 21_000,
      average: 7_000,
      median: 7_000,
    });
    expect(result.bySeason[0]).toMatchObject({
      label: "2000",
      matches: 2,
      recorded: 2,
      average: 6_000,
    });
    expect(result.byOpposition[0]).toMatchObject({
      label: "Oldham Athletic",
      recorded: 3,
      average: 7_000,
    });
  });

  it("filters by season, competition and venue", () => {
    const result = buildAttendanceExplorer(matches, {
      seasonFrom: 2001,
      seasonTo: 2001,
      venue: "H",
      competition: "League",
    });

    expect(result.summary.matches).toBe(1);
    expect(result.summary.average).toBe(9_000);
    expect(result.records[0].opposition).toBe("Oldham Athletic");
  });
});
