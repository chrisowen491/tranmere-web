import type { SearchResultRow } from '../d1-types';
import { normalizeSearchTitle } from '../search-index';
import { all, type D1DatabaseReader, type D1Value } from './shared';

export interface SearchOptions {
  limit?: number;
}

function ftsQuery(value: string) {
  return normalizeSearchTitle(value)
    .split(' ')
    .filter(Boolean)
    .map((token) => `"${token}"*`)
    .join(' AND ');
}

export async function querySearchDocuments(
  db: D1DatabaseReader,
  query: string,
  options: SearchOptions = {}
) {
  const normalized = normalizeSearchTitle(query);
  const match = ftsQuery(query);
  if (!normalized || !match) return [];

  const limit = Math.max(1, Math.min(options.limit ?? 8, 10));
  const values: D1Value[] = [match, normalized, `${normalized}%`, limit];
  return (
    await all<SearchResultRow>(
      db,
      `SELECT d.object_id, d.entity_type, d.entity_id, d.title,
              d.description, d.href, d.image_url
       FROM SearchDocumentsFts
       JOIN SearchDocuments d
         ON d.object_id = SearchDocumentsFts.object_id
       WHERE SearchDocumentsFts MATCH ?
       ORDER BY
         CASE
           WHEN d.normalized_title = ? THEN 0
           WHEN d.normalized_title LIKE ? THEN 1
           ELSE 2
         END ASC,
         bm25(SearchDocumentsFts, 0.0, 10.0, 4.0, 1.0) ASC,
         d.ranking_weight DESC,
         d.title ASC
       LIMIT ?`,
      values
    )
  ).results;
}
