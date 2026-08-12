import type {
  SearchIndexClubRow,
  SearchIndexPlayerRow,
  SearchIndexSeasonRow
} from './d1-types';

const SITE_URL = 'https://www.tranmere-web.com';
const DEFAULT_IMAGE = '/assets/images/square_v1.png';

export interface AlgoliaSearchRecord {
  link: string;
  name: string;
  description: 'Player Profile' | 'Club Overview' | 'Season Overview';
  picLink: string;
  objectID: string;
}

export interface AlgoliaUploadOptions {
  applicationId: string;
  apiKey: string;
  indexName: string;
  concurrency?: number;
  fetcher?: typeof fetch;
}

export interface AlgoliaUploadResult {
  uploaded: number;
  failed: number;
}

export function playerSearchRecord(
  player: SearchIndexPlayerRow
): AlgoliaSearchRecord {
  return {
    link: `${SITE_URL}/page/player/${encodeURIComponent(player.name)}`,
    name: player.name,
    description: 'Player Profile',
    picLink: player.pic_link ?? DEFAULT_IMAGE,
    objectID: player.id
  };
}

export function clubSearchRecord(
  club: SearchIndexClubRow
): AlgoliaSearchRecord {
  return {
    link: `${SITE_URL}/opponents/${encodeURIComponent(club.name)}`,
    name: club.name,
    description: 'Club Overview',
    picLink: DEFAULT_IMAGE,
    objectID: club.id
  };
}

export function seasonSearchRecord(
  season: SearchIndexSeasonRow
): AlgoliaSearchRecord {
  const id = String(season.season);
  const followingYear = String(season.season + 1).slice(-2);

  return {
    link: `${SITE_URL}/season/${id}`,
    name: `${id}-${followingYear} Season`,
    description: 'Season Overview',
    picLink: DEFAULT_IMAGE,
    objectID: id
  };
}

async function uploadRecord(
  record: AlgoliaSearchRecord,
  options: AlgoliaUploadOptions
) {
  const fetcher = options.fetcher ?? fetch;
  const endpoint = `https://${options.applicationId}.algolia.net/1/indexes/${encodeURIComponent(options.indexName)}/${encodeURIComponent(record.objectID)}`;
  const response = await fetcher(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Algolia-Application-Id': options.applicationId,
      'X-Algolia-API-Key': options.apiKey
    },
    body: JSON.stringify(record)
  });

  if (!response.ok) {
    const responseBody = (await response.text()).slice(0, 500);
    throw new Error(
      `Algolia rejected object ${record.objectID} with ${response.status}: ${responseBody}`
    );
  }
}

export async function uploadAlgoliaSearchRecords(
  records: AlgoliaSearchRecord[],
  options: AlgoliaUploadOptions
): Promise<AlgoliaUploadResult> {
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 10, 25));
  let nextIndex = 0;
  let uploaded = 0;
  const failures: Error[] = [];

  async function worker() {
    while (nextIndex < records.length) {
      const record = records[nextIndex++];
      try {
        await uploadRecord(record, options);
        uploaded += 1;
      } catch (error) {
        failures.push(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, records.length) }, () =>
      worker()
    )
  );

  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      `Failed to upload ${failures.length} of ${records.length} Algolia search records.`
    );
  }

  return { uploaded, failed: 0 };
}
