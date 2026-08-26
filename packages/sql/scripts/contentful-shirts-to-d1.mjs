import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sqlPackageDirectory = path.resolve(scriptDirectory, '..');
const siteDirectory = path.resolve(sqlPackageDirectory, '../site');
const outputDirectory = path.join(sqlPackageDirectory, 'generated');
const outputFile = path.join(outputDirectory, 'shirts.sql');

async function loadLocalEnvironment() {
  try {
    const source = await readFile(
      path.join(siteDirectory, '.env.local'),
      'utf8'
    );
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

function sqlValue(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  if (typeof value === 'number') return String(value);
  const text = String(value);
  if (text.includes('\0')) throw new Error('D1 text cannot contain null bytes');
  return `'${text.replaceAll("'", "''")}'`;
}

function values(items) {
  return items.map(sqlValue).join(', ');
}

await loadLocalEnvironment();

const space = process.env.CF_SPACE;
const token = process.env.CF_KEY;
if (!space || !token) {
  throw new Error(
    'CF_SPACE and CF_KEY are required to import Contentful shirts'
  );
}

const query = `query ShirtExport {
  shirtCollection(where: { slug_exists: true }, limit: 100) {
    items {
      sys { id }
      slug
      name
      manufacturer
      description { json }
      use
      color
      decade
      seasons
      variants
      imagesCollection(limit: 20) {
        items { url title description }
      }
    }
  }
}`;

const response = await fetch(
  `https://graphql.contentful.com/content/v1/spaces/${encodeURIComponent(space)}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  }
);

if (!response.ok) {
  throw new Error(`Contentful shirt export failed with ${response.status}`);
}

const payload = await response.json();
if (payload.errors?.length) {
  throw new Error(
    `Contentful shirt export failed: ${payload.errors[0].message}`
  );
}

const shirts = payload.data?.shirtCollection?.items ?? [];
const slugs = new Set();
for (const shirt of shirts) {
  if (!shirt.sys?.id || !shirt.slug || !shirt.name) {
    throw new Error('Every Contentful shirt needs an id, slug and name');
  }
  if (slugs.has(shirt.slug))
    throw new Error(`Duplicate shirt slug: ${shirt.slug}`);
  slugs.add(shirt.slug);
  if (!shirt.imagesCollection?.items?.length) {
    throw new Error(`${shirt.slug} must have at least one image`);
  }
}

const now = new Date().toISOString();
// Remote D1 SQL file execution does not support explicit transaction control.
// Each statement remains idempotent, so an interrupted import can be safely rerun.
const lines = ['PRAGMA foreign_keys = ON;'];

for (const shirt of shirts) {
  const id = shirt.sys.id;
  lines.push(
    `INSERT INTO Shirts (` +
      `id, slug, name, price, manufacturer, description_json, usage, color, ` +
      `decade, avatar_image_url, created_at, updated_at` +
      `) VALUES (${values([
        id,
        shirt.slug,
        shirt.name,
        null,
        shirt.manufacturer,
        shirt.description?.json ? JSON.stringify(shirt.description.json) : null,
        shirt.use || 'Other',
        shirt.color || 'Other',
        shirt.decade || '',
        null,
        now,
        now
      ])}) ON CONFLICT(id) DO UPDATE SET ` +
      `slug = excluded.slug, name = excluded.name, price = excluded.price, ` +
      `manufacturer = excluded.manufacturer, description_json = excluded.description_json, ` +
      `usage = excluded.usage, color = excluded.color, decade = excluded.decade, ` +
      `updated_at = excluded.updated_at;`
  );

  lines.push(`DELETE FROM ShirtImages WHERE shirt_id = ${sqlValue(id)};`);
  shirt.imagesCollection.items.forEach((image, index) => {
    lines.push(
      `INSERT INTO ShirtImages (id, shirt_id, url, title, description, sort_order) ` +
        `VALUES (${values([
          `${id}:image:${index}`,
          id,
          image.url,
          image.title,
          image.description,
          index
        ])});`
    );
  });

  lines.push(`DELETE FROM ShirtSeasons WHERE shirt_id = ${sqlValue(id)};`);
  (shirt.seasons ?? []).forEach((season, index) => {
    lines.push(
      `INSERT INTO ShirtSeasons (shirt_id, season, sort_order) ` +
        `VALUES (${values([id, season, index])});`
    );
  });

  lines.push(`DELETE FROM ShirtVariants WHERE shirt_id = ${sqlValue(id)};`);
  (shirt.variants ?? []).filter(Boolean).forEach((variant, index) => {
    lines.push(
      `INSERT INTO ShirtVariants (shirt_id, variant, sort_order) ` +
        `VALUES (${values([id, variant, index])});`
    );
  });
}

lines.push('');
await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFile, lines.join('\n'), 'utf8');
console.log(`Generated ${shirts.length} shirts in ${outputFile}`);
