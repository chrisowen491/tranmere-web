import { queryManagerRows } from "@tranmere-web/lib/src/d1-queries";
import type { ManagerRow } from "@tranmere-web/lib/src/d1-types";
import type { Manager } from "@tranmere-web/lib/src/tranmere-web-types";

export interface ManagerRecord extends Manager {
  id: string;
}

export interface ManagerInput {
  name: string;
  dateJoined: string;
  dateLeft: string;
  programmePath: string;
  imagePath: string;
}

export function mapManager(row: ManagerRow): ManagerRecord {
  return {
    id: row.id,
    name: row.name,
    dateJoined: row.date_joined,
    dateLeft: row.date_left,
    dateLeftText: row.date_left,
    programmePath: row.programme_path || undefined,
    imagePath: row.image_path || undefined,
  };
}

export async function getManagers(db: D1Database) {
  const rows = await queryManagerRows(db);
  return rows.map(mapManager);
}

export async function getManagerById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, name, date_joined, date_left, programme_path, image_path
       FROM Managers
       WHERE id = ?`,
    )
    .bind(id)
    .first<ManagerRow>();

  return row ? mapManager(row) : null;
}

export async function createManager(
  db: D1Database,
  id: string,
  manager: ManagerInput,
) {
  await db
    .prepare(
      `INSERT INTO Managers (
         id, name, date_joined, date_left, programme_path, image_path
       )
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      manager.name,
      manager.dateJoined,
      manager.dateLeft,
      manager.programmePath,
      manager.imagePath,
    )
    .run();

  return getManagerById(db, id);
}

export async function updateManager(
  db: D1Database,
  id: string,
  manager: ManagerInput,
) {
  const result = await db
    .prepare(
      `UPDATE Managers
       SET name = ?, date_joined = ?, date_left = ?, programme_path = ?,
           image_path = ?
       WHERE id = ?`,
    )
    .bind(
      manager.name,
      manager.dateJoined,
      manager.dateLeft,
      manager.programmePath,
      manager.imagePath,
      id,
    )
    .run();

  if (!result.meta.changes) return null;
  return getManagerById(db, id);
}
