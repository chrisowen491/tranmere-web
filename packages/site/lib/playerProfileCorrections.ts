import type { Document } from "@contentful/rich-text-types";
import { PLAYER_POSITIONS } from "@tranmere-web/lib/src/player-constants";
import { getPlayerByName } from "@/lib/players";

export type PlayerProfileCorrectionStatus = "pending" | "approved" | "rejected";

export interface EditablePlayerProfile {
  dateOfBirth?: string;
  biography?: string;
  picLink?: string;
  foot?: string;
  height?: string;
  placeOfBirth?: string;
  position?: string;
  secondaryPosition?: string;
}

export interface PlayerProfileCorrection {
  id: string;
  playerName: string;
  current: EditablePlayerProfile;
  changes: EditablePlayerProfile;
  source: string;
  explanation: string | null;
  submittedByAccountId: string;
  submittedByName: string;
  submittedByEmail: string | null;
  submittedAt: string;
  status: PlayerProfileCorrectionStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

interface DBPlayerProfileCorrection {
  id: string;
  player_name: string;
  current_json: string;
  changes_json: string;
  source: string;
  explanation: string | null;
  submitted_by_account_id: string;
  submitted_by_name: string;
  submitted_by_email: string | null;
  submitted_at: string;
  status: PlayerProfileCorrectionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

export const editablePlayerProfileLabels: Record<
  keyof EditablePlayerProfile,
  string
> = {
  dateOfBirth: "Date of birth",
  biography: "Biography",
  picLink: "Picture link",
  foot: "Preferred foot",
  height: "Height",
  placeOfBirth: "Place of birth",
  position: "Position",
  secondaryPosition: "Secondary position",
};

export async function ensurePlayerProfileCorrectionsTable(db: D1Database) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS PlayerProfileCorrections (
        id TEXT NOT NULL PRIMARY KEY,
        player_name TEXT NOT NULL,
        current_json TEXT NOT NULL,
        changes_json TEXT NOT NULL,
        source TEXT NOT NULL,
        explanation TEXT,
        submitted_by_account_id TEXT NOT NULL,
        submitted_by_name TEXT NOT NULL,
        submitted_by_email TEXT,
        submitted_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected')),
        reviewed_by TEXT,
        reviewed_at TEXT,
        review_note TEXT
      )
    `),
    db.prepare(`
      CREATE INDEX IF NOT EXISTS PlayerProfileCorrections_status_idx
      ON PlayerProfileCorrections (status, submitted_at)
    `),
    db.prepare(`
      CREATE INDEX IF NOT EXISTS PlayerProfileCorrections_player_idx
      ON PlayerProfileCorrections (player_name, status, reviewed_at)
    `),
  ]);
}

function parseProfile(value: string): EditablePlayerProfile {
  try {
    return JSON.parse(value) as EditablePlayerProfile;
  } catch {
    return {};
  }
}

function nullable(value: string | undefined) {
  return value?.trim() || null;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

const monthNumbers: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

export function normalizeDateOfBirth(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (validDate(trimmed)) return trimmed;

  const match = trimmed.match(
    /^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})$/i,
  );
  if (!match) return null;
  const day = Number(match[1]);
  const month = monthNumbers[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (!month) return null;
  const normalized = `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  return validDate(normalized) ? normalized : null;
}

function validateApprovedChanges(changes: EditablePlayerProfile) {
  const normalizedChanges = { ...changes };
  if (changes.dateOfBirth !== undefined) {
    const dateOfBirth = normalizeDateOfBirth(changes.dateOfBirth);
    if (dateOfBirth === null) {
      throw new Error("The proposed date of birth is invalid.");
    }
    normalizedChanges.dateOfBirth = dateOfBirth;
  }
  const foot = nullable(changes.foot);
  const position = nullable(changes.position);
  const secondaryPosition = nullable(changes.secondaryPosition);
  const picLink = nullable(changes.picLink);
  if (foot && foot !== "Left" && foot !== "Right") {
    throw new Error("The proposed preferred foot is invalid.");
  }
  if (
    position &&
    !PLAYER_POSITIONS.includes(position as (typeof PLAYER_POSITIONS)[number])
  ) {
    throw new Error("The proposed player position is invalid.");
  }
  if (
    secondaryPosition &&
    !PLAYER_POSITIONS.includes(
      secondaryPosition as (typeof PLAYER_POSITIONS)[number],
    )
  ) {
    throw new Error("The proposed secondary position is invalid.");
  }
  if (picLink) {
    try {
      const url = new URL(picLink);
      if (
        url.protocol !== "https:" ||
        ![
          "images.ctfassets.net",
          "images.tranmere-web.com",
          "img.tranmere-web.com",
          "www.tranmere-web.com",
        ].includes(url.hostname)
      ) {
        throw new Error("Invalid player image");
      }
    } catch {
      throw new Error("The proposed player image is invalid.");
    }
  }
  return normalizedChanges;
}

export async function approvePlayerProfileCorrection(
  db: D1Database,
  id: string,
  reviewedBy: string,
  reviewNote: string | null,
) {
  await ensurePlayerProfileCorrectionsTable(db);
  const correction = await db
    .prepare(
      `SELECT player_name, changes_json
       FROM PlayerProfileCorrections
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(id)
    .first<{ player_name: string; changes_json: string }>();
  if (!correction) return null;

  const player = await getPlayerByName(db, correction.player_name);
  if (!player) {
    throw new Error("The player profile no longer exists.");
  }

  const changes = validateApprovedChanges(
    parseProfile(correction.changes_json),
  );
  const reviewedAt = new Date().toISOString();
  const results = await db.batch([
    db
      .prepare(
        `UPDATE Players
         SET date_of_birth = ?, biography_markdown = ?, pic_link = ?, foot = ?,
             height = ?, place_of_birth = ?, position = ?, secondary_position = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?
           AND EXISTS (
             SELECT 1 FROM PlayerProfileCorrections
             WHERE id = ? AND status = 'pending'
           )`,
      )
      .bind(
        changes.dateOfBirth !== undefined
          ? nullable(changes.dateOfBirth)
          : player.dateOfBirth,
        changes.biography !== undefined
          ? nullable(changes.biography)
          : player.biographyMarkdown,
        changes.picLink !== undefined
          ? nullable(changes.picLink)
          : player.picLink,
        changes.foot !== undefined ? nullable(changes.foot) : player.foot,
        changes.height !== undefined ? nullable(changes.height) : player.height,
        changes.placeOfBirth !== undefined
          ? nullable(changes.placeOfBirth)
          : player.placeOfBirth,
        changes.position !== undefined
          ? nullable(changes.position)
          : player.position,
        changes.secondaryPosition !== undefined
          ? nullable(changes.secondaryPosition)
          : player.secondaryPosition,
        player.id,
        id,
      ),
    db
      .prepare(
        `UPDATE PlayerProfileCorrections
         SET status = 'approved', reviewed_by = ?, reviewed_at = ?,
             review_note = ?
         WHERE id = ? AND status = 'pending'`,
      )
      .bind(reviewedBy, reviewedAt, reviewNote, id),
  ]);

  if (!results[0].meta.changes || !results[1].meta.changes) return null;
  return player;
}

function mapCorrection(
  row: DBPlayerProfileCorrection,
): PlayerProfileCorrection {
  return {
    id: row.id,
    playerName: row.player_name,
    current: parseProfile(row.current_json),
    changes: parseProfile(row.changes_json),
    source: row.source,
    explanation: row.explanation,
    submittedByAccountId: row.submitted_by_account_id,
    submittedByName: row.submitted_by_name,
    submittedByEmail: row.submitted_by_email,
    submittedAt: row.submitted_at,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    reviewNote: row.review_note,
  };
}

export async function getApprovedPlayerProfileChanges(
  db: D1Database,
  playerName: string,
) {
  await ensurePlayerProfileCorrectionsTable(db);
  const result = await db
    .prepare(
      `SELECT changes_json
       FROM PlayerProfileCorrections
       WHERE player_name = ? AND status = 'approved'
       ORDER BY reviewed_at ASC`,
    )
    .bind(playerName)
    .all<{ changes_json: string }>();

  return result.results.reduce<EditablePlayerProfile>(
    (profile, row) => ({ ...profile, ...parseProfile(row.changes_json) }),
    {},
  );
}

export async function getPlayerProfileCorrections(
  db: D1Database,
  status?: PlayerProfileCorrectionStatus,
) {
  await ensurePlayerProfileCorrectionsTable(db);
  const query = status
    ? db
        .prepare(
          `SELECT * FROM PlayerProfileCorrections
           WHERE status = ?
           ORDER BY submitted_at ASC`,
        )
        .bind(status)
    : db.prepare(
        `SELECT * FROM PlayerProfileCorrections
         ORDER BY submitted_at DESC`,
      );
  const result = await query.all<DBPlayerProfileCorrection>();
  return result.results.map(mapCorrection);
}

export function biographyToText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const node = value as { value?: unknown; content?: unknown[] };
  if (typeof node.value === "string") return node.value;
  if (!Array.isArray(node.content)) return "";

  return node.content
    .map((child) => biographyToText(child))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function textToBiography(text: string): Document {
  return {
    nodeType: "document",
    data: {},
    content: text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => ({
        nodeType: "paragraph",
        data: {},
        content: [
          {
            nodeType: "text",
            value: paragraph,
            marks: [],
            data: {},
          },
        ],
      })),
  } as Document;
}
