import type { AttendedMatchRow } from "@tranmere-web/lib/src/d1-types";
import { describe, expect, it } from "vitest";
import { attendanceResult } from "@/lib/matchAttendance";

function match(
  homeTeam: string,
  awayTeam: string,
  score: string,
): AttendedMatchRow {
  return {
    auth_sub: "auth0|supporter",
    game_id: "game-1",
    created_at: "2026-08-18T12:00:00.000Z",
    season: 2026,
    match_date: "2026-08-18",
    competition: "League Two",
    home_team: homeTeam,
    away_team: awayTeam,
    opposition: homeTeam === "Tranmere Rovers" ? awayTeam : homeTeam,
    venue: "Prenton Park",
    full_time_score: score,
    neutral: null,
  };
}

describe("attendanceResult", () => {
  it("interprets home wins from Tranmere's perspective", () => {
    expect(attendanceResult(match("Tranmere Rovers", "Chester", "2-0"))).toBe(
      "W",
    );
  });

  it("interprets away wins from Tranmere's perspective", () => {
    expect(attendanceResult(match("Chester", "Tranmere Rovers", "0-1"))).toBe(
      "W",
    );
  });

  it("returns draws and losses", () => {
    expect(attendanceResult(match("Tranmere Rovers", "Chester", "1-1"))).toBe(
      "D",
    );
    expect(attendanceResult(match("Chester", "Tranmere Rovers", "3-1"))).toBe(
      "L",
    );
  });
});
