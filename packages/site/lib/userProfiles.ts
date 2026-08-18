import type { UserProfileRow } from "@tranmere-web/lib/src/d1-types";

export async function ensureUserProfile(db: D1Database, authSub: string) {
  await db
    .prepare("INSERT OR IGNORE INTO UserProfiles (auth_sub) VALUES (?)")
    .bind(authSub)
    .run();

  return db
    .prepare(
      `SELECT auth_sub, public_collection_id, public_collection_visible, contact_opt_in
       FROM UserProfiles WHERE auth_sub = ?`,
    )
    .bind(authSub)
    .first<UserProfileRow>();
}
