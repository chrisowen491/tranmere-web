import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalizeClubName } from './club-name-aliases.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sqlPackageDirectory = path.resolve(scriptDirectory, '..');
const inputDirectory = path.join(
  sqlPackageDirectory,
  'backups',
  'dynamodb',
  'games'
);
const outputDirectory = path.join(sqlPackageDirectory, 'generated');
const outputFile = path.join(outputDirectory, 'games.sql');
const reportFile = path.join(outputDirectory, 'games-report.json');
const rowsPerStatement = 100;

function unmarshall(attribute, source) {
  if (!attribute || typeof attribute !== 'object') return undefined;
  if (attribute.NULL === true) return null;
  if (typeof attribute.S === 'string') return attribute.S;
  if (typeof attribute.N === 'string') return attribute.N;
  throw new Error(`${source}: unsupported DynamoDB attribute`);
}

function requiredText(item, field, source) {
  const value = unmarshall(item[field], `${source}: ${field}`);
  if (value === undefined || value === null || value === '') {
    throw new Error(`${source}: missing ${field}`);
  }
  return value;
}

function optionalText(item, field, source) {
  const value = unmarshall(item[field], `${source}: ${field}`);
  if (value === undefined || value === null) return null;
  return value;
}

function optionalInteger(item, field, source) {
  const value = optionalText(item, field, source);
  if (value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new Error(`${source}: ${field} must be an integer`);
  }
  return number;
}

function parseGame(line, source) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    throw new Error(`${source}: invalid JSON`);
  }
  if (!record.Item) throw new Error(`${source}: missing Item`);

  const item = record.Item;
  const season = optionalInteger(item, 'season', source);
  const matchDate = requiredText(item, 'date', source);
  if (season === null || season < 1800 || season > 2200) {
    throw new Error(`${source}: invalid numeric season`);
  }

  return {
    id: requiredText(item, 'id', source),
    season,
    matchDate,
    competition: requiredText(item, 'competition', source),
    round: optionalText(item, 'round', source),
    homeTeam: canonicalizeClubName(requiredText(item, 'home', source)),
    awayTeam: canonicalizeClubName(requiredText(item, 'visitor', source)),
    opposition: canonicalizeClubName(requiredText(item, 'opposition', source)),
    venue: requiredText(item, 'venue', source),
    attendance: optionalInteger(item, 'attendance', source),
    fullTimeScore: requiredText(item, 'ft', source),
    homeGoals: optionalText(item, 'hgoal', source),
    awayGoals: optionalText(item, 'vgoal', source),
    division: optionalText(item, 'division', source),
    tier: optionalText(item, 'tier', source),
    leg: optionalText(item, 'leg', source),
    tie: optionalText(item, 'tie', source),
    neutral: optionalText(item, 'neutral', source),
    afterExtraTime: optionalText(item, 'aet', source),
    penalties: optionalText(item, 'pens', source),
    programmePath: optionalText(item, 'programme', source),
    formation: optionalText(item, 'formation', source),
    referee: optionalText(item, 'referee', source),
    ticket: optionalText(item, 'ticket', source)
  };
}

function sqlText(value) {
  if (value === null) return 'NULL';
  if (value.includes('\0')) {
    throw new Error('D1 text values cannot contain null bytes');
  }
  return `'${value.replaceAll("'", "''")}'`;
}

function gameValues(game) {
  return `(${[
    sqlText(game.id),
    game.season,
    sqlText(game.matchDate),
    sqlText(game.competition),
    sqlText(game.round),
    sqlText(game.homeTeam),
    sqlText(game.awayTeam),
    sqlText(game.opposition),
    sqlText(game.venue),
    game.attendance ?? 'NULL',
    sqlText(game.fullTimeScore),
    sqlText(game.homeGoals),
    sqlText(game.awayGoals),
    sqlText(game.division),
    sqlText(game.tier),
    sqlText(game.leg),
    sqlText(game.tie),
    sqlText(game.neutral),
    sqlText(game.afterExtraTime),
    sqlText(game.penalties),
    sqlText(game.programmePath),
    sqlText(game.formation),
    sqlText(game.referee),
    sqlText(game.ticket)
  ].join(', ')})`;
}

const files = (await readdir(inputDirectory))
  .filter((file) => file.endsWith('.json'))
  .sort();
if (files.length === 0) {
  throw new Error(`No DynamoDB JSON files found in ${inputDirectory}`);
}

const games = [];
const ids = new Set();
for (const file of files) {
  const contents = await readFile(path.join(inputDirectory, file), 'utf8');
  contents
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .forEach((line, index) => {
      const source = `${file}:${index + 1}`;
      const game = parseGame(line, source);
      if (ids.has(game.id)) {
        throw new Error(`${source}: duplicate game id ${game.id}`);
      }
      ids.add(game.id);
      games.push(game);
    });
}

games.sort(
  (a, b) =>
    a.matchDate.localeCompare(b.matchDate) ||
    a.homeTeam.localeCompare(b.homeTeam) ||
    a.id.localeCompare(b.id)
);

const statements = [];
for (let index = 0; index < games.length; index += rowsPerStatement) {
  const values = games
    .slice(index, index + rowsPerStatement)
    .map(gameValues)
    .join(',\n  ');
  statements.push(`INSERT INTO Games (
  id, season, match_date, competition, round, home_team, away_team,
  opposition, venue, attendance, full_time_score, home_goals, away_goals,
  division, tier, leg, tie, neutral, after_extra_time, penalties,
  programme_path, formation, referee, ticket
) VALUES
  ${values}
ON CONFLICT(id) DO UPDATE SET
  season = excluded.season,
  competition = excluded.competition,
  round = excluded.round,
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  opposition = excluded.opposition,
  venue = excluded.venue,
  attendance = excluded.attendance,
  full_time_score = excluded.full_time_score,
  home_goals = excluded.home_goals,
  away_goals = excluded.away_goals,
  division = excluded.division,
  tier = excluded.tier,
  leg = excluded.leg,
  tie = excluded.tie,
  neutral = excluded.neutral,
  after_extra_time = excluded.after_extra_time,
  penalties = excluded.penalties,
  programme_path = excluded.programme_path,
  formation = excluded.formation,
  referee = excluded.referee,
  ticket = excluded.ticket;`);
}

const sql = `-- Generated by scripts/dynamodb-games-to-d1.mjs
-- Source files: ${files.length}
-- Game records: ${games.length}
-- Deliberately omitted DynamoDB attributes: static, youtube.
-- This file is idempotent: existing records with the same ID are updated.

${statements.join('\n\n')}
`;
const report = {
  sourceFiles: files.length,
  records: games.length,
  omittedAttributes: ['static', 'youtube']
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(outputFile, sql, 'utf8'),
  writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
]);

console.log(
  `Generated ${games.length} games from ${files.length} files at ${outputFile}`
);
console.log(`Wrote migration report to ${reportFile}`);
