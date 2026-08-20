export type User = {
  name: string;
  picture: string;
  sub: string;
  email?: string;
};

export type Comment = {
  id?: number;
  created_at: string;
  url: string;
  text: string;
  rating: number;
  user: User;
};

export interface DBComment {
  id: number;
  page_url: string;
  image_url: string;
  created: string;
  sub: string;
  user_name: string;
  email: string;
  rating: number;
  comment: string | null;
}

export interface AdminComment extends Comment {
  id: number;
}

function mapComment(row: DBComment): AdminComment {
  return {
    id: row.id,
    created_at: row.created,
    url: row.page_url,
    text: row.comment || "",
    rating: row.rating,
    user: {
      name: row.user_name,
      picture: row.image_url,
      sub: row.sub,
      email: row.email,
    },
  };
}

export async function GetCommentsByUrl(
  env: CloudflareEnv,
  url: string,
): Promise<Comment[]> {
  try {
    const commentsQuery = await env.DB.prepare(
      `SELECT id, page_url, image_url, created, sub, user_name, email, rating,
              comment
       FROM Ratings
       WHERE page_url = ?
       ORDER BY created DESC, id DESC`,
    )
      .bind(url)
      .all<DBComment>();

    const comments: Comment[] = commentsQuery.results.map(mapComment);
    return comments;
  } catch {
    return [];
  }
}

export async function getAllComments(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT id, page_url, image_url, created, sub, user_name, email, rating,
              comment
       FROM Ratings
       ORDER BY created DESC, id DESC`,
    )
    .all<DBComment>();
  return result.results.map(mapComment);
}

export async function getCommentById(db: D1Database, id: number) {
  const row = await db
    .prepare(
      `SELECT id, page_url, image_url, created, sub, user_name, email, rating,
              comment
       FROM Ratings
       WHERE id = ?`,
    )
    .bind(id)
    .first<DBComment>();
  return row ? mapComment(row) : null;
}

export async function updateComment(
  db: D1Database,
  id: number,
  rating: number,
  text: string,
) {
  const result = await db
    .prepare("UPDATE Ratings SET rating = ?, comment = ? WHERE id = ?")
    .bind(rating, text, id)
    .run();
  if (!result.meta.changes) return null;
  return getCommentById(db, id);
}

export async function deleteComment(db: D1Database, id: number) {
  const existing = await getCommentById(db, id);
  if (!existing) return null;
  await db.prepare("DELETE FROM Ratings WHERE id = ?").bind(id).run();
  return existing;
}
