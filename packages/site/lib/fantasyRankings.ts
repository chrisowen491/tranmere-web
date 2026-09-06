import type { FantasyRankingRow } from "@tranmere-web/lib/src/d1-types";

export function getFantasyPlayerOfSeasonWinners(rankings: FantasyRankingRow[]) {
  const winningScore = rankings[0]?.total_points;
  if (winningScore === undefined) return [];

  return rankings.filter((player) => player.total_points === winningScore);
}
