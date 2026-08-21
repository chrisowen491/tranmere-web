import { describe, expect, it, vi } from 'vitest';
import { rebuildPlayerSeasonSummaries } from '../src/updatePlayerSeasonSummaries';

describe('rebuildPlayerSeasonSummaries', () => {
  it('classifies specialist goals using the canonical goal types', async () => {
    const statements: Array<{ sql: string; values: unknown[] }> = [];
    const db = {
      prepare: vi.fn((sql: string) => {
        const statement = { sql, values: [] as unknown[] };
        statements.push(statement);
        return {
          bind: (...values: unknown[]) => {
            statement.values = values;
            return statement;
          }
        };
      }),
      batch: vi.fn().mockResolvedValue([])
    } as unknown as D1Database;

    const countStatement = {
      first: vi.fn().mockResolvedValue({ count: 42 })
    };
    (db.prepare as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (sql: string) => ({ sql })
    );

    // Restore a complete statement implementation after the delete statement.
    (db.prepare as ReturnType<typeof vi.fn>).mockImplementation(
      (sql: string) => {
        if (sql.includes('SELECT COUNT(*)')) return countStatement;
        const statement = { sql, values: [] as unknown[] };
        statements.push(statement);
        return {
          bind: (...values: unknown[]) => {
            statement.values = values;
            return statement;
          }
        };
      }
    );

    const count = await rebuildPlayerSeasonSummaries(db);
    const contribution = statements.find(({ sql }) =>
      sql.includes('WITH contributions')
    );

    expect(contribution?.values).toEqual(['FreeKick', 'Penalty', 'Header']);
    expect(contribution?.sql).toContain('CASE WHEN goal_type = ?');
    expect(contribution?.sql).toContain(
      "LOWER(TRIM(COALESCE(Apps.competition, ''))) <> 'friendly'"
    );
    expect(contribution?.sql).toContain(
      "LOWER(TRIM(COALESCE(Goals.competition, ''))) <> 'friendly'"
    );
    expect(
      contribution?.sql.match(/FROM Games statistical_game/g)
    ).toHaveLength(4);
    expect(count).toBe(42);
  });
});
