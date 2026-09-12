import { MATCH_EVENT_FANTASY_POINTS } from "@tranmere-web/lib/src/match-event-constants";
import type { FantasyTeam } from "@/lib/fantasyTeams";

export interface ChallengeMatch {
  id: string;
  season: number;
  matchDate: string;
  opposition: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  competition: string;
}

export interface ChallengePlayerScore {
  playerId: string;
  playerName: string;
  position: string;
  points: number;
  matchPoints: number[];
  captain: boolean;
}

export interface ChallengeTeamResult {
  name: string;
  total: number;
  players: ChallengePlayerScore[];
}

export interface FantasyChallenge {
  id: string;
  challenger: ChallengeTeamResult;
  opponent: ChallengeTeamResult;
  matches: ChallengeMatch[];
  createdAt: string;
}

export interface FantasyChallengeLeagueRecord {
  id: string;
  challengerTeamId: string;
  opponentTeamId: string;
  challenger: ChallengeTeamResult;
  opponent: ChallengeTeamResult;
  createdAt: string;
}

export interface FantasyChallengeStanding {
  teamId: string;
  name: string;
  shareId: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  scoreDifference: number;
  leaguePoints: number;
}

export interface FantasyChallengeLeague {
  standings: FantasyChallengeStanding[];
  recentResults: FantasyChallengeLeagueRecord[];
}

type AppRow = {
  season: number;
  match_date: string;
  player_name: string;
  yellow_card: number;
  red_card: number;
  substitute_yellow_card: number;
  substitute_red_card: number;
  substitute_time: string | null;
  substituted_by: string | null;
  substitute_substituted_by: string | null;
};
type GoalRow = {
  season: number;
  match_date: string;
  scorer: string;
  assist: string | null;
};
type EventRow = {
  season: number;
  match_date: string;
  player_name: string;
  event_type: keyof typeof MATCH_EVENT_FANTASY_POINTS;
};
type PlayerPositionRow = { id: string; position: string | null };

const key = (season: number, date: string) => `${season}:${date}`;
const cleanName = (name: string | null) =>
  name?.trim().toLocaleLowerCase() ?? "";
const minute = (value: string | null) => {
  const parsed = Number.parseInt(value ?? "60", 10);
  return Number.isFinite(parsed) ? parsed : 60;
};
const fantasyPosition = (position: string | null) => {
  if (position === "Goalkeeper") return "Goalkeeper";
  if (
    [
      "Central Defender",
      "Full Back",
      "Left Back",
      "Right Back",
      "Sweeper",
    ].includes(position ?? "")
  )
    return "Defender";
  if (
    [
      "Central Midfielder",
      "Defensive Midfield",
      "Attacking Midfield",
      "Right Midfield",
      "Left Midfield",
      "Wing Half",
      "Winger",
    ].includes(position ?? "")
  )
    return "Midfielder";
  return "Forward";
};
const goalPoints = (position: string) =>
  position === "Goalkeeper"
    ? 10
    : position === "Defender"
      ? 6
      : position === "Midfielder"
        ? 5
        : 4;
const cleanSheetPoints = (position: string) =>
  position === "Goalkeeper" || position === "Defender"
    ? 4
    : position === "Midfielder"
      ? 1
      : 0;

function snapshot(team: FantasyTeam) {
  return {
    id: team.id,
    name: team.name,
    captainPlayerId: team.captainPlayerId,
    assignments: team.assignments,
  };
}

export function scoreChallengeTeam(
  team: ReturnType<typeof snapshot>,
  matches: ChallengeMatch[],
  positions: Map<string, string | null>,
  apps: AppRow[],
  goals: GoalRow[],
  events: EventRow[],
): ChallengeTeamResult {
  const players = team.assignments.map((assignment) => {
    const name = cleanName(assignment.playerName);
    const position = fantasyPosition(
      positions.get(assignment.playerId) ?? null,
    );
    const matchPoints = matches.map((match) => {
      const matchKey = key(match.season, match.matchDate);
      let points = 0;
      let cleanSheetEligible = false;
      for (const app of apps.filter(
        (row) => key(row.season, row.match_date) === matchKey,
      )) {
        if (cleanName(app.player_name) === name) {
          points += app.substituted_by
            ? minute(app.substitute_time) >= 60
              ? 2
              : 1
            : 2;
          points -= app.yellow_card + app.red_card * 3;
          cleanSheetEligible =
            !app.substituted_by || minute(app.substitute_time) >= 60;
        }
        if (cleanName(app.substituted_by) === name) {
          points += app.substitute_substituted_by
            ? 1
            : minute(app.substitute_time) <= 30
              ? 2
              : 1;
          points -= app.substitute_yellow_card + app.substitute_red_card * 3;
          cleanSheetEligible =
            !app.substitute_substituted_by && minute(app.substitute_time) <= 30;
        }
        if (cleanName(app.substitute_substituted_by) === name) points += 1;
      }
      for (const goal of goals.filter(
        (row) => key(row.season, row.match_date) === matchKey,
      )) {
        if (cleanName(goal.scorer) === name && name !== "own goal")
          points += goalPoints(position);
        if (cleanName(goal.assist) === name) points += 3;
      }
      for (const event of events.filter(
        (row) =>
          key(row.season, row.match_date) === matchKey &&
          cleanName(row.player_name) === name,
      ))
        points += MATCH_EVENT_FANTASY_POINTS[event.event_type] ?? 0;
      const conceded =
        match.homeTeam === "Tranmere Rovers"
          ? Number(match.score.split("-")[1])
          : Number(match.score.split("-")[0]);
      if (cleanSheetEligible && conceded === 0)
        points += cleanSheetPoints(position);
      return assignment.playerId === team.captainPlayerId ? points * 2 : points;
    });
    return {
      playerId: assignment.playerId,
      playerName: assignment.playerName,
      position,
      matchPoints,
      points: matchPoints.reduce((sum, value) => sum + value, 0),
      captain: assignment.playerId === team.captainPlayerId,
    };
  });
  return {
    name: team.name,
    total: players.reduce((sum, player) => sum + player.points, 0),
    players,
  };
}

export async function createFantasyChallenge(
  db: D1Database,
  accountId: string,
  challenger: FantasyTeam,
  opponent: FantasyTeam,
) {
  const names = [
    ...new Set(
      [...challenger.assignments, ...opponent.assignments]
        .map((item) => item.playerName.trim())
        .filter(Boolean),
    ),
  ];
  const placeholders = names.map(() => "?").join(",");
  const matchRows = await db
    .prepare(
      `SELECT DISTINCT g.id, g.season, g.match_date, g.opposition, g.home_team, g.away_team, g.full_time_score, g.competition FROM Games g WHERE g.season >= 1960 AND LOWER(TRIM(g.competition)) <> 'friendly' AND EXISTS (SELECT 1 FROM Apps a WHERE a.season = g.season AND a.match_date = g.match_date AND (LOWER(TRIM(a.player_name)) IN (${placeholders}) OR LOWER(TRIM(COALESCE(a.substituted_by, ''))) IN (${placeholders}) OR LOWER(TRIM(COALESCE(a.substitute_substituted_by, ''))) IN (${placeholders}))) ORDER BY RANDOM() LIMIT 5`,
    )
    .bind(
      ...names.map(cleanName),
      ...names.map(cleanName),
      ...names.map(cleanName),
    )
    .all<{
      id: string;
      season: number;
      match_date: string;
      opposition: string;
      home_team: string;
      away_team: string;
      full_time_score: string;
      competition: string;
    }>();
  if (matchRows.results.length < 5)
    throw new Error(
      "There are not enough eligible recorded matches for these two XIs.",
    );
  const matches = matchRows.results.map((row) => ({
    id: row.id,
    season: Number(row.season),
    matchDate: row.match_date,
    opposition: row.opposition,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    score: row.full_time_score,
    competition: row.competition,
  }));
  const clauses = matches
    .map(() => "(season = ? AND match_date = ?)")
    .join(" OR ");
  const values = matches.flatMap((match) => [match.season, match.matchDate]);
  const ids = [
    ...new Set(
      [...challenger.assignments, ...opponent.assignments].map(
        (item) => item.playerId,
      ),
    ),
  ];
  const idPlaceholders = ids.map(() => "?").join(",");
  const [appRows, goalRows, eventRows, positionRows] = await Promise.all([
    db
      .prepare(
        `SELECT season, match_date, player_name, yellow_card, red_card, substitute_yellow_card, substitute_red_card, substitute_time, substituted_by, substitute_substituted_by FROM Apps WHERE ${clauses}`,
      )
      .bind(...values)
      .all<AppRow>(),
    db
      .prepare(
        `SELECT season, match_date, scorer, assist FROM Goals WHERE ${clauses}`,
      )
      .bind(...values)
      .all<GoalRow>(),
    db
      .prepare(
        `SELECT season, match_date, player_name, event_type FROM MatchEvents WHERE ${clauses}`,
      )
      .bind(...values)
      .all<EventRow>(),
    db
      .prepare(
        `SELECT id, position FROM Players WHERE id IN (${idPlaceholders})`,
      )
      .bind(...ids)
      .all<PlayerPositionRow>(),
  ]);
  const positions = new Map(
    positionRows.results.map((row) => [row.id, row.position]),
  );
  const challengerSnapshot = snapshot(challenger);
  const opponentSnapshot = snapshot(opponent);
  const result = {
    challenger: scoreChallengeTeam(
      challengerSnapshot,
      matches,
      positions,
      appRows.results,
      goalRows.results,
      eventRows.results,
    ),
    opponent: scoreChallengeTeam(
      opponentSnapshot,
      matches,
      positions,
      appRows.results,
      goalRows.results,
      eventRows.results,
    ),
  };
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO FantasyChallenges (id, created_by_account_id, challenger_team_id, opponent_team_id, challenger_snapshot_json, opponent_snapshot_json, matches_json, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      accountId,
      challenger.id,
      opponent.id,
      JSON.stringify(challengerSnapshot),
      JSON.stringify(opponentSnapshot),
      JSON.stringify(matches),
      JSON.stringify(result),
      createdAt,
    )
    .run();
  return { id, ...result, matches, createdAt } satisfies FantasyChallenge;
}

export async function getFantasyChallenge(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, matches_json, result_json, created_at FROM FantasyChallenges WHERE id = ?`,
    )
    .bind(id)
    .first<{
      id: string;
      matches_json: string;
      result_json: string;
      created_at: string;
    }>();
  if (!row) return null;
  const result = JSON.parse(row.result_json) as Pick<
    FantasyChallenge,
    "challenger" | "opponent"
  >;
  return {
    id: row.id,
    ...result,
    matches: JSON.parse(row.matches_json) as ChallengeMatch[],
    createdAt: row.created_at,
  } satisfies FantasyChallenge;
}

export function buildFantasyChallengeStandings(
  records: FantasyChallengeLeagueRecord[],
  sharedTeams: Map<string, string> = new Map(),
) {
  const standings = new Map<string, FantasyChallengeStanding>();
  const addResult = (
    teamId: string,
    name: string,
    pointsFor: number,
    pointsAgainst: number,
  ) => {
    const standing = standings.get(teamId) ?? {
      teamId,
      name,
      shareId: sharedTeams.get(teamId) ?? null,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      scoreDifference: 0,
      leaguePoints: 0,
    };
    standing.played += 1;
    standing.pointsFor += pointsFor;
    standing.pointsAgainst += pointsAgainst;
    standing.scoreDifference = standing.pointsFor - standing.pointsAgainst;
    if (pointsFor > pointsAgainst) {
      standing.won += 1;
      standing.leaguePoints += 3;
    } else if (pointsFor === pointsAgainst) {
      standing.drawn += 1;
      standing.leaguePoints += 1;
    } else {
      standing.lost += 1;
    }
    standings.set(teamId, standing);
  };

  for (const record of records) {
    addResult(
      record.challengerTeamId,
      record.challenger.name,
      record.challenger.total,
      record.opponent.total,
    );
    addResult(
      record.opponentTeamId,
      record.opponent.name,
      record.opponent.total,
      record.challenger.total,
    );
  }

  return [...standings.values()].sort(
    (a, b) =>
      b.leaguePoints - a.leaguePoints ||
      b.scoreDifference - a.scoreDifference ||
      b.pointsFor - a.pointsFor ||
      b.won - a.won ||
      a.name.localeCompare(b.name),
  );
}

export async function getFantasyChallengeLeague(
  db: D1Database,
): Promise<FantasyChallengeLeague> {
  const rows = await db
    .prepare(
      `SELECT id, challenger_team_id, opponent_team_id, result_json, created_at FROM FantasyChallenges ORDER BY created_at DESC`,
    )
    .all<{
      id: string;
      challenger_team_id: string;
      opponent_team_id: string;
      result_json: string;
      created_at: string;
    }>();
  const records = rows.results.flatMap((row) => {
    try {
      const result = JSON.parse(row.result_json) as Pick<
        FantasyChallenge,
        "challenger" | "opponent"
      >;
      return [
        {
          id: row.id,
          challengerTeamId: row.challenger_team_id,
          opponentTeamId: row.opponent_team_id,
          challenger: result.challenger,
          opponent: result.opponent,
          createdAt: row.created_at,
        },
      ];
    } catch {
      return [];
    }
  });
  const teamIds = [
    ...new Set(
      records.flatMap((record) => [
        record.challengerTeamId,
        record.opponentTeamId,
      ]),
    ),
  ];
  const sharedTeams = new Map<string, string>();
  if (teamIds.length > 0) {
    const sharedRows = await db
      .prepare(
        `SELECT id, share_id FROM FantasyTeams WHERE is_shared = 1 AND id IN (${teamIds.map(() => "?").join(",")})`,
      )
      .bind(...teamIds)
      .all<{ id: string; share_id: string }>();
    for (const row of sharedRows.results) sharedTeams.set(row.id, row.share_id);
  }
  return {
    standings: buildFantasyChallengeStandings(records, sharedTeams),
    recentResults: records.slice(0, 20),
  };
}
