import { describe, expect, it, vi } from "vitest";
import {
  queryGoalAtlasRows,
  queryGoalAtlasSummary,
} from "@tranmere-web/lib/src/d1-queries";

function databaseReturning(rows: unknown[] = []) {
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
    db: { prepare } as unknown as D1Database,
    prepare,
    boundValues,
  };
}

describe("Goals Atlas queries", () => {
  it("combines filters and paginates without returning the whole Goals table", async () => {
    const mock = databaseReturning();

    await queryGoalAtlasRows(mock.db, {
      season: 2024,
      competition: "FA Cup",
      scorer: "Test Scorer",
      opposition: "Test United",
      goalType: "Header",
      foot: "Head",
      assistType: "Cross",
      crossSide: "Left",
      distance: "6YardBox",
      period: "first-half",
      minuteFrom: 10,
      minuteTo: 30,
      limit: 51,
      offset: 50,
    });

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(sql).toContain("LEFT JOIN Games");
    expect(sql).toContain("Goals.season = ?");
    expect(sql).toContain("Goals.goal_type = ?");
    expect(sql).toContain("BETWEEN 1 AND 45");
    expect(sql).toContain("LIMIT ? OFFSET ?");
    expect(mock.boundValues).toEqual([
      [
        2024,
        "FA Cup",
        "Test Scorer",
        "Test United",
        "Header",
        "Head",
        "Cross",
        "Left",
        "6YardBox",
        10,
        30,
        51,
        50,
      ],
    ]);
  });

  it("reports metadata completeness for the filtered selection", async () => {
    const mock = databaseReturning([
      {
        total: 4,
        minute_complete: 3,
        goal_type_complete: 2,
        foot_complete: 1,
        assist_type_complete: 1,
        distance_complete: 2,
        cross_side_complete: 1,
      },
    ]);

    const summary = await queryGoalAtlasSummary(mock.db, {
      scorer: "Test Scorer",
    });

    expect(String(mock.prepare.mock.calls[0][0])).toContain(
      "COUNT(NULLIF(TRIM(Goals.minute), ''))",
    );
    expect(mock.boundValues).toEqual([["Test Scorer"]]);
    expect(summary?.minute_complete).toBe(3);
  });
});
