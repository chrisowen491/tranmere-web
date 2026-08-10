import { queryTransferRows } from "@tranmere-web/lib/src/d1-queries";
import type { TransferRow } from "@tranmere-web/lib/src/d1-types";
import type { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";

export interface TransferInput {
  playerName: string;
  season: number;
  fromClub: string;
  toClub: string;
  feeDescription: string;
  cost: number;
  date: string | null;
}

export interface TransferFilters {
  season?: string;
  club?: string;
  filter?: string;
  playerName?: string;
  sort?: "date-desc" | "fee-desc";
  limit?: number;
  offset?: number;
}

export function mapTransfer(row: TransferRow): Transfer {
  const type = row.from_club !== "Tranmere Rovers" ? "in" : "out";
  return {
    id: row.id,
    name: row.player_name,
    season: row.season,
    date: row.transfer_date || undefined,
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
      `SELECT id, player_name, season, from_club, to_club, fee_description, cost,
              transfer_date
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
        id, player_name, season, from_club, to_club, fee_description, cost,
        transfer_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      transfer.playerName,
      transfer.season,
      transfer.fromClub,
      transfer.toClub,
      transfer.feeDescription,
      transfer.cost,
      transfer.date,
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
           fee_description = ?, cost = ?, transfer_date = ?
       WHERE id = ?`,
    )
    .bind(
      transfer.playerName,
      transfer.season,
      transfer.fromClub,
      transfer.toClub,
      transfer.feeDescription,
      transfer.cost,
      transfer.date,
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
  const season =
    filters.season && /^\d{4}$/.test(filters.season)
      ? Number(filters.season)
      : undefined;
  const rows = await queryTransferRows(db, {
    player: filters.playerName,
    playerMatch: "contains",
    season,
    club: filters.club,
    direction:
      filters.filter === "In" || filters.filter === "Out"
        ? filters.filter
        : undefined,
    sort: filters.sort,
    limit: filters.limit,
    offset: filters.offset,
  });

  return rows.map(mapTransfer);
}
