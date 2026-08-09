import { describe, expect, it, vi } from "vitest";
import type {
  PlayerRow,
  PlayerSeasonSummaryRow,
} from "@tranmere-web/lib/src/d1-types";
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

function summaryRow(
  player: string,
  overrides: Partial<PlayerSeasonSummaryRow> = {},
): PlayerSeasonSummaryRow {
  return {
    season: "TOTAL",
    player_name: player,
    appearances: 10,
    starts: 8,
    substitute_appearances: 2,
    goals: 2,
    assists: 1,
    yellow_cards: 0,
    red_cards: 0,
    free_kicks: 0,
    penalties: 0,
    headers: 0,
    ...overrides,
  };
}

function playerDatabase(
  playerRows: PlayerRow[],
  summaryRows: PlayerSeasonSummaryRow[] = [],
) {
  return {
    prepare: vi.fn((sql: string) => {
      const rows = sql.includes("FROM PlayerSeasonSummaries")
        ? summaryRows
        : playerRows;
      const statement = {
        bind: vi.fn(() => statement),
        all: vi.fn(async () => ({ results: rows })),
      };
      return statement;
    }),
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

  it("filters and sorts D1 statistics using primary and secondary positions", async () => {
    const players = await getPlayerStatistics(
      playerDatabase(
        [
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
        ],
        [
          summaryRow("Midfielder", { goals: 8 }),
          summaryRow("Striker", { goals: 5 }),
        ],
      ),
      { filter: "STR", sort: "Goals" },
    );

    expect(players.map((player) => player.Player)).toEqual(["Striker"]);
  });

  it("recognises a single appearance from D1 career totals", async () => {
    const players = await getPlayerStatistics(
      playerDatabase(
        [],
        [
          summaryRow("One Appearance", {
            appearances: 1,
            starts: 1,
            substitute_appearances: 0,
          }),
          summaryRow("Two Appearances", { appearances: 2 }),
        ],
      ),
      { filter: "OnlyOneApp" },
    );

    expect(players.map((player) => player.Player)).toEqual(["One Appearance"]);
  });
});
