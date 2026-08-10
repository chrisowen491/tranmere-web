import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalizeClubName } from './club-name-aliases.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sqlPackageDirectory = path.resolve(scriptDirectory, '..');
const backupsDirectory = path.join(sqlPackageDirectory, 'backups', 'dynamodb');
const inputDirectory = path.join(backupsDirectory, 'clubs');
const managersDirectory = path.join(backupsDirectory, 'managers');
const outputDirectory = path.join(sqlPackageDirectory, 'generated');
const outputFile = path.join(outputDirectory, 'clubs.sql');
const rowsPerStatement = 100;

function readString(item, name, source, optional = false) {
  const attribute = item?.[name];
  if (optional && (!attribute || attribute.NULL === true)) return null;
  if (!attribute || typeof attribute.S !== 'string') {
    throw new Error(`${source}: missing ${name}.S`);
  }
  return attribute.S;
}

function readOptionalScalar(item, name, source) {
  const attribute = item?.[name];
  if (!attribute || attribute.NULL === true) return null;
  if (typeof attribute.S === 'string') return attribute.S;
  if (typeof attribute.N === 'string') return attribute.N;
  throw new Error(`${source}: missing ${name}.S or ${name}.N`);
}

function normalizeOptional(value) {
  if (value === null || value.trim() === '' || value.trim() === 'NA') {
    return null;
  }
  return value.trim();
}

function parseOptionalNumber(value, source, field) {
  const normalized = normalizeOptional(value);
  if (normalized === null) return null;
  const number = Number(normalized);
  if (!Number.isFinite(number)) {
    throw new Error(`${source}: invalid ${field} ${value}`);
  }
  return number;
}

function sqlValue(value) {
  if (value === null) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (value.includes('\0')) {
    throw new Error('D1 text values cannot contain null bytes');
  }
  return `'${value.replaceAll("'", "''")}'`;
}

function parseClub(line, source) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    throw new Error(`${source}: invalid JSON`);
  }

  const item = record.Item;
  const highestDivisionValue = readString(item, 'highest_div', source, true);
  const highestDivision = parseOptionalNumber(
    highestDivisionValue,
    source,
    'highest_div'
  );
  if (
    highestDivision !== null &&
    (!Number.isInteger(highestDivision) ||
      highestDivision < 1 ||
      highestDivision > 20)
  ) {
    throw new Error(`${source}: invalid highest_div ${highestDivision}`);
  }

  return {
    id: readString(item, 'id', source),
    name: canonicalizeClubName(readString(item, 'name', source).trim()),
    shortName: normalizeOptional(readString(item, 'short_name', source, true)),
    threeLetterName: normalizeOptional(
      readString(item, 'three_letter_name', source, true)
    ),
    nicknames: normalizeOptional(readString(item, 'nicknames', source, true)),
    primaryColour: normalizeOptional(readString(item, 'col1', source, true)),
    secondaryColour: normalizeOptional(readString(item, 'col2', source, true)),
    highestDivision,
    latitude: parseOptionalNumber(
      readOptionalScalar(item, 'lat', source),
      source,
      'lat'
    ),
    longitude: parseOptionalNumber(
      readOptionalScalar(item, 'lon', source),
      source,
      'lon'
    )
  };
}

function clubValues(club) {
  return `(${[
    club.id,
    club.name,
    club.shortName,
    club.threeLetterName,
    club.nicknames,
    club.primaryColour,
    club.secondaryColour,
    club.highestDivision,
    club.latitude,
    club.longitude
  ]
    .map(sqlValue)
    .join(', ')})`;
}

async function readJsonLines(directory) {
  const files = (await readdir(directory))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const records = [];

  for (const file of files) {
    const contents = await readFile(path.join(directory, file), 'utf8');
    contents
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .forEach((line, index) => {
        records.push({ file, line, lineNumber: index + 1 });
      });
  }

  return { files, records };
}

const clubBackup = await readJsonLines(inputDirectory);
if (clubBackup.files.length === 0) {
  throw new Error(`No DynamoDB JSON files found in ${inputDirectory}`);
}

const managerBackup = await readJsonLines(managersDirectory);
const managerIds = new Set(
  managerBackup.records.map(({ file, line, lineNumber }) => {
    const source = `${file}:${lineNumber}`;
    try {
      return readString(JSON.parse(line).Item, 'id', source);
    } catch {
      throw new Error(`${source}: invalid manager record`);
    }
  })
);

const clubs = [];
const ids = new Set();
const names = new Set();
let excludedManagerRows = 0;

for (const { file, line, lineNumber } of clubBackup.records) {
  const source = `${file}:${lineNumber}`;
  const club = parseClub(line, source);
  if (managerIds.has(club.id)) {
    excludedManagerRows += 1;
    continue;
  }
  if (!club.name) throw new Error(`${source}: club name is empty`);
  if (ids.has(club.id)) {
    throw new Error(`${source}: duplicate club id ${club.id}`);
  }
  if (names.has(club.name)) {
    throw new Error(`${source}: duplicate club name ${club.name}`);
  }
  ids.add(club.id);
  names.add(club.name);
  clubs.push(club);
}

clubs.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

const statements = [];
for (let index = 0; index < clubs.length; index += rowsPerStatement) {
  const values = clubs
    .slice(index, index + rowsPerStatement)
    .map(clubValues)
    .join(',\n  ');

  statements.push(`INSERT INTO Clubs (
  id,
  name,
  short_name,
  three_letter_name,
  nicknames,
  primary_colour,
  secondary_colour,
  highest_division,
  latitude,
  longitude
) VALUES
  ${values}
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  short_name = excluded.short_name,
  three_letter_name = excluded.three_letter_name,
  nicknames = excluded.nicknames,
  primary_colour = excluded.primary_colour,
  secondary_colour = excluded.secondary_colour,
  highest_division = excluded.highest_division,
  latitude = excluded.latitude,
  longitude = excluded.longitude;`);
}

const sql = `-- Generated by scripts/dynamodb-clubs-to-d1.mjs
-- Source files: ${clubBackup.files.length}
-- Club records: ${clubs.length}
-- Excluded manager records: ${excludedManagerRows}
-- Legacy empty and NA values are stored as NULL.
-- This file is idempotent: existing records with the same id are updated.

${statements.join('\n\n')}
`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFile, sql, 'utf8');

console.log(
  `Generated ${clubs.length} clubs from ${clubBackup.files.length} files ` +
    `(${excludedManagerRows} manager rows excluded) at ${outputFile}`
);
