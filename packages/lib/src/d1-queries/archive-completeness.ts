import type {
  ArchiveCompletenessCategory,
  ArchiveCompletenessGapRow,
  ArchiveCompletenessRow
} from '../d1-types';
import { all, type D1DatabaseReader } from './shared';

export async function queryArchiveCompletenessRows(
  db: D1DatabaseReader,
  season?: number
) {
  const where = season === undefined ? '' : 'WHERE season = ?';
  return (
    await all<ArchiveCompletenessRow>(
      db,
      `SELECT season, category, complete_count, total_count, updated_at
       FROM ArchiveCompleteness
       ${where}
       ORDER BY season DESC, category ASC`,
      season === undefined ? [] : [season]
    )
  ).results;
}

const tranmereGoals = `
  CASE
    WHEN Games.home_team = 'Tranmere Rovers' THEN
      CASE WHEN Games.home_goals GLOB '[0-9]*' THEN CAST(Games.home_goals AS INTEGER)
           ELSE CAST(TRIM(SUBSTR(Games.full_time_score, 1, INSTR(Games.full_time_score, '-') - 1)) AS INTEGER) END
    ELSE
      CASE WHEN Games.away_goals GLOB '[0-9]*' THEN CAST(Games.away_goals AS INTEGER)
           ELSE CAST(TRIM(SUBSTR(Games.full_time_score, INSTR(Games.full_time_score, '-') + 1)) AS INTEGER) END
  END
`;

function matchGapCondition(category: ArchiveCompletenessCategory) {
  switch (category) {
    case 'lineups':
      return `(SELECT COUNT(*) FROM Apps WHERE Apps.season = Games.season AND Apps.match_date = Games.match_date) < 11`;
    case 'goals':
      return `(SELECT COUNT(*) FROM Goals WHERE Goals.season = Games.season AND Goals.match_date = Games.match_date) < (${tranmereGoals})`;
    case 'attendances':
      return `(Games.attendance IS NULL OR Games.attendance <= 0)`;
    case 'formations':
      return `(Games.formation IS NULL OR TRIM(Games.formation) = '')`;
    case 'programmes':
      return `(Games.no_programme_issued = 0 AND (Games.programme_path IS NULL OR TRIM(Games.programme_path) = '' OR Games.programme_path = '#N/A'))`;
    case 'kits':
      return `(Games.kit IS NULL OR TRIM(Games.kit) = '')`;
    case 'match-reports':
      return `NOT EXISTS (SELECT 1 FROM MatchReports WHERE MatchReports.match_date = Games.match_date)`;
    default:
      return null;
  }
}

export async function queryArchiveCompletenessGaps(
  db: D1DatabaseReader,
  season: number,
  category: ArchiveCompletenessCategory,
  limit = 50
) {
  if (category === 'player-profiles') {
    return (
      await all<ArchiveCompletenessGapRow>(
        db,
        `WITH season_players AS (
           SELECT player_name AS name FROM Apps WHERE season = ?
           UNION
           SELECT substituted_by AS name FROM Apps
           WHERE season = ? AND substituted_by IS NOT NULL AND TRIM(substituted_by) <> ''
         )
         SELECT season_players.name AS entity_id,
                season_players.name AS entity_name,
                NULL AS match_date,
                NULL AS opposition
         FROM season_players
         LEFT JOIN Players ON Players.name = season_players.name
         WHERE season_players.name <> 'Own Goal'
           AND (Players.id IS NULL OR Players.biography_markdown IS NULL OR TRIM(Players.biography_markdown) = '')
         ORDER BY season_players.name ASC
         LIMIT ?`,
        [season, season, limit]
      )
    ).results;
  }

  if (category === 'goal-details') {
    return (
      await all<ArchiveCompletenessGapRow>(
        db,
        `SELECT Goals.id AS entity_id,
                Goals.scorer AS entity_name,
                Goals.match_date,
                Goals.opposition
         FROM Goals
         WHERE Goals.season = ?
           AND (Goals.minute IS NULL OR TRIM(Goals.minute) = '' OR Goals.goal_type IS NULL OR TRIM(Goals.goal_type) = '')
         ORDER BY Goals.match_date DESC, Goals.scorer ASC, Goals.id ASC
         LIMIT ?`,
        [season, limit]
      )
    ).results;
  }

  const condition = matchGapCondition(category);
  if (!condition) return [];
  return (
    await all<ArchiveCompletenessGapRow>(
      db,
      `SELECT Games.id AS entity_id,
              Games.home_team || ' v ' || Games.away_team AS entity_name,
              Games.match_date,
              Games.opposition
       FROM Games
       WHERE Games.season = ? AND ${condition}
       ORDER BY Games.match_date DESC, Games.id ASC
       LIMIT ?`,
      [season, limit]
    )
  ).results;
}
