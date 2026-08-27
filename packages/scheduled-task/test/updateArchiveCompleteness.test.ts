import { describe, expect, it, vi } from 'vitest';
import { rebuildArchiveCompleteness } from '../src/updateArchiveCompleteness';

describe('rebuildArchiveCompleteness', () => {
  it('replaces the aggregate snapshot and returns its row count', async () => {
    const statements: string[] = [];
    const prepared = {
      first: vi.fn(async () => ({ count: 27 }))
    };
    const db = {
      prepare: vi.fn((sql: string) => {
        statements.push(sql);
        return prepared;
      }),
      batch: vi.fn(async () => [])
    } as unknown as D1Database;

    await expect(rebuildArchiveCompleteness(db)).resolves.toBe(27);
    expect(db.batch).toHaveBeenCalledOnce();
    expect(statements[0]).toBe('DELETE FROM ArchiveCompleteness');
    expect(statements[1]).toContain('INSERT INTO ArchiveCompleteness');
    expect(statements[1]).toContain("('lineups')");
    expect(statements[1]).toContain("('match-reports'), ('highlights')");
    expect(statements[1]).toContain("MatchLinks.link_type = 'highlights'");
    expect(statements[1]).toContain(
      "WHEN goal_type IS NOT NULL AND TRIM(goal_type) <> ''",
    );
    expect(statements[1]).not.toContain(
      "minute IS NOT NULL AND TRIM(minute) <> ''",
    );
    expect(statements[2]).toContain('SELECT COUNT(*)');
  });
});
