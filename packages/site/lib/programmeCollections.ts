import type {
  ProgrammeCollectionRow,
  ProgrammeCollectionStatus,
  UserProfileRow,
} from "@tranmere-web/lib/src/d1-types";

export interface ProgrammeCollectionDisplay extends ProgrammeCollectionRow {
  match_date: string;
  match_name: string;
  season: number;
  competition: string;
  programme_url: string | null;
  location: "Home" | "Away";
}

export interface ProgrammeTotal {
  season: number;
  location: "Home" | "Away";
  total: number;
}

export interface PublicProgrammeCollector {
  public_id: string;
  wanted_count: number;
  trade_count: number;
}

export async function getProgrammeGame(db: D1Database, matchDate: string) {
  return db
    .prepare(
      `SELECT id, season, competition, home_team, away_team
       FROM Games
       WHERE match_date = ?
         AND no_programme_issued = 0
       ORDER BY id LIMIT 1`,
    )
    .bind(matchDate)
    .first<{
      id: string;
      season: number;
      competition: string;
      home_team: string;
      away_team: string;
    }>();
}

export async function getCollectionEntry(
  db: D1Database,
  accountId: string,
  gameId: string,
) {
  return db
    .prepare(
      `SELECT account_id, game_id, status, condition_notes, purchase_notes,
              created_at, updated_at
       FROM ProgrammeCollections WHERE account_id = ? AND game_id = ?`,
    )
    .bind(accountId, gameId)
    .first<ProgrammeCollectionRow>();
}

export async function saveCollectionEntry(
  db: D1Database,
  accountId: string,
  gameId: string,
  status: ProgrammeCollectionStatus,
  conditionNotes: string | null,
  purchaseNotes: string | null,
) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO ProgrammeCollections (
         account_id, game_id, status, condition_notes, purchase_notes, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(account_id, game_id) DO UPDATE SET
         status = excluded.status,
         condition_notes = excluded.condition_notes,
         purchase_notes = excluded.purchase_notes,
         updated_at = excluded.updated_at`,
    )
    .bind(accountId, gameId, status, conditionNotes, purchaseNotes, now, now)
    .run();
  return getCollectionEntry(db, accountId, gameId);
}

const collectionSelect = `
  SELECT pc.account_id, pc.game_id, pc.status, pc.condition_notes, pc.purchase_notes,
         pc.created_at, pc.updated_at, g.match_date, g.season, g.competition,
         g.home_team || ' v ' || g.away_team AS match_name,
         g.programme_path AS programme_url,
         CASE WHEN g.home_team = 'Tranmere Rovers' THEN 'Home' ELSE 'Away' END AS location
  FROM ProgrammeCollections pc
  JOIN Games g ON g.id = pc.game_id`;

export async function getUserCollection(db: D1Database, accountId: string) {
  const result = await db
    .prepare(
      `${collectionSelect}
       WHERE pc.account_id = ? AND g.no_programme_issued = 0
       ORDER BY g.match_date DESC, pc.game_id ASC`,
    )
    .bind(accountId)
    .all<ProgrammeCollectionDisplay>();
  return result.results;
}

export async function getProgrammeTotals(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT g.season,
              CASE WHEN g.home_team = 'Tranmere Rovers' THEN 'Home' ELSE 'Away' END AS location,
              COUNT(*) AS total
       FROM Games g
       WHERE g.no_programme_issued = 0
       GROUP BY g.season, location
       ORDER BY g.season DESC, location ASC`,
    )
    .all<ProgrammeTotal>();
  return result.results;
}

export async function updateCollectionVisibility(
  db: D1Database,
  accountId: string,
  visible: boolean,
) {
  const profile = await db
    .prepare(
      `SELECT account_id, public_collection_id, public_collection_visible, contact_opt_in
       FROM UserProfiles WHERE account_id = ?`,
    )
    .bind(accountId)
    .first<UserProfileRow>();
  const publicId = profile?.public_collection_id || crypto.randomUUID();
  await db
    .prepare(
      `UPDATE UserProfiles
       SET public_collection_id = ?, public_collection_visible = ?, contact_opt_in = ?
       WHERE account_id = ?`,
    )
    .bind(publicId, visible ? 1 : 0, 0, accountId)
    .run();
  return publicId;
}

export async function getPublicCollection(db: D1Database, publicId: string) {
  const profile = await db
    .prepare(
      `SELECT account_id, public_collection_id, public_collection_visible, contact_opt_in
       FROM UserProfiles
       WHERE public_collection_id = ? AND public_collection_visible = 1`,
    )
    .bind(publicId)
    .first<UserProfileRow>();
  if (!profile) return null;
  const result = await db
    .prepare(
      `${collectionSelect}
       WHERE pc.account_id = ? AND pc.status IN ('wanted', 'trade')
         AND g.no_programme_issued = 0
       ORDER BY g.match_date DESC, pc.game_id ASC`,
    )
    .bind(profile.account_id)
    .all<ProgrammeCollectionDisplay>();
  return { profile, entries: result.results };
}

export async function getPublicProgrammeCollectors(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT up.public_collection_id AS public_id,
              SUM(CASE WHEN pc.status = 'wanted' AND g.id IS NOT NULL THEN 1 ELSE 0 END) AS wanted_count,
              SUM(CASE WHEN pc.status = 'trade' AND g.id IS NOT NULL THEN 1 ELSE 0 END) AS trade_count
       FROM UserProfiles up
       LEFT JOIN ProgrammeCollections pc
         ON pc.account_id = up.account_id
        AND pc.status IN ('wanted', 'trade')
       LEFT JOIN Games g
         ON g.id = pc.game_id
        AND g.no_programme_issued = 0
       WHERE up.public_collection_visible = 1
         AND up.public_collection_id IS NOT NULL
       GROUP BY up.account_id, up.public_collection_id
       ORDER BY trade_count DESC, wanted_count DESC, up.public_collection_id ASC`,
    )
    .all<{
      public_id: string;
      wanted_count: number;
      trade_count: number;
    }>();
  return result.results;
}
