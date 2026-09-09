export interface ClubCaptainRecord {
  id: string;
  season: number;
  playerName: string;
  notes: string | null;
  sortOrder: number;
}

interface ClubCaptainRow {
  id: string;
  season: number;
  player_name: string;
  notes: string | null;
  sort_order: number;
}

export interface ClubCaptainInput {
  season: number;
  playerName: string;
  notes: string | null;
  sortOrder: number;
}

function mapCaptain(row: ClubCaptainRow): ClubCaptainRecord {
  return {
    id: row.id,
    season: Number(row.season),
    playerName: row.player_name,
    notes: row.notes,
    sortOrder: Number(row.sort_order),
  };
}

export async function getClubCaptains(db: D1Database) {
  const rows = await db
    .prepare(
      `SELECT id, season, player_name, notes, sort_order FROM ClubCaptains ORDER BY season DESC, sort_order, player_name, id`,
    )
    .all<ClubCaptainRow>();
  return rows.results.map(mapCaptain);
}

export async function getClubCaptainsBySeason(db: D1Database, season: number) {
  const rows = await db
    .prepare(
      `SELECT id, season, player_name, notes, sort_order FROM ClubCaptains WHERE season = ? ORDER BY sort_order, player_name, id`,
    )
    .bind(season)
    .all<ClubCaptainRow>();
  return rows.results.map(mapCaptain);
}

export async function getClubCaptainById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, season, player_name, notes, sort_order FROM ClubCaptains WHERE id = ?`,
    )
    .bind(id)
    .first<ClubCaptainRow>();
  return row ? mapCaptain(row) : null;
}

export async function createClubCaptain(
  db: D1Database,
  id: string,
  input: ClubCaptainInput,
) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO ClubCaptains (id, season, player_name, notes, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.season,
      input.playerName,
      input.notes,
      input.sortOrder,
      now,
      now,
    )
    .run();
  return getClubCaptainById(db, id);
}

export async function updateClubCaptain(
  db: D1Database,
  id: string,
  input: ClubCaptainInput,
) {
  const result = await db
    .prepare(
      `UPDATE ClubCaptains SET season = ?, player_name = ?, notes = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      input.season,
      input.playerName,
      input.notes,
      input.sortOrder,
      new Date().toISOString(),
      id,
    )
    .run();
  return result.meta.changes ? getClubCaptainById(db, id) : null;
}

export async function deleteClubCaptain(db: D1Database, id: string) {
  return db.prepare(`DELETE FROM ClubCaptains WHERE id = ?`).bind(id).run();
}
