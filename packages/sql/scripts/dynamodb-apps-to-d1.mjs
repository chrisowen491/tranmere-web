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
  'apps'
);
const outputDirectory = path.join(sqlPackageDirectory, 'generated');
const outputFile = path.join(outputDirectory, 'apps.sql');
const reportFile = path.join(outputDirectory, 'apps-report.json');
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

function optionalInteger(item, field, source) {
  const value = optionalString(item, field, source);
  if (value === null) return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error(`${source}: invalid ${field}`);
  }
  return number;
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

function parseApp(line, source) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    throw new Error(`${source}: invalid JSON`);
  }
  if (!record.Item) throw new Error(`${source}: missing Item`);

  const item = record.Item;
  const season = Number(requiredString(item, 'Season', source));
  const matchDate = requiredString(item, 'Date', source);
  if (!Number.isSafeInteger(season) || season < 1800 || season > 2200) {
    throw new Error(`${source}: invalid Season ${season}`);
  }
  if (!validDate(matchDate)) {
    throw new Error(`${source}: invalid Date ${matchDate}`);
  }

  return {
    id: requiredString(item, 'id', source),
    season,
    matchDate,
    playerName: requiredString(item, 'Name', source),
    competition: optionalString(item, 'Competition', source),
    opposition: canonicalizeClubName(requiredString(item, 'Opposition', source)),
    shirtNumber: optionalInteger(item, 'Number', source),
    yellowCard: flag(item, 'YellowCard', source),
    redCard: flag(item, 'RedCard', source),
    substituteYellowCard: flag(item, 'SubYellow', source),
    substituteRedCard: flag(item, 'SubRed', source),
    substituteTime: optionalString(item, 'SubTime', source),
    substitutedBy: optionalString(item, 'SubbedBy', source),
    substituteSubstitutedBy: optionalString(item, 'SubSubbedBy', source)
  };
}

function sqlText(value) {
  if (value === null) return 'NULL';
  return `'${value.replaceAll("'", "''")}'`;
}

function values(app) {
  return `(${[
    sqlText(app.id),
    app.season,
    sqlText(app.matchDate),
    sqlText(app.playerName),
    sqlText(app.competition),
    sqlText(app.opposition),
    app.shirtNumber ?? 'NULL',
    app.yellowCard,
    app.redCard,
    app.substituteYellowCard,
    app.substituteRedCard,
    sqlText(app.substituteTime),
    sqlText(app.substitutedBy),
    sqlText(app.substituteSubstitutedBy)
  ].join(', ')})`;
}

const files = (await readdir(inputDirectory))
  .filter((file) => file.endsWith('.json'))
  .sort();
if (files.length === 0) {
  throw new Error(`No DynamoDB JSON files found in ${inputDirectory}`);
}

const apps = [];
const ids = new Set();
for (const file of files) {
  const contents = await readFile(path.join(inputDirectory, file), 'utf8');
  contents
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .forEach((line, index) => {
      const source = `${file}:${index + 1}`;
      const app = parseApp(line, source);
      if (ids.has(app.id)) {
        throw new Error(`${source}: duplicate appearance ID ${app.id}`);
      }
      ids.add(app.id);
      apps.push(app);
    });
}

apps.sort(
  (a, b) =>
    a.matchDate.localeCompare(b.matchDate) ||
    a.playerName.localeCompare(b.playerName) ||
    a.id.localeCompare(b.id)
);

const statements = [];
for (let index = 0; index < apps.length; index += rowsPerStatement) {
  const batch = apps.slice(index, index + rowsPerStatement);
  statements.push(`INSERT INTO Apps (
  id, season, match_date, player_name, competition, opposition, shirt_number,
  yellow_card, red_card, substitute_yellow_card, substitute_red_card,
  substitute_time, substituted_by, substitute_substituted_by
) VALUES
  ${batch.map(values).join(',\n  ')}
ON CONFLICT(id) DO UPDATE SET
  season = excluded.season,
  match_date = excluded.match_date,
  player_name = excluded.player_name,
  competition = excluded.competition,
  opposition = excluded.opposition,
  shirt_number = excluded.shirt_number,
  yellow_card = excluded.yellow_card,
  red_card = excluded.red_card,
  substitute_yellow_card = excluded.substitute_yellow_card,
  substitute_red_card = excluded.substitute_red_card,
  substitute_time = excluded.substitute_time,
  substituted_by = excluded.substituted_by,
  substitute_substituted_by = excluded.substitute_substituted_by;`);
}

const sql = `-- Generated by scripts/dynamodb-apps-to-d1.mjs
-- Source files: ${files.length}
-- Appearance records: ${apps.length}
-- Deliberately omitted DynamoDB attributes: TimeToLive, field11, field13, opposition.
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
        records: apps.length,
        omittedAttributes: ['TimeToLive', 'field11', 'field13', 'opposition']
      },
      null,
      2
    )}\n`,
    'utf8'
  )
]);

console.log(
  `Generated ${apps.length} appearances from ${files.length} files at ${outputFile}`
);
console.log(`Wrote migration report to ${reportFile}`);
