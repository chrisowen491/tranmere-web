import { describe, expect, it, vi } from "vitest";
import { queryFantasyRankingRows } from "@tranmere-web/lib/src/d1-queries";

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

describe("fantasy ranking query", () => {
  it("scores the selected season and expands both levels of substitute", async () => {
    const mock = databaseReturning();

    await queryFantasyRankingRows(mock.db, { season: 1994 });

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(mock.boundValues).toEqual([[1994, 1994]]);
    expect(sql).toContain("TRIM(substituted_by)");
    expect(sql).toContain("TRIM(substitute_substituted_by)");
    expect(sql).toContain("ELSE 60");
    expect(sql).toContain("Players.position = 'Goalkeeper' THEN 10");
    expect(sql).toContain("AS team_clean_sheet");
    expect(sql).toContain("AS clean_sheet_points");
    expect(sql).toContain("card_points + clean_sheet_points");
    expect(sql).toContain("COALESCE(assist_totals.assists, 0) * 3");
    expect(sql).toContain("COALESCE(appearance_totals.red_cards, 0) * 3");
  });

  it("excludes friendlies and own-goal placeholders from all-time rankings", async () => {
    const mock = databaseReturning();

    await queryFantasyRankingRows(mock.db);

    const sql = String(mock.prepare.mock.calls[0][0]);
    expect(mock.boundValues).toEqual([]);
    expect(sql).toContain(
      "LOWER(TRIM(COALESCE(Apps.competition, ''))) <> 'friendly'",
    );
    expect(sql).toContain(
      "LOWER(TRIM(COALESCE(Goals.competition, ''))) <> 'friendly'",
    );
    expect(sql).toContain("LOWER(TRIM(scorer)) <> 'own goal'");
  });
});
