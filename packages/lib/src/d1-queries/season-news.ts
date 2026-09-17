import type { SeasonNewsSnippetRow } from '../d1-types';
import { all, type D1DatabaseReader, type D1Value } from './shared';

export async function querySeasonNewsSnippetRows(
  db: D1DatabaseReader,
  filters: { season?: number; tag?: string } = {}
) {
  const values: D1Value[] = [];
  const where: string[] = [];
  if (filters.season !== undefined) {
    where.push('s.season = ?');
    values.push(filters.season);
  }
  if (filters.tag) {
    where.push(
      'EXISTS (SELECT 1 FROM SeasonNewsSnippetTags t WHERE t.snippet_id = s.id AND t.tag = ? COLLATE NOCASE)'
    );
    values.push(filters.tag);
  }
  return (
    await all<SeasonNewsSnippetRow>(
      db,
      `SELECT s.id, s.season, s.news_date, s.placement, s.title, s.body, s.created_at, s.updated_at
     FROM SeasonNewsSnippets s
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY s.season DESC, s.news_date DESC, s.id DESC`,
      values
    )
  ).results;
}

export async function querySeasonNewsSnippetTags(
  db: D1DatabaseReader,
  snippetIds: readonly string[]
) {
  if (!snippetIds.length) return [] as { snippet_id: string; tag: string }[];
  return (
    await all<{ snippet_id: string; tag: string }>(
      db,
      `SELECT snippet_id, tag FROM SeasonNewsSnippetTags
     WHERE snippet_id IN (${snippetIds.map(() => '?').join(', ')})
     ORDER BY tag COLLATE NOCASE`,
      [...snippetIds]
    )
  ).results;
}
