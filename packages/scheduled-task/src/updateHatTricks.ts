/**
 * Rebuilds the HatTricks D1 table from recorded Goals. This replaces the
 * legacy HatTrickJob Lambda and avoids its DynamoDB TTL-based refresh cycle.
 */
export async function rebuildHatTricks(db: D1Database) {
  await db.batch([
    db.prepare('DELETE FROM HatTricks'),
    db.prepare(`
      INSERT INTO HatTricks (
        id, season, match_date, opposition, player_name, goals
      )
      SELECT
        'hat-trick:' || season || ':' || match_date || ':' || scorer,
        season,
        match_date,
        MIN(opposition),
        scorer,
        COUNT(*)
      FROM Goals
      WHERE trim(scorer) <> ''
        AND LOWER(TRIM(COALESCE(Goals.competition, ''))) <> 'friendly'
        AND NOT EXISTS (
          SELECT 1
          FROM Games statistical_game
          WHERE statistical_game.season = Goals.season
            AND statistical_game.match_date = Goals.match_date
            AND LOWER(TRIM(statistical_game.competition)) = 'friendly'
        )
      GROUP BY season, match_date, scorer
      HAVING COUNT(*) >= 3
    `)
  ]);

  const count = await db
    .prepare('SELECT COUNT(*) AS count FROM HatTricks')
    .first<{ count: number }>();

  return count?.count ?? 0;
}
