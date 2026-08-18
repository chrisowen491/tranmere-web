import { describe, expect, it, vi } from "vitest";
import {
  queryArchiveCompletenessGaps,
  queryArchiveCompletenessRows,
} from "@tranmere-web/lib/src/d1-queries";
import type { ArchiveCompletenessRow } from "@tranmere-web/lib/src/d1-types";

function databaseReturning<T>(rows: T[]) {
  const statement = {
    bind: vi.fn(() => statement),
    all: vi.fn(async () => ({ results: rows })),
  };
  const prepare = vi.fn<(sql: string) => typeof statement>(() => statement);
  return {
    db: { prepare } as unknown as D1Database,
    prepare,
    statement,
  };
}

describe("archive completeness queries", () => {
  it("returns the precomputed aggregate snapshot for a season", async () => {
    const rows: ArchiveCompletenessRow[] = [
      {
        season: 2025,
        category: "lineups",
        complete_count: 45,
        total_count: 50,
        updated_at: "2026-08-18 23:00:00",
      },
    ];
    const { db, prepare, statement } = databaseReturning(rows);

    await expect(queryArchiveCompletenessRows(db, 2025)).resolves.toEqual(rows);
    expect(prepare).toHaveBeenCalledWith(
      expect.stringContaining("FROM ArchiveCompleteness"),
    );
    expect(statement.bind).toHaveBeenCalledWith(2025);
  });

  it("finds missing player biographies without exposing correction records", async () => {
    const { db, prepare, statement } = databaseReturning([
      {
        entity_id: "Missing Player",
        entity_name: "Missing Player",
        match_date: null,
        opposition: null,
      },
    ]);

    const gaps = await queryArchiveCompletenessGaps(
      db,
      1962,
      "player-profiles",
      25,
    );

    expect(gaps).toHaveLength(1);
    expect(prepare).toHaveBeenCalledWith(
      expect.stringContaining("LEFT JOIN Players"),
    );
    expect(prepare.mock.calls[0]?.[0]).not.toContain("Correction");
    expect(statement.bind).toHaveBeenCalledWith(1962, 1962, 25);
  });

  it("uses canonical game links as the source for missing match data", async () => {
    const { db, prepare, statement } = databaseReturning([]);

    await queryArchiveCompletenessGaps(db, 1990, "attendances", 50);

    expect(prepare).toHaveBeenCalledWith(
      expect.stringContaining("Games.attendance"),
    );
    expect(statement.bind).toHaveBeenCalledWith(1990, 50);
  });
});
