import {
  querySeasonNewsSnippetRows,
  querySeasonNewsSnippetTags,
} from "@tranmere-web/lib/src/d1-queries";
import type {
  SeasonNewsSnippetPlacement,
  SeasonNewsSnippetRow,
} from "@tranmere-web/lib/src/d1-types";

export interface SeasonNewsSnippet extends SeasonNewsSnippetRow {
  tags: string[];
}

export interface SeasonNewsSnippetInput {
  season: number;
  date: string;
  placement: SeasonNewsSnippetPlacement;
  title: string | null;
  body: string;
  tags: string[];
}

const mapRows = async (db: D1Database, rows: SeasonNewsSnippetRow[]) => {
  const tags = await querySeasonNewsSnippetTags(
    db,
    rows.map((row) => row.id),
  );
  const tagsBySnippet = new Map<string, string[]>();
  tags.forEach(({ snippet_id, tag }) => {
    tagsBySnippet.set(snippet_id, [
      ...(tagsBySnippet.get(snippet_id) ?? []),
      tag,
    ]);
  });
  return rows.map((row) => ({ ...row, tags: tagsBySnippet.get(row.id) ?? [] }));
};

export async function getSeasonNewsSnippets(
  db: D1Database,
  filters: { season?: number; tag?: string } = {},
) {
  return mapRows(db, await querySeasonNewsSnippetRows(db, filters));
}

export async function getSeasonNewsSnippetById(db: D1Database, id: string) {
  const rows = await querySeasonNewsSnippetRows(db);
  return (
    (
      await mapRows(
        db,
        rows.filter((row) => row.id === id),
      )
    )[0] ?? null
  );
}

async function replaceTags(db: D1Database, id: string, tags: string[]) {
  await db
    .prepare("DELETE FROM SeasonNewsSnippetTags WHERE snippet_id = ?")
    .bind(id)
    .run();
  const uniqueTags = [
    ...new Set(tags.map((tag) => tag.trim()).filter(Boolean)),
  ];
  if (uniqueTags.length) {
    await db.batch(
      uniqueTags.map((tag) =>
        db
          .prepare(
            "INSERT INTO SeasonNewsSnippetTags (snippet_id, tag) VALUES (?, ?)",
          )
          .bind(id, tag),
      ),
    );
  }
}

export async function createSeasonNewsSnippet(
  db: D1Database,
  id: string,
  input: SeasonNewsSnippetInput,
) {
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO SeasonNewsSnippets (id, season, news_date, placement, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      input.season,
      input.date,
      input.placement,
      input.title,
      input.body,
      now,
      now,
    )
    .run();
  await replaceTags(db, id, input.tags);
  return getSeasonNewsSnippetById(db, id);
}

export async function updateSeasonNewsSnippet(
  db: D1Database,
  id: string,
  input: SeasonNewsSnippetInput,
) {
  const result = await db
    .prepare(
      "UPDATE SeasonNewsSnippets SET season = ?, news_date = ?, placement = ?, title = ?, body = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      input.season,
      input.date,
      input.placement,
      input.title,
      input.body,
      new Date().toISOString(),
      id,
    )
    .run();
  if (!result.meta.changes) return null;
  await replaceTags(db, id, input.tags);
  return getSeasonNewsSnippetById(db, id);
}

export async function deleteSeasonNewsSnippet(db: D1Database, id: string) {
  return db
    .prepare("DELETE FROM SeasonNewsSnippets WHERE id = ?")
    .bind(id)
    .run();
}
