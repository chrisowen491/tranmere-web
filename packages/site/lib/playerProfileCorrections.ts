import type { Document } from "@contentful/rich-text-types";

export type PlayerProfileCorrectionStatus = "pending" | "approved" | "rejected";

export const playerPositions = [
  "Goalkeeper",
  "Striker",
  "Winger",
  "Central Defender",
  "Central Midfielder",
  "Full Back",
] as const;

export interface EditablePlayerProfile {
  dateOfBirth?: string;
  biography?: string;
  picLink?: string;
  foot?: string;
  height?: string;
  placeOfBirth?: string;
  position?: string;
}

export interface PlayerProfileCorrection {
  id: string;
  playerName: string;
  current: EditablePlayerProfile;
  changes: EditablePlayerProfile;
  source: string;
  explanation: string | null;
  submittedBySub: string;
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
  submitted_by_sub: string;
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
        submitted_by_sub TEXT NOT NULL,
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
    submittedBySub: row.submitted_by_sub,
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
