import type { PenaltyShootoutKickRow } from '../d1-types';
import { all, type D1DatabaseReader, type D1Value } from './shared';

export async function queryPenaltyShootoutKicks(
  db: D1DatabaseReader,
  options: { season?: number; matchDate?: string } = {}
) {
  const conditions: string[] = [];
  const values: D1Value[] = [];
  if (options.season !== undefined) {
    conditions.push('season = ?');
    values.push(options.season);
  }
  if (options.matchDate) {
    conditions.push('match_date = ?');
    values.push(options.matchDate);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    return (
      await all<PenaltyShootoutKickRow>(
        db,
        `SELECT id, season, match_date, kick_order, team_side, player_name,
              outcome, notes, created_at, updated_at
       FROM PenaltyShootoutKicks ${where}
       ORDER BY match_date DESC, kick_order ASC`,
        values
      )
    ).results;
  } catch (error) {
    if (error instanceof Error && error.message.includes('no such table')) {
      return [];
    }
    throw error;
  }
}
