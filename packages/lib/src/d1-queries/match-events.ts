import type { MatchEventRow } from '../d1-types';
import { all, withLimit, type D1DatabaseReader, type D1Value } from './shared';

export interface MatchEventQueryOptions {
  season?: number;
  matchDate?: string;
  playerName?: string;
  eventType?: string;
  limit?: number;
  offset?: number;
}

export async function queryMatchEventRows(
  db: D1DatabaseReader,
  options: MatchEventQueryOptions = {}
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
  if (options.playerName) {
    conditions.push('player_name = ? COLLATE NOCASE');
    values.push(options.playerName);
  }
  if (options.eventType) {
    conditions.push('event_type = ?');
    values.push(options.eventType);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return (
    await all<MatchEventRow>(
      db,
      withLimit(
        `SELECT id, season, match_date, player_name, event_type, minute, notes,
                metadata_json, created_at, updated_at
         FROM MatchEvents
         ${where}
         ORDER BY match_date DESC, event_type ASC, player_name ASC, id ASC`,
        values,
        options.limit,
        options.offset
      ),
      values
    )
  ).results;
}
