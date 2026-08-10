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
  'goals'
);
const outputDirectory = path.join(sqlPackageDirectory, 'generated');
const outputFile = path.join(outputDirectory, 'goals.sql');
const reportFile = path.join(outputDirectory, 'goals-report.json');
const rowsPerStatement = 100;

function readAttribute(item, field) {
  const attribute = item?.[field];
  if (!attribute || typeof attribute !== 'object') return undefined;
  if (attribute.NULL === true) return null;
  if (typeof attribute.S === 'string') return attribute.S;
  if (typeof attribute.N === 'string') return attribute.N;
  return undefined;
}

function requiredString(item, field, source) {
  const value = readAttribute(item, field);
  if (typeof value !== 'string' || value === '') {
    throw new Error(`${source}: missing ${field}`);
  }
  if (value.includes('\0')) {
    throw new Error(`${source}: ${field} contains a null byte`);
  }
  return value;
}

function optionalString(item, field, source) {
  const value = readAttribute(item, field);
  if (value === undefined || value === null || value === '') return null;
  if (value.includes('\0')) {
    throw new Error(`${source}: ${field} contains a null byte`);
  }
  return value;
}

function flag(item, field, source) {
  const value = optionalString(item, field, source);
  if (value === null) return 0;
  if (value === 'TRUE') return 1;
  throw new Error(`${source}: invalid ${field} flag ${value}`);
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function parseGoal(record, source) {
  if (!record.Item) throw new Error(`${source}: missing Item`);

  const item = record.Item;
  const matchDate = requiredString(item, 'Date', source);
  if (!validDate(matchDate)) {
    throw new Error(`${source}: invalid Date ${matchDate}`);
  }
  const season = Number(requiredString(item, 'Season', source));

  return {
    id: requiredString(item, 'id', source),
    season,
    matchDate,
    scorer: requiredString(item, 'Scorer', source),
    opposition: canonicalizeClubName(requiredString(item, 'Opposition', source)),
    competition: optionalString(item, 'Competition', source),
    minute: optionalString(item, 'Minute', source),
    goalType: optionalString(item, 'GoalType', source),
    assist: optionalString(item, 'Assist', source),
    assistType:
      optionalString(item, 'AssistType', source) ??
      optionalString(item, 'AssitsType', source),
    foot: optionalString(item, 'Foot', source),
    sixYardBox: flag(item, '6YardBox', source),
    eighteenYardBox: flag(item, '18YardBox', source),
    crossSide: optionalString(item, 'CrossSide', source),
    longRange: flag(item, 'LongRange', source)
  };
}

function sqlText(value) {
  if (value === null) return 'NULL';
  return `'${value.replaceAll("'", "''")}'`;
}

function values(goal) {
  return `(${[
    sqlText(goal.id),
    goal.season,
    sqlText(goal.matchDate),
    sqlText(goal.scorer),
    sqlText(goal.opposition),
    sqlText(goal.competition),
    sqlText(goal.minute),
    sqlText(goal.goalType),
    sqlText(goal.assist),
    sqlText(goal.assistType),
    sqlText(goal.foot),
    goal.sixYardBox,
    goal.eighteenYardBox,
    sqlText(goal.crossSide),
    goal.longRange
  ].join(', ')})`;
}

const files = (await readdir(inputDirectory))
  .filter((file) => file.endsWith('.json'))
  .sort();
if (files.length === 0) {
  throw new Error(`No DynamoDB JSON files found in ${inputDirectory}`);
}

const goals = [];
const ids = new Set();
const skippedSeasons = [];
for (const file of files) {
  const contents = await readFile(path.join(inputDirectory, file), 'utf8');
  contents
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .forEach((line, index) => {
      const source = `${file}:${index + 1}`;
      let rawRecord;
      try {
        rawRecord = JSON.parse(line);
      } catch {
        throw new Error(`${source}: invalid JSON`);
      }
      const rawSeason = rawRecord.Item?.Season?.S;
      if (!/^(18|19|20|21)\d{2}$/.test(rawSeason ?? '')) {
        skippedSeasons.push({ source, season: rawSeason });
        return;
      }

      const goal = parseGoal(rawRecord, source);
      if (ids.has(goal.id)) {
        throw new Error(`${source}: duplicate goal ID ${goal.id}`);
      }
      ids.add(goal.id);
      goals.push(goal);
    });
}

goals.sort(
  (a, b) =>
    a.matchDate.localeCompare(b.matchDate) ||
    a.scorer.localeCompare(b.scorer) ||
    a.id.localeCompare(b.id)
);

const statements = [];
for (let index = 0; index < goals.length; index += rowsPerStatement) {
  const batch = goals.slice(index, index + rowsPerStatement);
  statements.push(`INSERT INTO Goals (
  id, season, match_date, scorer, opposition, competition, minute, goal_type,
  assist, assist_type, foot, six_yard_box, eighteen_yard_box, cross_side,
  long_range
) VALUES
  ${batch.map(values).join(',\n  ')}
ON CONFLICT(id) DO UPDATE SET
  season = excluded.season,
  match_date = excluded.match_date,
  scorer = excluded.scorer,
  opposition = excluded.opposition,
  competition = excluded.competition,
  minute = excluded.minute,
  goal_type = excluded.goal_type,
  assist = excluded.assist,
  assist_type = excluded.assist_type,
  foot = excluded.foot,
  six_yard_box = excluded.six_yard_box,
  eighteen_yard_box = excluded.eighteen_yard_box,
  cross_side = excluded.cross_side,
  long_range = excluded.long_range;`);
}

const sql = `-- Generated by scripts/dynamodb-goals-to-d1.mjs
-- Source files: ${files.length}
-- Goal records: ${goals.length}
-- Skipped malformed season values: ${skippedSeasons.length}
-- This file is idempotent: existing records with the same ID are updated.

${statements.join('\n\n')}
`;

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(outputFile, sql, 'utf8'),
  writeFile(
    reportFile,
    `${JSON.stringify(
      {
        sourceFiles: files.length,
        records: goals.length,
        skippedSeasons
      },
      null,
      2
    )}\n`,
    'utf8'
  )
]);

console.log(
  `Generated ${goals.length} goals from ${files.length} files at ${outputFile}`
);
console.log(`Skipped ${skippedSeasons.length} malformed season values`);
console.log(`Wrote migration report to ${reportFile}`);
