import {
  clubSearchRecord,
  playerSearchRecord,
  seasonSearchRecord,
  uploadAlgoliaSearchRecords
} from '@tranmere-web/lib/src/algolia-search-index';
import {
  querySearchIndexClubRows,
  querySearchIndexPlayerRows,
  querySearchIndexSeasonRows
} from '@tranmere-web/lib/src/d1-queries';

export interface AlgoliaSearchIndexConfig {
  applicationId: string;
  apiKey: string;
  indexName: string;
}

export async function updateAlgoliaSearchIndex(
  db: D1Database,
  config: AlgoliaSearchIndexConfig
) {
  const [players, clubs, seasons] = await Promise.all([
    querySearchIndexPlayerRows(db),
    querySearchIndexClubRows(db),
    querySearchIndexSeasonRows(db)
  ]);
  const records = [
    ...players.map(playerSearchRecord),
    ...clubs.map(clubSearchRecord),
    ...seasons.map(seasonSearchRecord)
  ];

  const result = await uploadAlgoliaSearchRecords(records, {
    ...config,
    concurrency: 10
  });

  return {
    ...result,
    players: players.length,
    clubs: clubs.length,
    seasons: seasons.length
  };
}
