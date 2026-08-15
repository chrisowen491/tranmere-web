import {
  blogSearchDocument,
  clubSearchDocument,
  playerSearchDocument,
  searchDocumentValues,
  seasonSearchDocument,
  staticPageSearchDocument,
  upsertSearchDocumentSql
} from '@tranmere-web/lib/src/search-index';
import {
  querySearchIndexClubRows,
  querySearchIndexPlayerRows,
  querySearchIndexSeasonRows
} from '@tranmere-web/lib/src/d1-queries';
import { STATIC_SEARCH_PAGES } from '@tranmere-web/lib/src/search-pages';
import {
  fetchContentfulBlogPosts,
  type ContentfulSearchConfig
} from './contentfulBlogPosts';

const BATCH_SIZE = 100;

export async function rebuildSearchIndex(
  db: D1Database,
  contentful: ContentfulSearchConfig
) {
  const [players, clubs, seasons, blogs] = await Promise.all([
    querySearchIndexPlayerRows(db),
    querySearchIndexClubRows(db),
    querySearchIndexSeasonRows(db),
    fetchContentfulBlogPosts(contentful)
  ]);
  const documents = [
    ...players.map(playerSearchDocument),
    ...clubs.map(clubSearchDocument),
    ...seasons.map(seasonSearchDocument),
    ...blogs.map(blogSearchDocument),
    ...STATIC_SEARCH_PAGES.map(staticPageSearchDocument)
  ];
  const syncToken = crypto.randomUUID();

  for (let index = 0; index < documents.length; index += BATCH_SIZE) {
    const statements = documents
      .slice(index, index + BATCH_SIZE)
      .map((document) =>
        db
          .prepare(upsertSearchDocumentSql)
          .bind(...searchDocumentValues(document, syncToken))
      );
    if (statements.length) await db.batch(statements);
  }

  await db
    .prepare('DELETE FROM SearchDocuments WHERE sync_token <> ?')
    .bind(syncToken)
    .run();

  return {
    indexed: documents.length,
    players: players.length,
    clubs: clubs.length,
    seasons: seasons.length,
    blogs: blogs.length,
    pages: STATIC_SEARCH_PAGES.length
  };
}
