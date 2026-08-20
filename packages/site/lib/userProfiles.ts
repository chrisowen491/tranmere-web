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

export function normalizeSupporterAvatar(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string" || value.length > 1000) {
    throw new Error("Enter a valid Tranmere-Web Avatar Builder URL.");
  }

  let path: string;
  try {
    const url = new URL(value, "https://www.tranmere-web.com");
    const allowedHost =
      url.hostname === "www.tranmere-web.com" ||
      url.hostname === "tranmere-web.com" ||
      url.hostname === "localhost";
    if (!allowedHost) {
      throw new Error();
    }
    path = url.pathname;
  } catch {
    throw new Error("Enter a valid Tranmere-Web Avatar Builder URL.");
  }

  const segments = path.split("/").filter(Boolean);
  if (segments[0] !== "builder" || segments.length !== 9) {
    throw new Error("Enter a complete Avatar Builder URL.");
  }
  return `/${segments.map(encodeURIComponent).join("/")}`;
}

export async function ensureUserProfile(db: D1Database, accountId: string) {
  await db
    .prepare("INSERT OR IGNORE INTO UserProfiles (account_id) VALUES (?)")
    .bind(accountId)
    .run();

  return db
    .prepare(
      `SELECT account_id, public_collection_id, public_collection_visible, contact_opt_in,
              correction_recognition_visible, correction_username, avatar_url
       FROM UserProfiles WHERE account_id = ?`,
    )
    .bind(accountId)
    .first<UserProfileRow>();
}
