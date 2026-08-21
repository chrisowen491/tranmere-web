import { queryClubRows } from "@tranmere-web/lib/src/d1-queries";
import type { ClubRow } from "@tranmere-web/lib/src/d1-types";
import type { Team } from "@tranmere-web/lib/src/tranmere-web-types";

export interface ClubRecord extends Team {
  id: string;
  shortName: string;
  threeLetterName: string;
  nicknames: string;
  primaryColour: string;
  secondaryColour: string;
  highestDivision: number | null;
  latitude: number | null;
  longitude: number | null;
}

export type ClubInput = Omit<ClubRecord, "id">;

export function mapClub(row: ClubRow): ClubRecord {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name || "",
    threeLetterName: row.three_letter_name || "",
    nicknames: row.nicknames || "",
    primaryColour: row.primary_colour || "",
    secondaryColour: row.secondary_colour || "",
    highestDivision: row.highest_division,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

export async function getClubs(db: D1Database): Promise<Team[]> {
  const result = await db
    .prepare(
      `SELECT name
       FROM Clubs
       ORDER BY name ASC`,
    )
    .all<Team>();

  return result.results;
}

export async function getHeadToHeadClubs(db: D1Database): Promise<Team[]> {
  const result = await db
    .prepare(
      `SELECT DISTINCT Clubs.name
       FROM Clubs
       INNER JOIN Games ON Games.opposition = Clubs.name COLLATE NOCASE
       WHERE LOWER(TRIM(Games.competition)) <> 'friendly'
       ORDER BY Clubs.name ASC`,
    )
    .all<Team>();

  return result.results;
}

export async function getClubRecords(db: D1Database) {
  const rows = await queryClubRows(db);
  return rows.map(mapClub);
}

export async function getClubById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, name, short_name, three_letter_name, nicknames,
              primary_colour, secondary_colour, highest_division,
              latitude, longitude
       FROM Clubs
       WHERE id = ?`,
    )
    .bind(id)
    .first<ClubRow>();

  return row ? mapClub(row) : null;
}

export async function getClubByName(db: D1Database, name: string) {
  const row = await db
    .prepare(
      `SELECT id, name, short_name, three_letter_name, nicknames,
              primary_colour, secondary_colour, highest_division,
              latitude, longitude
       FROM Clubs
       WHERE name = ?
       COLLATE NOCASE`,
    )
    .bind(name)
    .first<ClubRow>();

  return row ? mapClub(row) : null;
}

export async function createClub(db: D1Database, id: string, club: ClubInput) {
  await db
    .prepare(
      `INSERT INTO Clubs (
         id, name, short_name, three_letter_name, nicknames,
         primary_colour, secondary_colour, highest_division, latitude, longitude
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      club.name,
      club.shortName || null,
      club.threeLetterName || null,
      club.nicknames || null,
      club.primaryColour || null,
      club.secondaryColour || null,
      club.highestDivision,
      club.latitude,
      club.longitude,
    )
    .run();

  return getClubById(db, id);
}

export async function updateClub(db: D1Database, id: string, club: ClubInput) {
  await db
    .prepare(
      `UPDATE Clubs
       SET name = ?, short_name = ?, three_letter_name = ?, nicknames = ?,
           primary_colour = ?, secondary_colour = ?, highest_division = ?,
           latitude = ?, longitude = ?
       WHERE id = ?`,
    )
    .bind(
      club.name,
      club.shortName || null,
      club.threeLetterName || null,
      club.nicknames || null,
      club.primaryColour || null,
      club.secondaryColour || null,
      club.highestDivision,
      club.latitude,
      club.longitude,
      id,
    )
    .run();

  return getClubById(db, id);
}
