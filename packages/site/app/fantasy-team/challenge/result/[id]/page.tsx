import { FantasyChallengeResult } from "@/components/apps/FantasyChallengeResult";
import { getFantasyChallenge } from "@/lib/fantasyChallenges";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export default async function FantasyChallengeResultPage({ params }: Props) {
  const challenge = await getFantasyChallenge(
    getCloudflareContext().env.DB,
    (await params).id,
  );
  if (!challenge) notFound();
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <FantasyChallengeResult challenge={challenge} />
      </div>
    </main>
  );
}
