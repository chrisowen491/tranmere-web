import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { createFantasyChallenge } from "@/lib/fantasyChallenges";
import { getOwnedFantasyTeam, getSharedFantasyTeam } from "@/lib/fantasyTeams";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json(
      { message: "Please log in to issue a challenge." },
      { status: 401 },
    );
  try {
    const body = (await request.json()) as {
      challengerTeamId?: string;
      opponentShareId?: string;
    };
    if (!body.challengerTeamId || !body.opponentShareId)
      throw new Error("Choose one of your saved XIs.");
    const db = getCloudflareContext().env.DB;
    const account = await resolveAccount(db, session.user.sub);
    const [challenger, opponent] = await Promise.all([
      getOwnedFantasyTeam(db, body.challengerTeamId, account.id),
      getSharedFantasyTeam(db, body.opponentShareId),
    ]);
    if (!challenger)
      return NextResponse.json(
        { message: "Your Fantasy XI could not be found." },
        { status: 404 },
      );
    if (!opponent)
      return NextResponse.json(
        { message: "That shared Fantasy XI is no longer available." },
        { status: 404 },
      );
    if (challenger.id === opponent.id)
      throw new Error("Choose a different XI to challenge.");
    const challenge = await createFantasyChallenge(
      db,
      account.id,
      challenger,
      opponent,
    );
    return NextResponse.json(
      {
        id: challenge.id,
        href: `/fantasy-team/challenge/result/${challenge.id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "The challenge could not be created.",
      },
      { status: 400 },
    );
  }
}
