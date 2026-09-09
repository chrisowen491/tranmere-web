export interface AwardDefinition {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface PlayerAwardRecord {
  id: string;
  awardId: string;
  awardName: string;
  awardDescription: string | null;
  season: number;
  playerName: string;
  notes: string | null;
}

export interface AwardInput {
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface PlayerAwardInput {
  awardId: string;
  season: number;
  playerName: string;
  notes: string | null;
}

interface AwardRow {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}
interface PlayerAwardRow {
  id: string;
  award_id: string;
  award_name: string;
  award_description: string | null;
  season: number;
  player_name: string;
  notes: string | null;
}

const mapAward = (row: AwardRow): AwardDefinition => ({
  id: row.id,
  name: row.name,
  description: row.description,
  sortOrder: Number(row.sort_order),
});
const mapPlayerAward = (row: PlayerAwardRow): PlayerAwardRecord => ({
  id: row.id,
  awardId: row.award_id,
  awardName: row.award_name,
  awardDescription: row.award_description,
  season: Number(row.season),
  playerName: row.player_name,
  notes: row.notes,
});

export async function getAwards(db: D1Database) {
  const rows = await db
    .prepare(
      `SELECT id, name, description, sort_order FROM Awards ORDER BY sort_order, name, id`,
    )
    .all<AwardRow>();
  return rows.results.map(mapAward);
}

export async function getAwardById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, name, description, sort_order FROM Awards WHERE id = ?`,
    )
    .bind(id)
    .first<AwardRow>();
  return row ? mapAward(row) : null;
}

export async function getPlayerAwards(
  db: D1Database,
  filters: { season?: number; playerName?: string } = {},
) {
  const clauses: string[] = [];
  const values: (string | number)[] = [];
  if (filters.season !== undefined) {
    clauses.push("pa.season = ?");
    values.push(filters.season);
  }
  if (filters.playerName) {
    clauses.push("pa.player_name = ? COLLATE NOCASE");
    values.push(filters.playerName);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await db
    .prepare(
      `SELECT pa.id, pa.award_id, a.name AS award_name, a.description AS award_description, pa.season, pa.player_name, pa.notes FROM PlayerAwards pa JOIN Awards a ON a.id = pa.award_id ${where} ORDER BY pa.season DESC, a.sort_order, a.name, pa.player_name, pa.id`,
    )
    .bind(...values)
    .all<PlayerAwardRow>();
  return rows.results.map(mapPlayerAward);
}

export async function getPlayerAwardById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT pa.id, pa.award_id, a.name AS award_name, a.description AS award_description, pa.season, pa.player_name, pa.notes FROM PlayerAwards pa JOIN Awards a ON a.id = pa.award_id WHERE pa.id = ?`,
    )
    .bind(id)
    .first<PlayerAwardRow>();
  return row ? mapPlayerAward(row) : null;
}

export async function createAward(
  db: D1Database,
  id: string,
  input: AwardInput,
) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO Awards (id, name, description, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.name, input.description, input.sortOrder, now, now)
    .run();
  return getAwardById(db, id);
}
export async function updateAward(
  db: D1Database,
  id: string,
  input: AwardInput,
) {
  await db
    .prepare(
      `UPDATE Awards SET name = ?, description = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      input.name,
      input.description,
      input.sortOrder,
      new Date().toISOString(),
      id,
    )
    .run();
  return getAwardById(db, id);
}
export async function deleteAward(db: D1Database, id: string) {
  return db.prepare(`DELETE FROM Awards WHERE id = ?`).bind(id).run();
}

export async function createPlayerAward(
  db: D1Database,
  id: string,
  input: PlayerAwardInput,
) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO PlayerAwards (id, award_id, season, player_name, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.awardId,
      input.season,
      input.playerName,
      input.notes,
      now,
      now,
    )
    .run();
  return getPlayerAwardById(db, id);
}
export async function updatePlayerAward(
  db: D1Database,
  id: string,
  input: PlayerAwardInput,
) {
  await db
    .prepare(
      `UPDATE PlayerAwards SET award_id = ?, season = ?, player_name = ?, notes = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      input.awardId,
      input.season,
      input.playerName,
      input.notes,
      new Date().toISOString(),
      id,
    )
    .run();
  return getPlayerAwardById(db, id);
}
export async function deletePlayerAward(db: D1Database, id: string) {
  return db.prepare(`DELETE FROM PlayerAwards WHERE id = ?`).bind(id).run();
}
