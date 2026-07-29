import type { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";

export interface TransferRow {
  id: string;
  player_name: string;
  season: number;
  from_club: string;
  to_club: string;
  fee_description: string;
  cost: number;
}

export interface TransferInput {
  playerName: string;
  season: number;
  fromClub: string;
  toClub: string;
  feeDescription: string;
  cost: number;
}

export interface TransferFilters {
  season?: string;
  club?: string;
  filter?: string;
  playerName?: string;
}

export function mapTransfer(row: TransferRow): Transfer {
  const type = row.from_club !== "Tranmere Rovers" ? "in" : "out";
  return {
    id: row.id,
    name: row.player_name,
    season: row.season,
    from: row.from_club,
    to: row.to_club,
    value: row.fee_description,
    cost: row.cost,
    type,
    club: type === "in" ? row.from_club : row.to_club,
  };
}

export async function getTransferById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, player_name, season, from_club, to_club, fee_description, cost
       FROM Transfers
       WHERE id = ?`,
    )
    .bind(id)
    .first<TransferRow>();
  return row ? mapTransfer(row) : null;
}

export async function createTransfer(
  db: D1Database,
  id: string,
  transfer: TransferInput,
) {
  await db
    .prepare(
      `INSERT INTO Transfers (
        id, player_name, season, from_club, to_club, fee_description, cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      transfer.playerName,
      transfer.season,
      transfer.fromClub,
      transfer.toClub,
      transfer.feeDescription,
      transfer.cost,
    )
    .run();
  return getTransferById(db, id);
}

export async function updateTransfer(
  db: D1Database,
  id: string,
  transfer: TransferInput,
) {
  const result = await db
    .prepare(
      `UPDATE Transfers
       SET player_name = ?, season = ?, from_club = ?, to_club = ?,
           fee_description = ?, cost = ?
       WHERE id = ?`,
    )
    .bind(
      transfer.playerName,
      transfer.season,
      transfer.fromClub,
      transfer.toClub,
      transfer.feeDescription,
      transfer.cost,
      id,
    )
    .run();
  if (!result.meta.changes) return null;
  return getTransferById(db, id);
}

export async function getTransfers(
  db: D1Database,
  filters: TransferFilters = {},
) {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filters.playerName) {
    conditions.push("player_name = ?");
    values.push(filters.playerName);
  }

  if (filters.season && /^\d{4}$/.test(filters.season)) {
    conditions.push("season = ?");
    values.push(Number(filters.season));
  }

  if (filters.filter === "In") {
    conditions.push("to_club = ?");
    values.push("Tranmere Rovers");
    if (filters.club) {
      conditions.push("from_club = ?");
      values.push(filters.club);
    }
  } else if (filters.filter === "Out") {
    conditions.push("from_club = ?");
    values.push("Tranmere Rovers");
    if (filters.club) {
      conditions.push("to_club = ?");
      values.push(filters.club);
    }
  } else if (filters.club) {
    conditions.push("(from_club = ? OR to_club = ?)");
    values.push(filters.club, filters.club);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const statement = db.prepare(
    `SELECT id, player_name, season, from_club, to_club, fee_description, cost
     FROM Transfers
     ${where}
     ORDER BY cost DESC, season DESC, player_name ASC`,
  );
  const result = await (
    values.length ? statement.bind(...values) : statement
  ).all<TransferRow>();

  return result.results.map(mapTransfer);
}
