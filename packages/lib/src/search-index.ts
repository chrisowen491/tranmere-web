import type {
  SearchDocument,
  SearchIndexClubRow,
  SearchIndexPlayerRow,
  SearchIndexSeasonRow
} from './d1-types';

const DEFAULT_IMAGE = '/assets/images/square_v1.png';

export function normalizeSearchTitle(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-GB')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function playerSearchDocument(
  player: SearchIndexPlayerRow
): SearchDocument {
  return {
    objectId: `player:${player.id}`,
    entityType: 'player',
    entityId: player.id,
    title: player.name,
    normalizedTitle: normalizeSearchTitle(player.name),
    aliases: '',
    description: 'Player Profile',
    href: `/page/player/${encodeURIComponent(player.name)}`,
    imageUrl: player.pic_link ?? DEFAULT_IMAGE,
    rankingWeight: 30
  };
}

export function clubSearchDocument(club: SearchIndexClubRow): SearchDocument {
  const aliases = [club.short_name, club.three_letter_name, club.nicknames]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ');
  return {
    objectId: `club:${club.id}`,
    entityType: 'club',
    entityId: club.id,
    title: club.name,
    normalizedTitle: normalizeSearchTitle(club.name),
    aliases,
    description: 'Club Overview',
    href: `/opponents/${encodeURIComponent(club.name)}`,
    imageUrl: DEFAULT_IMAGE,
    rankingWeight: 20
  };
}

export function seasonSearchDocument(
  season: SearchIndexSeasonRow
): SearchDocument {
  const id = String(season.season);
  const followingYear = String(season.season + 1).slice(-2);
  const title = `${id}-${followingYear} Season`;
  return {
    objectId: `season:${id}`,
    entityType: 'season',
    entityId: id,
    title,
    normalizedTitle: normalizeSearchTitle(title),
    aliases: `${id}/${followingYear} ${followingYear}`,
    description: 'Season Overview',
    href: `/season/${id}`,
    imageUrl: DEFAULT_IMAGE,
    rankingWeight: 10
  };
}

export function searchDocumentValues(
  document: SearchDocument,
  syncToken: string
) {
  return [
    document.objectId,
    document.entityType,
    document.entityId,
    document.title,
    document.normalizedTitle,
    document.aliases,
    document.description,
    document.href,
    document.imageUrl,
    document.rankingWeight,
    syncToken
  ];
}

export const upsertSearchDocumentSql = `INSERT INTO SearchDocuments (
  object_id, entity_type, entity_id, title, normalized_title, aliases,
  description, href, image_url, ranking_weight, sync_token, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
ON CONFLICT(object_id) DO UPDATE SET
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  title = excluded.title,
  normalized_title = excluded.normalized_title,
  aliases = excluded.aliases,
  description = excluded.description,
  href = excluded.href,
  image_url = excluded.image_url,
  ranking_weight = excluded.ranking_weight,
  sync_token = excluded.sync_token,
  updated_at = CURRENT_TIMESTAMP`;
