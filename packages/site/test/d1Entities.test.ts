import { describe, expect, it, vi } from "vitest";
import {
  countPlayerRows,
  queryGameDateRangeBounds,
  queryGameRows,
  queryPlayerMilestoneRows,
  queryPlayerRows,
  queryTransferRows,
} from "@tranmere-web/lib/src/d1-queries";
import type {
  ClubRow,
  ManagerRow,
  PlayerRow,
  ProgrammeRow,
  TransferRow,
} from "@tranmere-web/lib/src/d1-types";
import { mapClub } from "@/lib/clubs";
import { mapManager } from "@/lib/managers";
import { getPlayersByNames, mapPlayer } from "@/lib/players";
import { mapProgramme } from "@/lib/programmes";
import { mapTransfer } from "@/lib/transfers";

function playerRow(overrides: Partial<PlayerRow> = {}): PlayerRow {
  return {
    id: "player-1",
    name: "Test Player",
    date_of_birth: null,
    biography_markdown: null,
    pic_link: null,
    foot: null,
    height: null,
    place_of_birth: null,
    position: null,
    secondary_position: null,
    links_json: "[]",
    updated_at: null,
    ...overrides,
  };
}

function databaseReturning<T>(rows: T[]) {
  const boundValues: unknown[][] = [];
  const statement = {
    bind: vi.fn((...values: unknown[]) => {
      boundValues.push(values);
      return statement;
    }),
    all: vi.fn(async () => ({ results: rows })),
    first: vi.fn(async () => rows[0] ?? null),
  };
  const prepare = vi.fn<(sql: string) => typeof statement>(() => statement);

  return {
    boundValues,
    db: { prepare } as unknown as D1Database,
    prepare,
    statement,
  };
}

describe("D1 entity mapping", () => {
  it("maps player columns and safely parses links", () => {
    const player = mapPlayer(
      playerRow({
        date_of_birth: "1980-01-02",
        pic_link: "/builder/avatar",
        position: "Striker",
        secondary_position: "Winger",
        links_json: '["https://example.com",42]',
      }),
    );

    expect(player).toMatchObject({
      dateOfBirth: "1980-01-02",
      picLink: "/builder/avatar",
      position: "Striker",
      secondaryPosition: "Winger",
      links: ["https://example.com"],
    });
    expect(mapPlayer(playerRow({ links_json: "invalid" })).links).toEqual([]);
  });

  it("maps clubs, managers, programmes and transfers", () => {
    const clubRow: ClubRow = {
      id: "club-1",
      name: "Test FC",
      short_name: null,
      three_letter_name: "TST",
      nicknames: null,
      primary_colour: "#fff",
      secondary_colour: null,
      highest_division: 2,
      latitude: 53.4,
      longitude: -3.0,
    };
    const managerRow: ManagerRow = {
      id: "manager-1",
      name: "Test Manager",
      date_joined: "2020-01-01",
      date_left: "2021-01-01",
      image_path: "/manager.svg",
      favourite_formation: "4-3-3",
    };
    const programmeRow: ProgrammeRow = {
      url: "/pdfs/test.pdf",
      match_name: "Tranmere Rovers v Test FC",
      match_date: "2024-01-01",
      pages: 48,
    };
    const incoming: TransferRow = {
      id: "transfer-1",
      player_name: "Test Player",
      season: 2024,
      from_club: "Test FC",
      to_club: "Tranmere Rovers",
      fee_description: "Free",
      cost: 0,
      transfer_date: "2024-07-01",
    };

    expect(mapClub(clubRow)).toMatchObject({
      shortName: "",
      threeLetterName: "TST",
      highestDivision: 2,
    });
    expect(mapManager(managerRow)).toMatchObject({
      favouriteFormation: "4-3-3",
      imagePath: "/manager.svg",
    });
    expect(mapProgramme(programmeRow)).toEqual({
      url: "/pdfs/test.pdf",
      name: "Tranmere Rovers v Test FC",
      date: "2024-01-01",
      pages: 48,
    });
    expect(mapTransfer(incoming)).toMatchObject({
      type: "in",
      club: "Test FC",
      date: "2024-07-01",
    });
    expect(
      mapTransfer({
        ...incoming,
        from_club: "Tranmere Rovers",
        to_club: "Another FC",
      }),
    ).toMatchObject({ type: "out", club: "Another FC" });
  });
});

describe("D1 queries", () => {
  it("queries only requested player names and keeps the most complete duplicate", async () => {
    const sparse = playerRow({ id: "sparse", name: "Alex Test" });
    const complete = playerRow({
      id: "complete",
      name: "Alex Test",
      biography_markdown: "A complete biography",
      pic_link: "/avatar.svg",
      position: "Striker",
    });
    const mock = databaseReturning([sparse, complete]);

    const players = await getPlayersByNames(mock.db, [
      "Alex Test",
      "Other Player",
      "Alex Test",
    ]);

    expect(mock.prepare).toHaveBeenCalledTimes(1);
    expect(mock.prepare.mock.calls[0][0]).toContain("WHERE name IN (?, ?)");
    expect(mock.boundValues).toEqual([["Alex Test", "Other Player"]]);
    expect(players.get("Alex Test")?.id).toBe("complete");
  });

  it("builds parameterised transfer filters in a stable order", async () => {
    const mock = databaseReturning<TransferRow>([]);

    await queryTransferRows(mock.db, {
      player: "Test",
      playerMatch: "contains",
      club: "Example FC",
      season: 2024,
      direction: "In",
      limit: 10,
    });

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(sql).toContain("player_name LIKE ?");
    expect(sql).toContain("season = ?");
    expect(sql).toContain("to_club = ?");
    expect(sql).toContain("from_club = ?");
    expect(sql).toContain("LIMIT ?");
    expect(mock.boundValues).toEqual([
      ["%Test%", 2024, "Tranmere Rovers", "Example FC", 10],
    ]);
  });

  it("uses an exact indexed lookup for a canonical player name", async () => {
    const mock = databaseReturning<TransferRow>([]);

    await queryTransferRows(mock.db, {
      player: "Steve Mungall",
      playerMatch: "exact",
    });

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(sql).toContain("WHERE player_name = ?");
    expect(sql).not.toContain("player_name LIKE ?");
    expect(sql).toContain(
      "ORDER BY season DESC, transfer_date DESC, cost DESC, player_name ASC",
    );
    expect(mock.boundValues).toEqual([["Steve Mungall"]]);
  });

  it("paginates player queries and counts the complete filtered result set", async () => {
    const playerQuery = databaseReturning<PlayerRow>([playerRow()]);

    await queryPlayerRows(playerQuery.db, {
      query: "Alex",
      sort: "oldest-updated",
      limit: 30,
      offset: 30,
    });

    expect(playerQuery.prepare.mock.calls[0][0]).toContain("WHERE name LIKE ?");
    expect(playerQuery.prepare.mock.calls[0][0]).toContain("LIMIT ? OFFSET ?");
    expect(playerQuery.prepare.mock.calls[0][0]).toContain(
      "ORDER BY updated_at ASC, name ASC, id ASC",
    );
    expect(playerQuery.boundValues).toEqual([["%Alex%", 30, 30]]);

    const playerCount = databaseReturning([{ count: 1 }]);

    const count = await countPlayerRows(playerCount.db, { query: "Alex" });

    expect(count).toBe(1);
    expect(playerCount.prepare.mock.calls[0][0]).toContain(
      "SELECT COUNT(*) AS count",
    );
    expect(playerCount.boundValues).toEqual([["%Alex%"]]);
  });

  it("treats the penalty-shootout archive filter as any recorded shootout", async () => {
    const mock = databaseReturning([]);

    await queryGameRows(mock.db, { penalties: "Penalty Shootout" });

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(sql).toContain("penalties IS NOT NULL AND TRIM(penalties) <> ''");
    expect(mock.boundValues).toEqual([]);
  });

  it("finds the most recent earlier meeting with an opponent", async () => {
    const mock = databaseReturning([]);

    await queryGameRows(mock.db, {
      opposition: "Wrexham",
      dateTo: "2026-08-01",
      sort: "date-desc",
      limit: 2,
    });

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(sql).toContain("opposition = ?");
    expect(sql).toContain("match_date <= ?");
    expect(sql).toContain("ORDER BY match_date DESC");
    expect(mock.boundValues).toEqual([["Wrexham", "2026-08-01", 2]]);
  });

  it("loads only the first and last match dates for a managerial tenure", async () => {
    const mock = databaseReturning([
      {
        first_match_date: "2024-01-01",
        last_match_date: "2025-06-30",
      },
    ]);

    const bounds = await queryGameDateRangeBounds(
      mock.db,
      "2024-01-01",
      "2025-06-30",
    );

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(sql).toContain("MIN(match_date) AS first_match_date");
    expect(sql).toContain("MAX(match_date) AS last_match_date");
    expect(sql).toContain("match_date >= ?");
    expect(sql).toContain("match_date <= ?");
    expect(sql).not.toContain("home_team");
    expect(mock.boundValues).toEqual([["2024-01-01", "2025-06-30"]]);
    expect(bounds).toEqual({
      first_match_date: "2024-01-01",
      last_match_date: "2025-06-30",
    });
  });

  it("uses a compact match-date lookup for derived player milestones", async () => {
    const mock = databaseReturning([]);

    await queryPlayerMilestoneRows(mock.db, { matchDate: "2026-08-01" });

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(sql).toContain("FROM PlayerMilestones");
    expect(sql).toContain("match_date = ?");
    expect(sql).toContain(
      "ORDER BY match_date ASC, player_name ASC, milestone_type ASC",
    );
    expect(mock.boundValues).toEqual([["2026-08-01"]]);
  });
});
