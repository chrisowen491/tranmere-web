import {
  clubSearchDocument,
  playerSearchDocument,
  searchDocumentValues,
  seasonSearchDocument,
  upsertSearchDocumentSql
} from '@tranmere-web/lib/src/search-index';
import {
  querySearchIndexClubRows,
  querySearchIndexPlayerRows,
  querySearchIndexSeasonRows
} from '@tranmere-web/lib/src/d1-queries';

const BATCH_SIZE = 100;

export async function rebuildSearchIndex(db: D1Database) {
  const [players, clubs, seasons] = await Promise.all([
    querySearchIndexPlayerRows(db),
    querySearchIndexClubRows(db),
    querySearchIndexSeasonRows(db)
  ]);
  const documents = [
    ...players.map(playerSearchDocument),
    ...clubs.map(clubSearchDocument),
    ...seasons.map(seasonSearchDocument)
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
    seasons: seasons.length
  };
}
