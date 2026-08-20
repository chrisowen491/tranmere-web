export interface LinkedIdentity {
  providerSub: string;
  provider: string;
  isPrimary: boolean;
  lastAuthenticatedAt: string;
}

export async function listAccountIdentities(db: D1Database, accountId: string) {
  const result = await db
    .prepare(
      `SELECT provider_sub, provider, is_primary, last_authenticated_at
       FROM AccountIdentities
       WHERE account_id = ?
       ORDER BY is_primary DESC, created_at ASC`,
    )
    .bind(accountId)
    .all<{
      provider_sub: string;
      provider: string;
      is_primary: number;
      last_authenticated_at: string;
    }>();
  return result.results.map<LinkedIdentity>((identity) => ({
    providerSub: identity.provider_sub,
    provider: identity.provider,
    isPrimary: identity.is_primary === 1,
    lastAuthenticatedAt: identity.last_authenticated_at,
  }));
}

async function mergeAccounts(
  db: D1Database,
  primaryAccountId: string,
  secondaryAccountId: string,
) {
  await db.batch([
    db
      .prepare(
        `INSERT OR IGNORE INTO ProgrammeCollections
       SELECT ?, game_id, status, condition_notes, purchase_notes, created_at, updated_at
       FROM ProgrammeCollections WHERE account_id = ?`,
      )
      .bind(primaryAccountId, secondaryAccountId),
    db
      .prepare("DELETE FROM ProgrammeCollections WHERE account_id = ?")
      .bind(secondaryAccountId),
    db
      .prepare(
        `INSERT OR IGNORE INTO MatchAttendances
       SELECT ?, game_id, created_at FROM MatchAttendances WHERE account_id = ?`,
      )
      .bind(primaryAccountId, secondaryAccountId),
    db
      .prepare("DELETE FROM MatchAttendances WHERE account_id = ?")
      .bind(secondaryAccountId),
    db
      .prepare("UPDATE FantasyTeams SET account_id = ? WHERE account_id = ?")
      .bind(primaryAccountId, secondaryAccountId),
    db
      .prepare("UPDATE Ratings SET account_id = ? WHERE account_id = ?")
      .bind(primaryAccountId, secondaryAccountId),
    ...[
      "MatchAttendanceCorrections",
      "PlayerProfileCorrections",
      "GoalCorrections",
      "GoalSubmissions",
      "AppearanceCorrections",
      "MatchFormationCorrections",
      "MatchKitCorrections",
    ].map((table) =>
      db
        .prepare(
          `UPDATE ${table} SET submitted_by_account_id = ? WHERE submitted_by_account_id = ?`,
        )
        .bind(primaryAccountId, secondaryAccountId),
    ),
    db
      .prepare(
        "UPDATE ProgrammeContactRequests SET sender_account_id = ? WHERE sender_account_id = ?",
      )
      .bind(primaryAccountId, secondaryAccountId),
    db
      .prepare(
        "UPDATE ProgrammeContactRequests SET recipient_account_id = ? WHERE recipient_account_id = ?",
      )
      .bind(primaryAccountId, secondaryAccountId),
    db
      .prepare(
        "UPDATE AccountIdentities SET account_id = ?, is_primary = 0 WHERE account_id = ?",
      )
      .bind(primaryAccountId, secondaryAccountId),
    db.prepare("DELETE FROM Accounts WHERE id = ?").bind(secondaryAccountId),
  ]);
}

export async function attachLinkedIdentity(
  db: D1Database,
  accountId: string,
  providerSub: string,
) {
  const existing = await db
    .prepare("SELECT account_id FROM AccountIdentities WHERE provider_sub = ?")
    .bind(providerSub)
    .first<{ account_id: string }>();
  if (existing?.account_id === accountId) return;
  if (existing) await mergeAccounts(db, accountId, existing.account_id);
  const now = new Date().toISOString();
  if (existing) return;
  const separator = providerSub.indexOf("|");
  const provider =
    separator === -1 ? "unknown" : providerSub.slice(0, separator);
  await db
    .prepare(
      `INSERT INTO AccountIdentities (
         provider_sub, account_id, provider, is_primary, created_at,
         last_authenticated_at
       ) VALUES (?, ?, ?, 0, ?, ?)`,
    )
    .bind(providerSub, accountId, provider, now, now)
    .run();
}

export async function removeLinkedIdentity(
  db: D1Database,
  accountId: string,
  providerSub: string,
) {
  const identities = await listAccountIdentities(db, accountId);
  const target = identities.find((item) => item.providerSub === providerSub);
  if (!target) throw new Error("That sign-in method is not linked.");
  if (target.isPrimary)
    throw new Error("The primary sign-in method cannot be removed.");
  if (identities.length < 2)
    throw new Error("An account must retain a sign-in method.");
  await db
    .prepare(
      "DELETE FROM AccountIdentities WHERE account_id = ? AND provider_sub = ?",
    )
    .bind(accountId, providerSub)
    .run();
}
