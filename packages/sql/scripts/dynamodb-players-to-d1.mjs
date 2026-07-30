import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sqlPackageDirectory = path.resolve(scriptDirectory, "..");
const inputDirectory = path.join(
  sqlPackageDirectory,
  "backups",
  "dynamodb",
  "players",
);
const outputDirectory = path.join(sqlPackageDirectory, "generated");
const outputFile = path.join(outputDirectory, "players.sql");
const reportFile = path.join(outputDirectory, "players-report.json");
const rowsPerStatement = 50;
const validPositions = new Set([
  "Goalkeeper",
  "Striker",
  "Winger",
  "Central Defender",
  "Central Midfielder",
  "Full Back",
]);
const validFeet = new Set(["Left", "Right"]);

function unmarshall(attribute) {
  if (!attribute || typeof attribute !== "object") return undefined;
  if ("NULL" in attribute && attribute.NULL) return null;
  if ("S" in attribute) return attribute.S;
  if ("N" in attribute) return Number(attribute.N);
  if ("BOOL" in attribute) return attribute.BOOL;
  if ("L" in attribute) return attribute.L.map(unmarshall);
  if ("M" in attribute) {
    return Object.fromEntries(
      Object.entries(attribute.M).map(([key, value]) => [
        key,
        unmarshall(value),
      ]),
    );
  }
  throw new Error(`Unsupported DynamoDB attribute: ${JSON.stringify(attribute)}`);
}

function unmarshallItem(item) {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [key, unmarshall(value)]),
  );
}

function escapeMarkdown(value) {
  return value
    .replaceAll("\\", "\\\\")
    .replace(/([`*_[\]<>])/g, "\\$1");
}

function renderText(node) {
  let value = escapeMarkdown(node.value || "");
  for (const mark of node.marks || []) {
    if (mark.type === "bold") value = `**${value}**`;
    if (mark.type === "italic") value = `*${value}*`;
    if (mark.type === "underline") value = `<u>${value}</u>`;
    if (mark.type === "code") value = `\`${value.replaceAll("`", "\\`")}\``;
  }
  return value;
}

function renderInline(node) {
  if (!node) return "";
  if (node.nodeType === "text") return renderText(node);
  const content = (node.content || []).map(renderInline).join("");
  if (node.nodeType === "hyperlink" && node.data?.uri) {
    return `[${content}](${node.data.uri})`;
  }
  return content;
}

function indent(value, prefix) {
  return value
    .split("\n")
    .map((line, index) => `${index === 0 ? prefix : " ".repeat(prefix.length)}${line}`)
    .join("\n");
}

function renderBlock(node) {
  if (!node) return "";
  if (node.nodeType === "text" || node.nodeType === "hyperlink") {
    return renderInline(node);
  }

  const inline = () => (node.content || []).map(renderInline).join("").trim();
  if (node.nodeType === "paragraph") return inline();
  if (/^heading-[1-6]$/.test(node.nodeType)) {
    const level = Number(node.nodeType.slice(-1));
    return `${"#".repeat(level)} ${inline()}`;
  }
  if (node.nodeType === "blockquote") {
    return (node.content || [])
      .map(renderBlock)
      .join("\n\n")
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  }
  if (node.nodeType === "hr") return "---";
  if (node.nodeType === "unordered-list" || node.nodeType === "ordered-list") {
    return (node.content || [])
      .map((item, index) =>
        indent(renderBlock(item), node.nodeType === "ordered-list" ? `${index + 1}. ` : "- "),
      )
      .join("\n");
  }
  if (node.nodeType === "list-item") {
    return (node.content || []).map(renderBlock).filter(Boolean).join("\n");
  }
  return (node.content || []).map(renderBlock).filter(Boolean).join("\n\n");
}

function richTextToMarkdown(document) {
  if (!document) return null;
  const markdown = renderBlock(document)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return markdown || null;
}

function optionalString(item, field, source) {
  const value = item[field];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new Error(`${source}: ${field} must be a string or null`);
  }
  return value;
}

function requiredString(item, field, source) {
  const value = optionalString(item, field, source);
  if (!value) throw new Error(`${source}: missing ${field}`);
  return value;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function parsePlayer(line, source) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    throw new Error(`${source}: invalid JSON`);
  }
  if (!record.Item) throw new Error(`${source}: missing Item`);
  const item = unmarshallItem(record.Item);
  const dateOfBirth = optionalString(item, "dateOfBirth", source);
  const foot = optionalString(item, "foot", source);
  const position = optionalString(item, "position", source);
  const links = item.links ?? [];

  if (dateOfBirth && !validDate(dateOfBirth)) {
    throw new Error(`${source}: invalid dateOfBirth ${dateOfBirth}`);
  }
  if (foot && !validFeet.has(foot)) {
    throw new Error(`${source}: invalid foot ${foot}`);
  }
  if (position && !validPositions.has(position)) {
    throw new Error(`${source}: invalid position ${position}`);
  }
  if (!Array.isArray(links) || links.some((link) => typeof link !== "string")) {
    throw new Error(`${source}: links must be a list of strings`);
  }

  return {
    id: requiredString(item, "id", source),
    name: requiredString(item, "name", source),
    dateOfBirth,
    biographyMarkdown: richTextToMarkdown(item.biography),
    picLink: optionalString(item, "picLink", source),
    foot,
    height: optionalString(item, "height", source),
    placeOfBirth: optionalString(item, "placeOfBirth", source),
    position,
    links,
  };
}

function sqlString(value) {
  if (value === null) return "NULL";
  if (value.includes("\0")) {
    throw new Error("D1 text values cannot contain null bytes");
  }
  return `'${value.replaceAll("'", "''")}'`;
}

function playerValues(player) {
  return `(${[
    sqlString(player.id),
    sqlString(player.name),
    sqlString(player.dateOfBirth),
    sqlString(player.biographyMarkdown),
    sqlString(player.picLink),
    sqlString(player.foot),
    sqlString(player.height),
    sqlString(player.placeOfBirth),
    sqlString(player.position),
    sqlString(JSON.stringify(player.links)),
  ].join(", ")})`;
}

const files = (await readdir(inputDirectory))
  .filter((file) => file.endsWith(".json"))
  .sort();
if (files.length === 0) {
  throw new Error(`No DynamoDB JSON files found in ${inputDirectory}`);
}

const players = [];
const ids = new Set();
for (const file of files) {
  const contents = await readFile(path.join(inputDirectory, file), "utf8");
  const lines = contents.split(/\r?\n/).filter((line) => line.trim());
  lines.forEach((line, index) => {
    const source = `${file}:${index + 1}`;
    const player = parsePlayer(line, source);
    if (ids.has(player.id)) {
      throw new Error(`${source}: duplicate player id ${player.id}`);
    }
    ids.add(player.id);
    players.push(player);
  });
}

players.sort(
  (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
);

function completeness(player) {
  return [
    player.dateOfBirth,
    player.biographyMarkdown,
    player.picLink,
    player.foot,
    player.height,
    player.placeOfBirth,
    player.position,
  ].filter(Boolean).length;
}

function preferredPlayer(current, candidate) {
  if (!current) return candidate;
  const fieldDifference = completeness(candidate) - completeness(current);
  if (fieldDifference !== 0) {
    return fieldDifference > 0 ? candidate : current;
  }
  const biographyDifference =
    (candidate.biographyMarkdown?.length || 0) -
    (current.biographyMarkdown?.length || 0);
  if (biographyDifference !== 0) {
    return biographyDifference > 0 ? candidate : current;
  }
  return candidate.id.localeCompare(current.id) < 0 ? candidate : current;
}

const sourcePlayers = [...players];
const preferredByName = new Map();
sourcePlayers.forEach((player) => {
  preferredByName.set(
    player.name,
    preferredPlayer(preferredByName.get(player.name), player),
  );
});
players.splice(
  0,
  players.length,
  ...[...preferredByName.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  ),
);

const statements = [];
for (let index = 0; index < players.length; index += rowsPerStatement) {
  const values = players
    .slice(index, index + rowsPerStatement)
    .map(playerValues)
    .join(",\n  ");
  statements.push(`INSERT INTO Players (
  id,
  name,
  date_of_birth,
  biography_markdown,
  pic_link,
  foot,
  height,
  place_of_birth,
  position,
  links_json
) VALUES
  ${values}
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  date_of_birth = excluded.date_of_birth,
  biography_markdown = excluded.biography_markdown,
  pic_link = excluded.pic_link,
  foot = excluded.foot,
  height = excluded.height,
  place_of_birth = excluded.place_of_birth,
  position = excluded.position,
  links_json = excluded.links_json;`);
}

const nameCounts = new Map();
sourcePlayers.forEach((player) =>
  nameCounts.set(player.name, (nameCounts.get(player.name) || 0) + 1),
);
const duplicateNames = [...nameCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([name, count]) => ({ name, count }));
const fieldCounts = Object.fromEntries(
  [
    "dateOfBirth",
    "biographyMarkdown",
    "picLink",
    "foot",
    "height",
    "placeOfBirth",
    "position",
  ].map((field) => [
    field,
    players.filter((player) => player[field] !== null).length,
  ]),
);

const sql = `-- Generated by scripts/dynamodb-players-to-d1.mjs
-- Source files: ${files.length}
-- Player records: ${players.length}
-- Biography rich text is converted to Markdown.
-- This file is idempotent: existing records with the same id are updated.

${statements.join("\n\n")}
`;
const report = {
  sourceFiles: files.length,
  sourceRecords: sourcePlayers.length,
  records: players.length,
  fieldCounts,
  duplicateNames,
  discardedDuplicateRecords: sourcePlayers
    .filter((player) => preferredByName.get(player.name)?.id !== player.id)
    .map((player) => ({ id: player.id, name: player.name })),
  biographyCharacters: players.reduce(
    (total, player) => total + (player.biographyMarkdown?.length || 0),
    0,
  ),
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(outputFile, sql, "utf8"),
  writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, "utf8"),
]);

console.log(
  `Generated ${players.length} players from ${files.length} files at ${outputFile}`,
);
console.log(`Wrote migration report to ${reportFile}`);
