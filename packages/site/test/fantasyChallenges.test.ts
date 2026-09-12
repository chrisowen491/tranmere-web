import { describe, expect, it } from "vitest";
import {
  buildFantasyChallengeStandings,
  scoreChallengeTeam,
  type FantasyChallengeLeagueRecord,
} from "@/lib/fantasyChallenges";

describe("fantasy challenge scoring", () => {
  it("uses the fantasy ranking rules and doubles the captain", () => {
    const result = scoreChallengeTeam(
      {
        id: "team-1",
        name: "Archive XI",
        captainPlayerId: "player-1",
        assignments: [
          {
            slotId: "d1",
            position: "CB",
            playerId: "player-1",
            playerName: "Test Defender",
          },
        ],
      },
      [
        {
          id: "game-1",
          season: 1970,
          matchDate: "1970-08-01",
          opposition: "Example Town",
          homeTeam: "Tranmere Rovers",
          awayTeam: "Example Town",
          score: "1-0",
          competition: "League",
        },
      ],
      new Map([["player-1", "Central Defender"]]),
      [
        {
          season: 1970,
          match_date: "1970-08-01",
          player_name: "Test Defender",
          yellow_card: 1,
          red_card: 0,
          substitute_yellow_card: 0,
          substitute_red_card: 0,
          substitute_time: null,
          substituted_by: null,
          substitute_substituted_by: null,
        },
      ],
      [
        {
          season: 1970,
          match_date: "1970-08-01",
          scorer: "Test Defender",
          assist: null,
        },
      ],
      [],
    );

    // Appearance 2 + defender goal 6 - booking 1 + clean sheet 4 = 11, doubled.
    expect(result.total).toBe(22);
    expect(result.players[0].matchPoints).toEqual([22]);
  });
});

describe("fantasy challenge league", () => {
  const result = (name: string, total: number) => ({
    name,
    total,
    players: [],
  });

  it("awards three points for a win and one for a draw", () => {
    const records: FantasyChallengeLeagueRecord[] = [
      {
        id: "challenge-2",
        challengerTeamId: "team-b",
        opponentTeamId: "team-c",
        challenger: result("Team B", 24),
        opponent: result("Team C", 24),
        createdAt: "2026-09-12T12:00:00.000Z",
      },
      {
        id: "challenge-1",
        challengerTeamId: "team-a",
        opponentTeamId: "team-b",
        challenger: result("Team A", 30),
        opponent: result("Team B", 20),
        createdAt: "2026-09-11T12:00:00.000Z",
      },
    ];

    const standings = buildFantasyChallengeStandings(
      records,
      new Map([["team-a", "public-a"]]),
    );

    expect(standings.map((team) => team.name)).toEqual([
      "Team A",
      "Team C",
      "Team B",
    ]);
    expect(standings[0]).toMatchObject({
      played: 1,
      won: 1,
      leaguePoints: 3,
      scoreDifference: 10,
      shareId: "public-a",
    });
    expect(standings[2]).toMatchObject({
      played: 2,
      drawn: 1,
      lost: 1,
      leaguePoints: 1,
      scoreDifference: -10,
    });
  });
});
