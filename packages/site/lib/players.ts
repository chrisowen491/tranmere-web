import { queryPlayerRows } from "@tranmere-web/lib/src/d1-queries";
import type { PlayerRow } from "@tranmere-web/lib/src/d1-types";

export interface PlayerRecord {
  id: string;
  name: string;
  dateOfBirth: string | null;
  biographyMarkdown: string | null;
  picLink: string | null;
  foot: string | null;
  height: string | null;
  placeOfBirth: string | null;
  position: string | null;
  secondaryPosition: string | null;
  links: string[];
}

export type PlayerInput = Omit<PlayerRecord, "id">;

function parseLinks(value: string) {
  try {
    const links = JSON.parse(value) as unknown;
    return Array.isArray(links)
      ? links.filter((link): link is string => typeof link === "string")
      : [];
  } catch {
    return [];
  }
}

export function mapPlayer(row: PlayerRow): PlayerRecord {
  return {
    id: row.id,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    biographyMarkdown: row.biography_markdown,
    picLink: row.pic_link,
    foot: row.foot,
    height: row.height,
    placeOfBirth: row.place_of_birth,
    position: row.position,
    secondaryPosition: row.secondary_position,
    links: parseLinks(row.links_json),
  };
}

const playerColumns = `id, name, date_of_birth, biography_markdown, pic_link,
  foot, height, place_of_birth, position, secondary_position, links_json`;

export async function getPlayers(db: D1Database) {
  const rows = await queryPlayerRows(db);
  return rows.map(mapPlayer);
}

function playerCompleteness(player: PlayerRecord) {
  return [
    player.dateOfBirth,
    player.biographyMarkdown,
    player.picLink,
    player.foot,
    player.height,
    player.placeOfBirth,
    player.position,
    player.secondaryPosition,
  ].filter(Boolean).length;
}

function preferPlayer(
  current: PlayerRecord | undefined,
  candidate: PlayerRecord,
) {
  if (!current) return candidate;
  const completeness =
    playerCompleteness(candidate) - playerCompleteness(current);
  if (completeness !== 0) return completeness > 0 ? candidate : current;
  const biographyLength =
    (candidate.biographyMarkdown?.length ?? 0) -
    (current.biographyMarkdown?.length ?? 0);
  if (biographyLength !== 0) return biographyLength > 0 ? candidate : current;
  return candidate.id.localeCompare(current.id) < 0 ? candidate : current;
}

export async function getUniquePlayers(db: D1Database) {
  const players = await getPlayers(db);
  return [
    ...players
      .reduce((unique, player) => {
        unique.set(player.name, preferPlayer(unique.get(player.name), player));
        return unique;
      }, new Map<string, PlayerRecord>())
      .values(),
  ].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPlayersByNames(db: D1Database, names: string[]) {
  const requested = [...new Set(names)].filter(Boolean);
  if (requested.length === 0) return new Map<string, PlayerRecord>();

  const rows: PlayerRow[] = [];
  const chunkSize = 50;
  for (let index = 0; index < requested.length; index += chunkSize) {
    const chunk = requested.slice(index, index + chunkSize);
    const placeholders = chunk.map(() => "?").join(", ");
    const result = await db
      .prepare(
        `SELECT ${playerColumns}
         FROM Players
         WHERE name IN (${placeholders})`,
      )
      .bind(...chunk)
      .all<PlayerRow>();
    rows.push(...result.results);
  }

  const players = rows.map(mapPlayer);
  return new Map(
    players
      .reduce((unique, player) => {
        unique.set(player.name, preferPlayer(unique.get(player.name), player));
        return unique;
      }, new Map<string, PlayerRecord>())
      .entries(),
  );
}

export async function getPlayerById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT ${playerColumns}
       FROM Players
       WHERE id = ?`,
    )
    .bind(id)
    .first<PlayerRow>();
  return row ? mapPlayer(row) : null;
}

export async function getPlayerByName(db: D1Database, name: string) {
  const row = await db
    .prepare(
      `SELECT ${playerColumns}
       FROM Players
       WHERE name = ?
       ORDER BY (
         (date_of_birth IS NOT NULL) +
         (biography_markdown IS NOT NULL) +
         (pic_link IS NOT NULL) +
         (foot IS NOT NULL) +
         (height IS NOT NULL) +
         (place_of_birth IS NOT NULL) +
         (position IS NOT NULL) +
         (secondary_position IS NOT NULL)
       ) DESC,
       length(biography_markdown) DESC,
       id ASC
       LIMIT 1`,
    )
    .bind(name)
    .first<PlayerRow>();
  return row ? mapPlayer(row) : null;
}

export async function createPlayer(db: D1Database, player: PlayerInput) {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO Players (
         id, name, date_of_birth, biography_markdown, pic_link, foot, height,
         place_of_birth, position, secondary_position, links_json
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      player.name,
      player.dateOfBirth,
      player.biographyMarkdown,
      player.picLink,
      player.foot,
      player.height,
      player.placeOfBirth,
      player.position,
      player.secondaryPosition,
      JSON.stringify(player.links),
    )
    .run();
  return getPlayerById(db, id);
}

export async function updatePlayer(
  db: D1Database,
  id: string,
  player: PlayerInput,
) {
  const result = await db
    .prepare(
      `UPDATE Players
       SET name = ?, date_of_birth = ?, biography_markdown = ?, pic_link = ?,
           foot = ?, height = ?, place_of_birth = ?, position = ?,
           secondary_position = ?, links_json = ?
       WHERE id = ?`,
    )
    .bind(
      player.name,
      player.dateOfBirth,
      player.biographyMarkdown,
      player.picLink,
      player.foot,
      player.height,
      player.placeOfBirth,
      player.position,
      player.secondaryPosition,
      JSON.stringify(player.links),
      id,
    )
    .run();
  if (!result.meta.changes) return null;
  return getPlayerById(db, id);
}
