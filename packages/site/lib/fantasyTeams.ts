import { AVATAR_KIT_OPTIONS } from "@tranmere-web/lib/src/avatar-kit-constants";
import type { FantasyTeamRow, PlayerRow } from "@tranmere-web/lib/src/d1-types";

export type FantasyFormation = "442" | "433";

export type FantasyAssignment = {
  slotId: string;
  position: string;
  playerId: string;
  playerName: string;
};

export type FantasyTeam = {
  id: string;
  name: string;
  rationale: string;
  formation: FantasyFormation;
  kit: string;
  captainPlayerId: string | null;
  assignments: FantasyAssignment[];
  shareId: string | null;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
};

export const FANTASY_FORMATIONS: Record<
  FantasyFormation,
  { id: string; position: string }[][]
> = {
  "442": [
    [
      { id: "f1", position: "ST" },
      { id: "f2", position: "ST" },
    ],
    [
      { id: "m1", position: "LM" },
      { id: "m2", position: "CM" },
      { id: "m3", position: "CM" },
      { id: "m4", position: "RM" },
    ],
    [
      { id: "d1", position: "LB" },
      { id: "d2", position: "CB" },
      { id: "d3", position: "CB" },
      { id: "d4", position: "RB" },
    ],
    [{ id: "g1", position: "GK" }],
  ],
  "433": [
    [
      { id: "f1", position: "LW" },
      { id: "f2", position: "ST" },
      { id: "f3", position: "RW" },
    ],
    [
      { id: "m1", position: "CM" },
      { id: "m2", position: "CM" },
      { id: "m3", position: "CM" },
    ],
    [
      { id: "d1", position: "LB" },
      { id: "d2", position: "CB" },
      { id: "d3", position: "CB" },
      { id: "d4", position: "RB" },
    ],
    [{ id: "g1", position: "GK" }],
  ],
};

export type FantasyTeamInput = Omit<
  FantasyTeam,
  "id" | "shareId" | "isShared" | "createdAt" | "updatedAt"
>;

function parseAssignments(value: string): FantasyAssignment[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is FantasyAssignment => {
      if (!item || typeof item !== "object") return false;
      const row = item as Record<string, unknown>;
      return ["slotId", "position", "playerId", "playerName"].every(
        (key) => typeof row[key] === "string",
      );
    });
  } catch {
    return [];
  }
}

export function mapFantasyTeam(row: FantasyTeamRow): FantasyTeam {
  return {
    id: row.id,
    name: row.name,
    rationale: row.rationale ?? "",
    formation: row.formation,
    kit: row.kit,
    captainPlayerId: row.captain_player_id,
    assignments: parseAssignments(row.assignments_json),
    shareId: row.share_id,
    isShared: row.is_shared === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const columns = `id, account_id, name, rationale, formation, kit,
  captain_player_id, assignments_json, share_id, is_shared, created_at, updated_at`;

export async function listFantasyTeams(db: D1Database, accountId: string) {
  const result = await db
    .prepare(
      `SELECT ${columns} FROM FantasyTeams WHERE account_id = ? ORDER BY updated_at DESC`,
    )
    .bind(accountId)
    .all<FantasyTeamRow>();
  return result.results.map(mapFantasyTeam);
}

export async function getOwnedFantasyTeam(
  db: D1Database,
  id: string,
  accountId: string,
) {
  const row = await db
    .prepare(
      `SELECT ${columns} FROM FantasyTeams WHERE id = ? AND account_id = ?`,
    )
    .bind(id, accountId)
    .first<FantasyTeamRow>();
  return row ? mapFantasyTeam(row) : null;
}

export async function getSharedFantasyTeam(db: D1Database, shareId: string) {
  const row = await db
    .prepare(
      `SELECT ${columns} FROM FantasyTeams WHERE share_id = ? AND is_shared = 1`,
    )
    .bind(shareId)
    .first<FantasyTeamRow>();
  return row ? mapFantasyTeam(row) : null;
}

export async function validateFantasyTeamInput(db: D1Database, value: unknown) {
  if (!value || typeof value !== "object")
    throw new Error("Invalid team data.");
  const input = value as Partial<FantasyTeamInput>;
  const name = input.name?.trim();
  if (!name || name.length > 80)
    throw new Error("Give the XI a name of up to 80 characters.");
  if (input.formation !== "442" && input.formation !== "433")
    throw new Error("Choose a recognised formation.");
  const kit = input.kit;
  if (!kit || !AVATAR_KIT_OPTIONS.some((option) => option.value === kit))
    throw new Error("Choose a recognised kit.");
  if (!Array.isArray(input.assignments) || input.assignments.length !== 11)
    throw new Error("Complete all 11 positions before saving.");
  const slots = new Map(
    FANTASY_FORMATIONS[input.formation]
      .flat()
      .map((slot) => [slot.id, slot.position]),
  );
  const slotIds = new Set<string>();
  const playerIds = new Set<string>();
  for (const assignment of input.assignments) {
    if (
      slots.get(assignment.slotId) !== assignment.position ||
      slotIds.has(assignment.slotId)
    )
      throw new Error("The positional assignments are invalid.");
    if (!assignment.playerId || playerIds.has(assignment.playerId))
      throw new Error("A player can only be selected once.");
    slotIds.add(assignment.slotId);
    playerIds.add(assignment.playerId);
  }
  const placeholders = [...playerIds].map(() => "?").join(",");
  const found = await db
    .prepare(
      `SELECT COUNT(DISTINCT id) AS count FROM Players WHERE id IN (${placeholders})`,
    )
    .bind(...playerIds)
    .first<{ count: number }>();
  if (found?.count !== 11)
    throw new Error(
      "One or more selected players are no longer in the TranmereWeb database.",
    );
  const rationale = input.rationale?.trim() ?? "";
  if (rationale.length > 600)
    throw new Error("Keep the rationale to 600 characters or fewer.");
  const captainPlayerId =
    input.captainPlayerId && playerIds.has(input.captainPlayerId)
      ? input.captainPlayerId
      : null;
  return {
    name,
    rationale,
    formation: input.formation,
    kit,
    captainPlayerId,
    assignments: input.assignments,
  } satisfies FantasyTeamInput;
}

export async function hydrateFantasyTeam(db: D1Database, team: FantasyTeam) {
  const ids = [
    ...new Set(team.assignments.map((assignment) => assignment.playerId)),
  ];
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  const result = await db
    .prepare(
      `SELECT id, name, pic_link FROM Players WHERE id IN (${placeholders})`,
    )
    .bind(...ids)
    .all<Pick<PlayerRow, "id" | "name" | "pic_link">>();
  const current = new Map(result.results.map((player) => [player.id, player]));
  return team.assignments.map((assignment) => ({
    ...assignment,
    playerName: current.get(assignment.playerId)?.name ?? assignment.playerName,
    picLink: current.get(assignment.playerId)?.pic_link ?? null,
    missing: !current.has(assignment.playerId),
  }));
}
