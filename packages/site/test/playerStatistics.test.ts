import { describe, expect, it, vi } from "vitest";
import type { PlayerRow } from "@tranmere-web/lib/src/d1-types";
import type { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import {
  defaultPlayerAvatar,
  enrichPlayerStatistics,
  getPlayerStatistics,
} from "@/lib/playerStatistics";

function statistics(
  player: string,
  overrides: Partial<PlayerSeasonSummary> = {},
): PlayerSeasonSummary {
  return {
    Season: "2024",
    Player: player,
    Apps: 10,
    goals: 2,
    assists: 1,
    yellow: 0,
    red: 0,
    penalties: 0,
    headers: 0,
    starts: 8,
    subs: 2,
    freekicks: 0,
    goalsPerGame: 0.2,
    ...overrides,
  };
}

function playerRow(overrides: Partial<PlayerRow> = {}): PlayerRow {
  return {
    id: "player-1",
    name: "Known Player",
    date_of_birth: null,
    biography_markdown: null,
    pic_link: "/known-avatar.svg",
    foot: null,
    height: null,
    place_of_birth: null,
    position: "Central Midfielder",
    secondary_position: "Winger",
    links_json: "[]",
    ...overrides,
  };
}

function playerDatabase(rows: PlayerRow[]) {
  const statement = {
    bind: vi.fn(() => statement),
    all: vi.fn(async () => ({ results: rows })),
  };
  return {
    prepare: vi.fn(() => statement),
  } as unknown as D1Database;
}

describe("player statistics enrichment", () => {
  it("adds D1 avatars and primary and secondary positions", async () => {
    const enriched = await enrichPlayerStatistics(
      playerDatabase([playerRow()]),
      [statistics("Known Player")],
    );

    expect(enriched[0].profile).toEqual({
      picLink: "/known-avatar.svg",
      position: "Central Midfielder",
      secondaryPosition: "Winger",
    });
    expect(enriched[0]).not.toHaveProperty("bio");
  });

  it("uses the default avatar when no D1 profile exists", async () => {
    const enriched = await enrichPlayerStatistics(playerDatabase([]), [
      statistics("Unknown Player"),
    ]);

    expect(enriched[0].profile).toEqual({
      picLink: defaultPlayerAvatar,
      position: null,
      secondaryPosition: null,
    });
  });

  it("filters and sorts API statistics using D1 primary and secondary positions", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          players: [
            statistics("Midfielder", { goals: 8 }),
            statistics("Striker", { goals: 5 }),
          ],
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    try {
      const players = await getPlayerStatistics(
        playerDatabase([
          playerRow({
            id: "midfielder",
            name: "Midfielder",
            position: "Central Midfielder",
          }),
          playerRow({
            id: "striker",
            name: "Striker",
            position: "Central Midfielder",
            secondary_position: "Striker",
          }),
        ]),
        "https://api.example.test",
        { filter: "STR", sort: "Goals" },
      );

      expect(players.map((player) => player.Player)).toEqual(["Striker"]);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining("filter="),
        expect.objectContaining({ next: { revalidate: 7200 } }),
      );
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("recognises a single appearance when the API returns Apps as a string", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          players: [
            statistics("One Appearance", {
              Apps: "1" as unknown as number,
              starts: 1,
              subs: 0,
            }),
            statistics("Two Appearances", { Apps: 2 }),
          ],
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    try {
      const players = await getPlayerStatistics(
        playerDatabase([]),
        "https://api.example.test",
        { filter: "OnlyOneApp" },
      );

      expect(players.map((player) => player.Player)).toEqual([
        "One Appearance",
      ]);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
