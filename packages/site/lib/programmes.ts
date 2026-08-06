import { queryProgrammeRows } from "@tranmere-web/lib/src/d1-queries";
import type { ProgrammeRow } from "@tranmere-web/lib/src/d1-types";

export interface ProgrammeRecord {
  url: string;
  name: string;
  date: string;
  pages: number;
}

export interface ProgrammeInput {
  url: string;
  name: string;
  date: string;
  pages: number;
}

export function mapProgramme(row: ProgrammeRow): ProgrammeRecord {
  return {
    url: row.url,
    name: row.match_name,
    date: row.match_date,
    pages: row.pages,
  };
}

export async function getProgrammes(db: D1Database) {
  return (await queryProgrammeRows(db)).map(mapProgramme);
}

export async function getProgrammeByUrl(db: D1Database, url: string) {
  const row = await db
    .prepare(
      `SELECT url, match_name, match_date, pages
       FROM Programmes
       WHERE url = ?`,
    )
    .bind(url)
    .first<ProgrammeRow>();

  return row ? mapProgramme(row) : null;
}

export async function getProgrammeByDate(db: D1Database, date: string) {
  const row = await db
    .prepare(
      `SELECT url, match_name, match_date, pages
       FROM Programmes
       WHERE match_date = ?
       ORDER BY match_name ASC
       LIMIT 1`,
    )
    .bind(date)
    .first<ProgrammeRow>();

  return row ? mapProgramme(row) : null;
}

export async function createProgramme(
  db: D1Database,
  programme: ProgrammeInput,
) {
  await db
    .prepare(
      `INSERT INTO Programmes (url, match_name, match_date, pages)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(programme.url, programme.name, programme.date, programme.pages)
    .run();

  return getProgrammeByUrl(db, programme.url);
}

export async function updateProgramme(
  db: D1Database,
  originalUrl: string,
  programme: ProgrammeInput,
) {
  const result = await db
    .prepare(
      `UPDATE Programmes
       SET url = ?, match_name = ?, match_date = ?, pages = ?
       WHERE url = ?`,
    )
    .bind(
      programme.url,
      programme.name,
      programme.date,
      programme.pages,
      originalUrl,
    )
    .run();

  if (!result.meta.changes) return null;
  return getProgrammeByUrl(db, programme.url);
}

export async function deleteProgramme(db: D1Database, url: string) {
  const result = await db
    .prepare("DELETE FROM Programmes WHERE url = ?")
    .bind(url)
    .run();
  return Boolean(result.meta.changes);
}
