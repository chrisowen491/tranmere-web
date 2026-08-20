import type { UserProfileRow } from "@tranmere-web/lib/src/d1-types";

const usernameClaim = "https://www.tranmere-web.com/username";

export function supporterUsername(user: Record<string, unknown>) {
  return [
    user[usernameClaim],
    user.username,
    user.preferred_username,
    user.nickname,
  ].find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
}

export async function ensureUserProfile(db: D1Database, authSub: string) {
  await db
    .prepare("INSERT OR IGNORE INTO UserProfiles (auth_sub) VALUES (?)")
    .bind(authSub)
    .run();

  return db
    .prepare(
      `SELECT auth_sub, public_collection_id, public_collection_visible, contact_opt_in,
              correction_recognition_visible, correction_username
       FROM UserProfiles WHERE auth_sub = ?`,
    )
    .bind(authSub)
    .first<UserProfileRow>();
}
