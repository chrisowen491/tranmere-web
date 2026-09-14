import { HONOURS_SEASONS } from "@tranmere-web/lib/src/honours-constants";
import type { ManagerRecord } from "@/lib/managers";
import { getManagers } from "@/lib/managers";

type ManagerGameRow = {
  manager_id: string;
  id: string;
  season: number;
  match_date: string;
  opposition: string;
  home_team: string;
  away_team: string;
  full_time_score: string;
  home_goals: string | null;
  away_goals: string | null;
  formation: string | null;
};

type ManagerPlayerRow = {
  manager_id: string;
  player_name: string;
  selections: number;
};

type TransferLineageRow = {
  player_name: string;
  season: number;
  from_club: string;
  to_club: string;
  fee_description: string;
  cost: number;
  transfer_date: string | null;
};

export type ManagerLineageLink = { id: string; name: string };

export interface ManagerLineageEntry {
  manager: ManagerRecord;
  previous: ManagerLineageLink | null;
  next: ManagerLineageLink | null;
  tenureLabels: string[];
  games: number;
  playersUsed: number;
  inheritedPlayers: { name: string; selections: number }[];
  preferredFormation: string | null;
  commonFormations: { formation: string; games: number }[];
  keyResult: {
    date: string;
    season: number;
    opposition: string;
    score: string;
    margin: number;
  } | null;
  transfers: {
    player: string;
    direction: "In" | "Out";
    otherClub: string;
    season: number;
    fee: string;
  }[];
  honours: {
    title: string;
    detail: string;
    kind: string;
    achievedOn: string;
    href?: string;
  }[];
}

function isPresent(value: string) {
  return /^(now|present)/i.test(value.trim());
}

function dateOnly(value: string) {
  return value.slice(0, 10);
}

function managerEnd(manager: ManagerRecord, today: string) {
  return isPresent(manager.dateLeft) ? today : dateOnly(manager.dateLeft);
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly(value));
}

export function managerForDate(
  managers: ManagerRecord[],
  date: string,
  today = new Date().toISOString().slice(0, 10),
) {
  return [...managers]
    .filter(
      (manager) =>
        dateOnly(manager.dateJoined) <= date &&
        managerEnd(manager, today) >= date,
    )
    .sort(
      (left, right) =>
        dateOnly(right.dateJoined).localeCompare(dateOnly(left.dateJoined)) ||
        right.name.localeCompare(left.name),
    )[0];
}

export function managerTenureLabels(manager: ManagerRecord) {
  const labels: string[] = [];
  const role = manager.name.match(/\(([^)]+)\)/)?.[1];
  if (role) labels.push(role);
  if (/\b(caretaker|interim)\b/i.test(manager.name) && !role)
    labels.push("Interim");
  if (
    !isIsoDate(manager.dateJoined) ||
    (!isPresent(manager.dateLeft) && !isIsoDate(manager.dateLeft))
  )
    labels.push("Dates uncertain");
  return [...new Set(labels)];
}

function scoreParts(game: ManagerGameRow) {
  const fallback = game.full_time_score.match(/(\d+)\D+(\d+)/);
  return {
    home: Number(game.home_goals ?? fallback?.[1] ?? 0),
    away: Number(game.away_goals ?? fallback?.[2] ?? 0),
  };
}

export function deriveManagerLineage(
  managers: ManagerRecord[],
  games: ManagerGameRow[],
  players: ManagerPlayerRow[],
  transfers: TransferLineageRow[],
  today = new Date().toISOString().slice(0, 10),
) {
  const chronological = [...managers].sort(
    (left, right) =>
      dateOnly(left.dateJoined).localeCompare(dateOnly(right.dateJoined)) ||
      left.name.localeCompare(right.name),
  );
  const gamesByManager = new Map<string, ManagerGameRow[]>();
  games.forEach((game) => {
    const rows = gamesByManager.get(game.manager_id) ?? [];
    rows.push(game);
    gamesByManager.set(game.manager_id, rows);
  });
  const playersByManager = new Map<string, Map<string, number>>();
  players.forEach((player) => {
    const totals = playersByManager.get(player.manager_id) ?? new Map();
    totals.set(player.player_name, Number(player.selections));
    playersByManager.set(player.manager_id, totals);
  });
  const transfersByManager = new Map<string, TransferLineageRow[]>();
  transfers.forEach((transfer) => {
    const approximateDate =
      transfer.transfer_date ?? `${transfer.season}-07-01`;
    const manager = managerForDate(chronological, approximateDate, today);
    if (!manager) return;
    const rows = transfersByManager.get(manager.id) ?? [];
    rows.push(transfer);
    transfersByManager.set(manager.id, rows);
  });

  return chronological.map((manager, index): ManagerLineageEntry => {
    const previous = chronological[index - 1];
    const next = chronological[index + 1];
    const managerGames = gamesByManager.get(manager.id) ?? [];
    const managerPlayers = playersByManager.get(manager.id) ?? new Map();
    const previousPlayers = previous
      ? (playersByManager.get(previous.id) ?? new Map())
      : new Map<string, number>();
    const formationTotals = new Map<string, number>();
    managerGames.forEach((game) => {
      const formation = game.formation?.trim();
      if (formation)
        formationTotals.set(
          formation,
          (formationTotals.get(formation) ?? 0) + 1,
        );
    });
    const commonFormations = [...formationTotals]
      .map(([formation, formationGames]) => ({
        formation,
        games: formationGames,
      }))
      .sort(
        (left, right) =>
          right.games - left.games ||
          left.formation.localeCompare(right.formation),
      )
      .slice(0, 3);
    const wins = managerGames
      .map((game) => {
        const { home, away } = scoreParts(game);
        const isHome = game.home_team === "Tranmere Rovers";
        const scored = isHome ? home : away;
        const conceded = isHome ? away : home;
        return { game, margin: scored - conceded };
      })
      .filter(({ margin }) => margin > 0)
      .sort(
        (left, right) =>
          right.margin - left.margin ||
          right.game.match_date.localeCompare(left.game.match_date),
      );
    const best = wins[0];
    const managerTransfers = (transfersByManager.get(manager.id) ?? [])
      .sort(
        (left, right) =>
          right.cost - left.cost ||
          (right.transfer_date ?? "").localeCompare(left.transfer_date ?? ""),
      )
      .slice(0, 3)
      .map((transfer) => {
        const incoming = transfer.to_club === "Tranmere Rovers";
        return {
          player: transfer.player_name,
          direction: incoming ? ("In" as const) : ("Out" as const),
          otherClub: incoming ? transfer.from_club : transfer.to_club,
          season: transfer.season,
          fee: transfer.fee_description,
        };
      });
    const honours = HONOURS_SEASONS.flatMap(({ achievements }) => achievements)
      .filter(
        (achievement) =>
          managerForDate(chronological, achievement.achievedOn, today)?.id ===
          manager.id,
      )
      .map((achievement) => ({ ...achievement }));

    return {
      manager,
      previous: previous ? { id: previous.id, name: previous.name } : null,
      next: next ? { id: next.id, name: next.name } : null,
      tenureLabels: managerTenureLabels(manager),
      games: managerGames.length,
      playersUsed: managerPlayers.size,
      inheritedPlayers: [...managerPlayers]
        .filter(([name]) => previousPlayers.has(name))
        .map(([name, selections]) => ({ name, selections }))
        .sort(
          (left, right) =>
            right.selections - left.selections ||
            left.name.localeCompare(right.name),
        )
        .slice(0, 8),
      preferredFormation: manager.favouriteFormation ?? null,
      commonFormations,
      keyResult: best
        ? {
            date: best.game.match_date,
            season: best.game.season,
            opposition: best.game.opposition,
            score: best.game.full_time_score,
            margin: best.margin,
          }
        : null,
      transfers: managerTransfers,
      honours,
    };
  });
}

export async function getManagerLineage(db: D1Database) {
  const managers = await getManagers(db);
  const [gameResult, playerResult, transferResult] = await Promise.all([
    db
      .prepare(
        `SELECT m.id AS manager_id, g.id, g.season, g.match_date, g.opposition,
                g.home_team, g.away_team, g.full_time_score, g.home_goals,
                g.away_goals, g.formation
         FROM Games g
         JOIN Managers m ON m.id = (
           SELECT m2.id FROM Managers m2
           WHERE substr(m2.date_joined, 1, 10) <= g.match_date
             AND (lower(trim(m2.date_left)) IN ('now', 'now()', 'present')
                  OR substr(m2.date_left, 1, 10) >= g.match_date)
           ORDER BY substr(m2.date_joined, 1, 10) DESC, m2.name DESC
           LIMIT 1
         )
         WHERE lower(trim(g.competition)) <> 'friendly'
         ORDER BY g.match_date`,
      )
      .all<ManagerGameRow>(),
    db
      .prepare(
        `WITH player_selections AS (
           SELECT match_date, player_name, competition FROM Apps
           UNION ALL
           SELECT match_date, substituted_by, competition FROM Apps
           WHERE substituted_by IS NOT NULL AND trim(substituted_by) <> ''
           UNION ALL
           SELECT match_date, substitute_substituted_by, competition FROM Apps
           WHERE substitute_substituted_by IS NOT NULL
             AND trim(substitute_substituted_by) <> ''
         ), assigned AS (
           SELECT player_name,
                  (SELECT m.id FROM Managers m
                   WHERE substr(m.date_joined, 1, 10) <= selection.match_date
                     AND (lower(trim(m.date_left)) IN ('now', 'now()', 'present')
                          OR substr(m.date_left, 1, 10) >= selection.match_date)
                   ORDER BY substr(m.date_joined, 1, 10) DESC, m.name DESC
                   LIMIT 1) AS manager_id
           FROM player_selections selection
           WHERE lower(trim(coalesce(competition, ''))) <> 'friendly'
         )
         SELECT manager_id, player_name, count(*) AS selections
         FROM assigned
         WHERE manager_id IS NOT NULL
         GROUP BY manager_id, player_name`,
      )
      .all<ManagerPlayerRow>(),
    db
      .prepare(
        `SELECT player_name, season, from_club, to_club, fee_description, cost,
                transfer_date
         FROM Transfers
         ORDER BY season, transfer_date, player_name`,
      )
      .all<TransferLineageRow>(),
  ]);
  return deriveManagerLineage(
    managers,
    gameResult.results,
    playerResult.results,
    transferResult.results,
  );
}
