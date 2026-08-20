export interface CurrentAccount {
  id: string;
  authSub: string;
}

function providerFromSub(authSub: string) {
  const separator = authSub.indexOf("|");
  return separator === -1 ? "unknown" : authSub.slice(0, separator);
}

export async function resolveAccount(
  db: D1Database,
  authSub: string,
): Promise<CurrentAccount> {
  const existing = await db
    .prepare(
      `SELECT account_id
       FROM AccountIdentities
       WHERE provider_sub = ?`,
    )
    .bind(authSub)
    .first<{ account_id: string }>();

  if (existing) {
    await db
      .prepare(
        `UPDATE AccountIdentities
         SET last_authenticated_at = ?
         WHERE provider_sub = ?`,
      )
      .bind(new Date().toISOString(), authSub)
      .run();
    return { id: existing.account_id, authSub };
  }

  const accountId = `acct_${crypto.randomUUID().replaceAll("-", "")}`;
  const now = new Date().toISOString();
  try {
    await db.batch([
      db
        .prepare(
          `INSERT INTO Accounts (id, created_at, updated_at)
           VALUES (?, ?, ?)`,
        )
        .bind(accountId, now, now),
      db
        .prepare(
          `INSERT INTO AccountIdentities (
             provider_sub, account_id, provider, is_primary, created_at,
             last_authenticated_at
           ) VALUES (?, ?, ?, 1, ?, ?)`,
        )
        .bind(authSub, accountId, providerFromSub(authSub), now, now),
      db
        .prepare("INSERT INTO UserProfiles (account_id) VALUES (?)")
        .bind(accountId),
    ]);
  } catch (error) {
    // Parallel first requests can race to create the same identity. D1 batches
    // are atomic, so the losing batch can safely use the winning account.
    const winner = await db
      .prepare("SELECT account_id FROM AccountIdentities WHERE provider_sub = ?")
      .bind(authSub)
      .first<{ account_id: string }>();
    if (winner) return { id: winner.account_id, authSub };
    throw error;
  }

  return { id: accountId, authSub };
}
