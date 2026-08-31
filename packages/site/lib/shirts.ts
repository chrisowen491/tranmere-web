import type { Document } from "@contentful/rich-text-types";
import { AVATAR_KIT_OPTIONS } from "@tranmere-web/lib/src/avatar-kit-constants";
import { HONOURS_SEASONS } from "@tranmere-web/lib/src/honours-constants";
import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { mapGame } from "@/lib/games";
import {
  ShirtColor,
  ShirtUsageType,
  type GalleryImage,
  type Shirt,
} from "@/lib/types";

interface ShirtRow {
  id: string;
  slug: string;
  name: string;
  price: string | null;
  manufacturer: string | null;
  description_json: string | null;
  usage: string;
  color: string;
  decade: string;
  avatar_image_url: string | null;
}

interface ShirtImageRow {
  shirt_id: string;
  url: string;
  title: string | null;
  description: string | null;
}

interface ShirtSeasonRow {
  shirt_id: string;
  season: string;
}

interface ShirtVariantRow {
  shirt_id: string;
  variant: string;
}

export interface ShirtInput {
  slug: string;
  name: string;
  price: string;
  manufacturer: string;
  descriptionJson: string | null;
  use: string;
  color: string;
  decade: string;
  avatarImageUrl: string;
  images: GalleryImage[];
  seasons: string[];
  variants: string[];
}

export interface KitPerformanceRecord {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface KitPerformanceSplit extends KitPerformanceRecord {
  label: string;
}

export interface KitHonourMatch {
  title: string;
  detail: string;
  kind: string;
  match: Match;
}

export interface KitPerformance {
  kitCode: string;
  overall: KitPerformanceRecord;
  byVenue: KitPerformanceSplit[];
  byCompetition: KitPerformanceSplit[];
  matches: Match[];
  biggestWins: Match[];
  cupTies: Match[];
  honourMatches: KitHonourMatch[];
}

function kitSuffix(usage: string) {
  if (usage === "Away") return "A";
  if (usage === "Third") return "T";
  if (usage === "Fourth") return "F";
  if (usage === "Goalkeeper") return "gk";
  if (["Goalkeeper Away", "GoalkeeperAway"].includes(usage)) return "gkA";
  return "";
}

function labelMatchesUsage(label: string, usage: string) {
  if (["Goalkeeper Away", "GoalkeeperAway"].includes(usage))
    return /GK Away/i.test(label);
  if (usage === "Goalkeeper")
    return /\bGK\b/i.test(label) && !/GK Away/i.test(label);
  return new RegExp(`\\b${usage}\\b`, "i").test(label);
}

function labelIncludesYear(label: string, year: number) {
  const match = label.match(/^(\d{4})(?:-(\d{2}))?/);
  if (!match) return false;
  const start = Number(match[1]);
  const end = match[2]
    ? Math.floor(start / 100) * 100 + Number(match[2])
    : start;
  return year >= start && year <= end;
}

export function resolveShirtKitCode(shirt: Shirt) {
  if (shirt.avatarImageUrl) {
    const segments = new URL(
      shirt.avatarImageUrl,
      "https://www.tranmere-web.com",
    ).pathname.split("/");
    const builderIndex = segments.indexOf("builder");
    if (builderIndex >= 0 && segments[builderIndex + 1]) {
      return decodeURIComponent(segments[builderIndex + 1]);
    }
  }

  const year = Number(shirt.slug.match(/^(\d{4})/)?.[1]);
  if (!year) return null;
  const exact = `${year}${kitSuffix(shirt.use)}`;
  if (AVATAR_KIT_OPTIONS.some(({ value }) => value === exact)) return exact;

  return (
    AVATAR_KIT_OPTIONS.find(
      ({ label }) =>
        labelMatchesUsage(label, shirt.use) && labelIncludesYear(label, year),
    )?.value ?? null
  );
}

function matchScore(match: Match) {
  return match.location === "H"
    ? { goalsFor: match.hgoal, goalsAgainst: match.vgoal }
    : { goalsFor: match.vgoal, goalsAgainst: match.hgoal };
}

function performanceRecord(matches: Match[]): KitPerformanceRecord {
  return matches.reduce<KitPerformanceRecord>(
    (record, match) => {
      const { goalsFor, goalsAgainst } = matchScore(match);
      record.played += 1;
      record.goalsFor += goalsFor;
      record.goalsAgainst += goalsAgainst;
      if (goalsFor > goalsAgainst) record.won += 1;
      else if (goalsFor < goalsAgainst) record.lost += 1;
      else record.drawn += 1;
      return record;
    },
    { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
  );
}

function performanceSplits(
  matches: Match[],
  labelFor: (match: Match) => string,
) {
  const groups = new Map<string, Match[]>();
  for (const match of matches) {
    const label = labelFor(match);
    groups.set(label, [...(groups.get(label) ?? []), match]);
  }
  return [...groups.entries()]
    .map(([label, group]) => ({ label, ...performanceRecord(group) }))
    .sort((a, b) => b.played - a.played || a.label.localeCompare(b.label));
}

export async function getShirtPerformance(db: D1Database, shirt: Shirt) {
  const kitCode = resolveShirtKitCode(shirt);
  if (!kitCode) return null;

  const { queryGameRows } = await import("@tranmere-web/lib/src/d1-queries");
  const rows = await queryGameRows(db, {
    kit: kitCode,
    includeKit: true,
    playedOnly: true,
    statisticsOnly: true,
    sort: "date-desc",
  });
  const matches = rows.map(mapGame);
  const winningMargins = matches.map((match) => {
    const score = matchScore(match);
    return score.goalsFor - score.goalsAgainst;
  });
  const biggestMargin = Math.max(0, ...winningMargins);
  const biggestWins = matches.filter((match) => {
    const score = matchScore(match);
    return (
      score.goalsFor - score.goalsAgainst === biggestMargin && biggestMargin > 0
    );
  });
  const matchByDate = new Map(matches.map((match) => [match.date, match]));
  const honourMatches = HONOURS_SEASONS.flatMap((season) =>
    season.achievements.flatMap((achievement) => {
      const match = matchByDate.get(achievement.achievedOn);
      return match ? [{ ...achievement, match }] : [];
    }),
  );

  return {
    kitCode,
    overall: performanceRecord(matches),
    byVenue: performanceSplits(matches, (match) =>
      match.location === "H"
        ? "Home"
        : match.location === "N"
          ? "Neutral"
          : "Away",
    ),
    byCompetition: performanceSplits(
      matches,
      (match) => match.competition ?? "Other",
    ),
    matches,
    biggestWins,
    cupTies: matches.filter(
      (match) => (match.competition ?? "").trim().toLowerCase() !== "league",
    ),
    honourMatches,
  } satisfies KitPerformance;
}

function parseDescription(value: string | null) {
  if (!value) return null;
  try {
    return { json: JSON.parse(value) as Document };
  } catch {
    return null;
  }
}

async function hydrateShirts(db: D1Database, rows: ShirtRow[]) {
  if (rows.length === 0) return [];

  const placeholders = rows.map(() => "?").join(", ");
  const ids = rows.map((row) => row.id);
  const [imageResult, seasonResult, variantResult] = await Promise.all([
    db
      .prepare(
        `SELECT shirt_id, url, title, description
         FROM ShirtImages
         WHERE shirt_id IN (${placeholders})
         ORDER BY shirt_id, sort_order`,
      )
      .bind(...ids)
      .all<ShirtImageRow>(),
    db
      .prepare(
        `SELECT shirt_id, season
         FROM ShirtSeasons
         WHERE shirt_id IN (${placeholders})
         ORDER BY shirt_id, sort_order`,
      )
      .bind(...ids)
      .all<ShirtSeasonRow>(),
    db
      .prepare(
        `SELECT shirt_id, variant
         FROM ShirtVariants
         WHERE shirt_id IN (${placeholders})
         ORDER BY shirt_id, sort_order`,
      )
      .bind(...ids)
      .all<ShirtVariantRow>(),
  ]);

  const images = new Map<string, GalleryImage[]>();
  for (const image of imageResult.results) {
    const collection = images.get(image.shirt_id) ?? [];
    collection.push({
      url: image.url,
      title: image.title ?? "",
      description: image.description ?? "",
    });
    images.set(image.shirt_id, collection);
  }

  const seasons = new Map<string, string[]>();
  for (const item of seasonResult.results) {
    const collection = seasons.get(item.shirt_id) ?? [];
    collection.push(item.season);
    seasons.set(item.shirt_id, collection);
  }

  const variants = new Map<string, string[]>();
  for (const item of variantResult.results) {
    const collection = variants.get(item.shirt_id) ?? [];
    collection.push(item.variant);
    variants.set(item.shirt_id, collection);
  }

  return rows.map((row): Shirt => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price ?? "",
    manufacturer: row.manufacturer ?? "",
    description: parseDescription(row.description_json),
    use: row.usage as ShirtUsageType,
    color: row.color as ShirtColor,
    decade: row.decade,
    avatarImageUrl: row.avatar_image_url ?? undefined,
    imagesCollection: { items: images.get(row.id) ?? [] },
    seasons: seasons.get(row.id) ?? [],
    variants: variants.get(row.id) ?? [],
  }));
}

export async function getAllShirts(db: D1Database, limit = 100) {
  const result = await db
    .prepare(
      `SELECT id, slug, name, price, manufacturer, description_json,
              usage, color, decade, avatar_image_url
       FROM Shirts
       ORDER BY name DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<ShirtRow>();

  return hydrateShirts(db, result.results);
}

export async function getShirtsBySeason(db: D1Database, season: string) {
  const result = await db
    .prepare(
      `SELECT s.id, s.slug, s.name, s.price, s.manufacturer,
              s.description_json, s.usage, s.color, s.decade,
              s.avatar_image_url
       FROM Shirts s
       INNER JOIN ShirtSeasons ss ON ss.shirt_id = s.id
       WHERE ss.season = ?
       ORDER BY s.name DESC`,
    )
    .bind(season)
    .all<ShirtRow>();

  return hydrateShirts(db, result.results);
}

export async function getShirtBySlug(db: D1Database, slug: string) {
  const row = await db
    .prepare(
      `SELECT id, slug, name, price, manufacturer, description_json,
              usage, color, decade, avatar_image_url
       FROM Shirts
       WHERE slug = ?`,
    )
    .bind(slug)
    .first<ShirtRow>();

  if (!row) return null;
  return (await hydrateShirts(db, [row]))[0] ?? null;
}

export async function getShirtById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, slug, name, price, manufacturer, description_json,
              usage, color, decade, avatar_image_url
       FROM Shirts
       WHERE id = ?`,
    )
    .bind(id)
    .first<ShirtRow>();

  if (!row) return null;
  return (await hydrateShirts(db, [row]))[0] ?? null;
}

function childStatements(db: D1Database, id: string, shirt: ShirtInput) {
  return [
    db.prepare("DELETE FROM ShirtImages WHERE shirt_id = ?").bind(id),
    ...shirt.images.map((image, index) =>
      db
        .prepare(
          `INSERT INTO ShirtImages
             (id, shirt_id, url, title, description, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          id,
          image.url,
          image.title || null,
          image.description || null,
          index,
        ),
    ),
    db.prepare("DELETE FROM ShirtSeasons WHERE shirt_id = ?").bind(id),
    ...shirt.seasons.map((season, index) =>
      db
        .prepare(
          `INSERT INTO ShirtSeasons (shirt_id, season, sort_order)
           VALUES (?, ?, ?)`,
        )
        .bind(id, season, index),
    ),
    db.prepare("DELETE FROM ShirtVariants WHERE shirt_id = ?").bind(id),
    ...shirt.variants.map((variant, index) =>
      db
        .prepare(
          `INSERT INTO ShirtVariants (shirt_id, variant, sort_order)
           VALUES (?, ?, ?)`,
        )
        .bind(id, variant, index),
    ),
  ];
}

export async function createShirt(
  db: D1Database,
  id: string,
  shirt: ShirtInput,
) {
  const now = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        `INSERT INTO Shirts (
           id, slug, name, price, manufacturer, description_json, usage,
           color, decade, avatar_image_url, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        shirt.slug,
        shirt.name,
        shirt.price || null,
        shirt.manufacturer || null,
        shirt.descriptionJson,
        shirt.use,
        shirt.color,
        shirt.decade,
        shirt.avatarImageUrl || null,
        now,
        now,
      ),
    ...childStatements(db, id, shirt),
  ]);
  return getShirtById(db, id);
}

export async function updateShirt(
  db: D1Database,
  id: string,
  shirt: ShirtInput,
) {
  await db.batch([
    db
      .prepare(
        `UPDATE Shirts
         SET slug = ?, name = ?, price = ?, manufacturer = ?,
             description_json = ?, usage = ?, color = ?, decade = ?,
             avatar_image_url = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        shirt.slug,
        shirt.name,
        shirt.price || null,
        shirt.manufacturer || null,
        shirt.descriptionJson,
        shirt.use,
        shirt.color,
        shirt.decade,
        shirt.avatarImageUrl || null,
        new Date().toISOString(),
        id,
      ),
    ...childStatements(db, id, shirt),
  ]);
  return getShirtById(db, id);
}

export async function deleteShirt(db: D1Database, id: string) {
  const result = await db
    .prepare("DELETE FROM Shirts WHERE id = ?")
    .bind(id)
    .run();
  return Boolean(result.meta.changes);
}
