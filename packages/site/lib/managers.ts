import {
  queryManagerAtDateRow,
  queryManagerRows,
} from "@tranmere-web/lib/src/d1-queries";
import type { ManagerRow } from "@tranmere-web/lib/src/d1-types";
import type { ManagerFormation } from "@tranmere-web/lib/src/manager-constants";
import type { Manager } from "@tranmere-web/lib/src/tranmere-web-types";

export interface ManagerRecord extends Manager {
  id: string;
}

export interface ManagerInput {
  name: string;
  dateJoined: string;
  dateLeft: string;
  imagePath: string;
  favouriteFormation: ManagerFormation | "";
}

export interface ManagerLink {
  id: string;
  managerId: string;
  label: string;
  description: string | null;
  url: string;
  publisher: string | null;
  sortOrder: number;
}

export interface ManagerLinkInput {
  managerId: string;
  label: string;
  description: string | null;
  url: string;
  publisher: string | null;
  sortOrder: number;
}

export function managerArticleTag(name: string) {
  return name
    .replace(/\s*\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapManager(row: ManagerRow): ManagerRecord {
  return {
    id: row.id,
    name: row.name,
    dateJoined: row.date_joined,
    dateLeft: row.date_left,
    dateLeftText: row.date_left,
    imagePath: row.image_path || undefined,
    favouriteFormation:
      (row.favourite_formation as ManagerFormation | null) || undefined,
  };
}

export async function getManagers(db: D1Database) {
  const rows = await queryManagerRows(db);
  return rows.map(mapManager);
}

export async function getManagerAtDate(db: D1Database, matchDate: string) {
  const row = await queryManagerAtDateRow(db, matchDate);
  return row ? mapManager(row) : null;
}

export async function getManagerById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, name, date_joined, date_left, image_path, favourite_formation
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
         id, name, date_joined, date_left, image_path, favourite_formation
       )
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      manager.name,
      manager.dateJoined,
      manager.dateLeft,
      manager.imagePath,
      manager.favouriteFormation || null,
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
       SET name = ?, date_joined = ?, date_left = ?, image_path = ?,
           favourite_formation = ?
       WHERE id = ?`,
    )
    .bind(
      manager.name,
      manager.dateJoined,
      manager.dateLeft,
      manager.imagePath,
      manager.favouriteFormation || null,
      id,
    )
    .run();

  if (!result.meta.changes) return null;
  return getManagerById(db, id);
}

export async function getManagerLinks(db: D1Database, managerId?: string) {
  const statement = managerId
    ? db
        .prepare(
          `SELECT id, manager_id, label, description, url, publisher, sort_order
           FROM ManagerLinks WHERE manager_id = ?
           ORDER BY sort_order, label, id`,
        )
        .bind(managerId)
    : db.prepare(
        `SELECT id, manager_id, label, description, url, publisher, sort_order
         FROM ManagerLinks ORDER BY manager_id, sort_order, label, id`,
      );
  const rows = await statement.all<{
    id: string;
    manager_id: string;
    label: string;
    description: string | null;
    url: string;
    publisher: string | null;
    sort_order: number;
  }>();
  return rows.results.map((row) => ({
    id: row.id,
    managerId: row.manager_id,
    label: row.label,
    description: row.description,
    url: row.url,
    publisher: row.publisher,
    sortOrder: Number(row.sort_order),
  }));
}

export async function createManagerLink(
  db: D1Database,
  id: string,
  input: ManagerLinkInput,
) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO ManagerLinks
       (id, manager_id, label, description, url, publisher, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.managerId,
      input.label,
      input.description,
      input.url,
      input.publisher,
      input.sortOrder,
      now,
      now,
    )
    .run();
  return (await getManagerLinks(db, input.managerId)).find(
    (link) => link.id === id,
  );
}

export async function deleteManagerLink(db: D1Database, id: string) {
  return db.prepare("DELETE FROM ManagerLinks WHERE id = ?").bind(id).run();
}
