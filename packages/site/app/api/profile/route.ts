import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 },
    );
  }
  const db = getCloudflareContext().env.DB;
  const account = await resolveAccount(db, session.user.sub);
  await db.batch([
    db
      .prepare(
        "DELETE FROM ProgrammeContactRequests WHERE sender_account_id = ? OR recipient_account_id = ?",
      )
      .bind(account.id, account.id),
    db
      .prepare(
        "DELETE FROM MatchAttendanceCorrections WHERE submitted_by_account_id = ?",
      )
      .bind(account.id),
    db
      .prepare(
        "DELETE FROM MatchFormationCorrections WHERE submitted_by_account_id = ?",
      )
      .bind(account.id),
    db
      .prepare(
        "DELETE FROM PlayerProfileCorrections WHERE submitted_by_account_id = ?",
      )
      .bind(account.id),
    db
      .prepare(
        "DELETE FROM MatchKitCorrections WHERE submitted_by_account_id = ?",
      )
      .bind(account.id),
    db
      .prepare("DELETE FROM GoalCorrections WHERE submitted_by_account_id = ?")
      .bind(account.id),
    db
      .prepare("DELETE FROM GoalSubmissions WHERE submitted_by_account_id = ?")
      .bind(account.id),
    db
      .prepare(
        "DELETE FROM AppearanceCorrections WHERE submitted_by_account_id = ?",
      )
      .bind(account.id),
    db.prepare("DELETE FROM Ratings WHERE account_id = ?").bind(account.id),
    db.prepare("DELETE FROM Accounts WHERE id = ?").bind(account.id),
  ]);
  return NextResponse.json({
    message: "Your supporter data has been removed.",
  });
}
