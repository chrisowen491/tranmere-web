import {
  queryGameBySeasonAndDate,
  queryGameRows,
  queryMatchReportRow,
  type GameQueryOptions,
} from "@tranmere-web/lib/src/d1-queries";
import type { GameRow } from "@tranmere-web/lib/src/d1-types";
import type {
  H2HResult,
  H2HTotal,
  Match,
} from "@tranmere-web/lib/src/tranmere-web-types";

export type GameSearchOptions = GameQueryOptions;

function scorePart(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function scoreFromFullTime(value: string, index: number) {
  const score = value.match(/(\d+)\D+(\d+)/);
  return score ? Number(score[index + 1]) : 0;
}

export function mapGame(row: GameRow): Match {
  const homeGoals = scorePart(
    row.home_goals,
    scoreFromFullTime(row.full_time_score, 0),
  );
  const awayGoals = scorePart(
    row.away_goals,
    scoreFromFullTime(row.full_time_score, 1),
  );
  return {
    id: row.id,
    date: row.match_date,
    division: row.division || undefined,
    competition: row.competition,
    programme:
      row.programme_path && row.programme_path !== "#N/A"
        ? row.programme_path
        : undefined,
    noProgrammeIssued: row.no_programme_issued === 1,
    ticket: row.ticket && row.ticket !== "#N/A" ? row.ticket : undefined,
    pens: row.penalties || undefined,
    home: row.home_team,
    visitor: row.away_team,
    opposition: row.opposition,
    venue: row.venue,
    season: String(row.season),
    hgoal: homeGoals,
    vgoal: awayGoals,
    ft: row.full_time_score,
    attendance: row.attendance,
    referee: row.referee || undefined,
    formation: row.formation || undefined,
    kit: row.kit || undefined,
    round:
      row.round && Number.isFinite(Number(row.round))
        ? Number(row.round)
        : undefined,
    tier: Number(row.tier) || 0,
    location: row.neutral
      ? "N"
      : row.home_team === "Tranmere Rovers"
        ? "H"
        : "A",
  };
}

function emptyRecord(venue: string): H2HResult {
  return {
    venue,
    pld: 0,
    wins: 0,
    draws: 0,
    lost: 0,
    for: 0,
    against: 0,
    diff: 0,
  };
}

function venueLabel(match: Match) {
  return match.location === "H"
    ? "Home"
    : match.location === "N"
      ? "Neutral"
      : "Away";
}

export function getHeadToHead(matches: Match[]) {
  const byVenue = new Map<string, H2HResult>();
  const total = emptyRecord("Total");
  for (const match of matches) {
    const venue = venueLabel(match);
    const record = byVenue.get(venue) || emptyRecord(venue);
    const scored = match.location === "H" ? match.hgoal : match.vgoal;
    const conceded = match.location === "H" ? match.vgoal : match.hgoal;
    for (const target of [record, total]) {
      target.pld += 1;
      target.for += scored;
      target.against += conceded;
      if (scored > conceded) target.wins += 1;
      else if (scored < conceded) target.lost += 1;
      else target.draws += 1;
      target.diff = target.for - target.against;
    }
    byVenue.set(venue, record);
  }
  return {
    h2hresults: [...byVenue.values()],
    h2htotal: matches.length ? ([total] as H2HTotal[]) : [],
  };
}

export async function searchGames(
  db: D1Database,
  options: GameSearchOptions = {},
) {
  const matches = (await queryGameRows(db, options)).map(mapGame);
  return { results: matches, ...getHeadToHead(matches) };
}

export async function getGameBySeasonAndDate(
  db: D1Database,
  season: string | number,
  date: string,
) {
  const row = await queryGameBySeasonAndDate(db, Number(season), date);
  return row ? mapGame(row) : null;
}

export async function getLatestPlayedGame(db: D1Database, dateTo: string) {
  const [row] = await queryGameRows(db, {
    dateTo,
    playedOnly: true,
    sort: "date-desc",
    limit: 1,
  });
  return row ? mapGame(row) : null;
}

export async function getMatchReport(db: D1Database, date: string) {
  return queryMatchReportRow(db, date);
}
