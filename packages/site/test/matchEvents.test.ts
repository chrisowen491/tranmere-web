import { describe, expect, it, vi } from "vitest";
import { queryMatchEventRows } from "@tranmere-web/lib/src/d1-queries";

function databaseReturning(rows: unknown[] = []) {
  const boundValues: unknown[][] = [];
  const statement = {
    bind: vi.fn((...values: unknown[]) => {
      boundValues.push(values);
      return statement;
    }),
    all: vi.fn(async () => ({ results: rows })),
  };
  const prepare = vi.fn<(sql: string) => typeof statement>(() => statement);
  return {
    db: { prepare } as unknown as D1Database,
    prepare,
    boundValues,
  };
}

describe("match event queries", () => {
  it("filters events by season, match, player and extensible type", async () => {
    const mock = databaseReturning();

    await queryMatchEventRows(mock.db, {
      season: 2025,
      matchDate: "2025-08-02",
      playerName: "Test Player",
      eventType: "FutureEvent",
      limit: 50,
    });

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(sql).toContain("FROM MatchEvents");
    expect(sql).toContain("player_name = ? COLLATE NOCASE");
    expect(sql).toContain("event_type = ?");
    expect(sql).toContain("LIMIT ?");
    expect(mock.boundValues).toEqual([
      [2025, "2025-08-02", "Test Player", "FutureEvent", 50],
    ]);
  });
});
