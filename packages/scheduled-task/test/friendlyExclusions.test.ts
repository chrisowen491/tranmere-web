import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error The worker tsconfig intentionally excludes Node test types.
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { rebuildHatTricks } from '../src/updateHatTricks';
import { rebuildPlayerMilestones } from '../src/updatePlayerMilestones';
import { rebuildPlayerSeasonSummaries } from '../src/updatePlayerSeasonSummaries';

function recordingDatabase() {
  const statements: string[] = [];
  const db = {
    prepare: vi.fn((sql: string) => {
      statements.push(sql);
      return {
        first: vi.fn().mockResolvedValue({ count: 0 })
      };
    }),
    batch: vi.fn().mockResolvedValue([])
  } as unknown as D1Database;
  return { db, statements };
}

function sqliteD1(database: DatabaseSync) {
  class PreparedStatement {
    private values: SQLInputValue[] = [];

    constructor(private readonly sql: string) {}

    bind(...values: SQLInputValue[]) {
      this.values = values;
      return this;
    }

    run() {
      database.prepare(this.sql).run(...this.values);
      return { meta: { changes: 0 } };
    }

    async first<T>() {
      return (database.prepare(this.sql).get(...this.values) as T) ?? null;
    }
  }

  return {
    prepare: (sql: string) => new PreparedStatement(sql),
    batch: async (statements: PreparedStatement[]) => {
      statements.forEach((statement) => statement.run());
      return [];
    }
  } as unknown as D1Database;
}

function archiveDatabase() {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    CREATE TABLE Games (
      season INTEGER NOT NULL,
      match_date TEXT NOT NULL,
      competition TEXT NOT NULL
    );
    CREATE TABLE Apps (
      id TEXT PRIMARY KEY,
      season INTEGER NOT NULL,
      match_date TEXT NOT NULL,
      player_name TEXT NOT NULL,
      competition TEXT,
      opposition TEXT,
      yellow_card INTEGER NOT NULL DEFAULT 0,
      red_card INTEGER NOT NULL DEFAULT 0,
      substituted_by TEXT,
      substitute_yellow_card INTEGER NOT NULL DEFAULT 0,
      substitute_red_card INTEGER NOT NULL DEFAULT 0,
      substitute_substituted_by TEXT
    );
    CREATE TABLE Goals (
      id TEXT PRIMARY KEY,
      season INTEGER NOT NULL,
      match_date TEXT NOT NULL,
      scorer TEXT NOT NULL,
      opposition TEXT,
      competition TEXT,
      goal_type TEXT,
      assist TEXT
    );
    CREATE TABLE PlayerSeasonSummaries (
      season TEXT NOT NULL,
      player_name TEXT NOT NULL,
      appearances INTEGER NOT NULL,
      starts INTEGER NOT NULL,
      substitute_appearances INTEGER NOT NULL,
      goals INTEGER NOT NULL,
      assists INTEGER NOT NULL,
      yellow_cards INTEGER NOT NULL,
      red_cards INTEGER NOT NULL,
      free_kicks INTEGER NOT NULL,
      penalties INTEGER NOT NULL,
      headers INTEGER NOT NULL
    );
    CREATE TABLE PlayerMilestones (
      id TEXT PRIMARY KEY,
      player_name TEXT NOT NULL,
      milestone_type TEXT NOT NULL,
      match_date TEXT NOT NULL,
      season INTEGER NOT NULL,
      opposition TEXT,
      milestone_value INTEGER
    );
    CREATE TABLE HatTricks (
      id TEXT PRIMARY KEY,
      season INTEGER NOT NULL,
      match_date TEXT NOT NULL,
      opposition TEXT,
      player_name TEXT NOT NULL,
      goals INTEGER NOT NULL
    );

    INSERT INTO Games VALUES
      (1991, '1991-08-03', 'Friendly'),
      (1991, '1991-08-06', 'Friendly'),
      (1991, '1991-08-09', 'Friendly'),
      (1991, '1991-08-12', 'Friendly'),
      (1991, '1991-09-07', 'League');

    INSERT INTO Apps (id, season, match_date, player_name, competition, opposition) VALUES
      ('oldham', 1991, '1991-08-03', 'John Aldridge', 'Friendly', 'Oldham Athletic'),
      ('everton', 1991, '1991-08-06', 'John Aldridge', 'Friendly', 'Everton'),
      ('altrincham', 1991, '1991-08-09', 'John Aldridge', 'Friendly', 'Altrincham'),
      ('liverpool', 1991, '1991-08-12', 'John Aldridge', 'Friendly', 'Liverpool'),
      ('newcastle', 1991, '1991-09-07', 'John Aldridge', 'League', 'Newcastle United');

    INSERT INTO Goals (id, season, match_date, scorer, opposition, competition, goal_type) VALUES
      ('friendly-1', 1991, '1991-08-12', 'John Aldridge', 'Liverpool', 'Friendly', 'Penalty'),
      ('friendly-2', 1991, '1991-08-12', 'John Aldridge', 'Liverpool', 'Friendly', 'Header'),
      ('friendly-3', 1991, '1991-08-12', 'John Aldridge', 'Liverpool', 'Friendly', 'FreeKick'),
      ('league-1', 1991, '1991-09-07', 'John Aldridge', 'Newcastle United', 'League', 'Penalty'),
      ('league-2', 1991, '1991-09-07', 'John Aldridge', 'Newcastle United', 'League', 'Header'),
      ('league-3', 1991, '1991-09-07', 'John Aldridge', 'Newcastle United', 'League', 'FreeKick');
  `);
  return database;
}

describe('friendly exclusions in generated player records', () => {
  it('builds player totals and records from competitive 1991 matches only', async () => {
    const database = archiveDatabase();
    const db = sqliteD1(database);

    await rebuildPlayerSeasonSummaries(db);
    await rebuildPlayerMilestones(db);
    await rebuildHatTricks(db);

    expect(
      database
        .prepare(
          `SELECT season, appearances, starts, goals, penalties, headers,
                  free_kicks
           FROM PlayerSeasonSummaries
           WHERE player_name = 'John Aldridge'
           ORDER BY season`
        )
        .all()
    ).toEqual([
      {
        season: '1991',
        appearances: 1,
        starts: 1,
        goals: 3,
        penalties: 1,
        headers: 1,
        free_kicks: 1
      },
      {
        season: 'TOTAL',
        appearances: 1,
        starts: 1,
        goals: 3,
        penalties: 1,
        headers: 1,
        free_kicks: 1
      }
    ]);
    expect(
      database
        .prepare(
          `SELECT milestone_type, match_date
           FROM PlayerMilestones
           WHERE player_name = 'John Aldridge'
           ORDER BY milestone_type`
        )
        .all()
    ).toEqual([
      { milestone_type: 'debut', match_date: '1991-09-07' },
      { milestone_type: 'first-goal', match_date: '1991-09-07' },
      { milestone_type: 'latest-appearance', match_date: '1991-09-07' }
    ]);
    expect(
      database
        .prepare(
          `SELECT match_date, opposition, player_name, goals
           FROM HatTricks`
        )
        .all()
    ).toEqual([
      {
        match_date: '1991-09-07',
        opposition: 'Newcastle United',
        player_name: 'John Aldridge',
        goals: 3
      }
    ]);

    database.close();
  });

  it('excludes friendlies from player milestones', async () => {
    const { db, statements } = recordingDatabase();

    await rebuildPlayerMilestones(db);

    const generatedSql = statements.join('\n');
    expect(generatedSql).toContain("COALESCE(Apps.competition, '')");
    expect(generatedSql).toContain("COALESCE(Goals.competition, '')");
    expect(generatedSql).toContain('FROM Games statistical_game');
  });

  it('excludes friendlies from hat-trick records', async () => {
    const { db, statements } = recordingDatabase();

    await rebuildHatTricks(db);

    const generatedSql = statements.join('\n');
    expect(generatedSql).toContain("COALESCE(Goals.competition, '')");
    expect(generatedSql).toContain('FROM Games statistical_game');
  });
});
