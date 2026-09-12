import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import { getSharedFantasyTeam, listFantasyTeams } from "@/lib/fantasyTeams";
import { FantasyChallengeForm } from "@/components/apps/FantasyChallengeForm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export default async function ChallengeFantasyTeamPage({ params }: Props) {
  const { id } = await params;
  const session = await auth0.getSession();
  if (!session)
    redirect(
      `/auth/login?returnTo=${encodeURIComponent(`/fantasy-team/challenge/${id}`)}`,
    );
  const db = getCloudflareContext().env.DB;
  const account = await resolveAccount(db, session.user.sub);
  const [opponent, teams] = await Promise.all([
    getSharedFantasyTeam(db, id),
    listFantasyTeams(db, account.id),
  ]);
  if (!opponent) notFound();
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="bg-[#071a2b] text-white">
        <div className="mx-auto max-w-4xl px-6 py-14 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Fantasy XI challenge
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold">
            Take on {opponent.name}
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/65">
            Five competitive matches since 1960 will be drawn from the eras
            represented by both teams. Standard fantasy points apply and
            captains score double.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <Link
          href={`/fantasy-team/shared/${id}`}
          className="mb-6 inline-block text-sm font-bold text-blue-700"
        >
          ← View {opponent.name}
        </Link>
        <FantasyChallengeForm
          teams={teams.filter((team) => team.id !== opponent.id)}
          opponentName={opponent.name}
          opponentShareId={id}
        />
      </section>
    </main>
  );
}
