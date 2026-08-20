import { CorrectionActivityDashboard } from "@/components/apps/CorrectionActivityDashboard";
import { auth0 } from "@/lib/auth0";
import { getCorrectionActivity } from "@/lib/correctionActivity";
import { ensureUserProfile } from "@/lib/userProfiles";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your archive corrections",
  description: "Track your Tranmere-Web archive contributions.",
};

export default async function CorrectionsPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=%2Fprofile%2Fcorrections");
  const db = getCloudflareContext().env.DB;
  const [profile, activity] = await Promise.all([
    ensureUserProfile(db, session.user.sub),
    getCorrectionActivity(db, session.user.sub),
  ]);
  const pending = activity.filter((item) => item.status === "pending").length;
  const approved = new Set(
    activity
      .filter((item) => item.status === "approved")
      .map((item) => item.contributionKey),
  ).size;
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Supporter profile · Archive activity
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Your corrections
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Follow every suggestion from submission to review, read moderator
            feedback and see the records your contributions helped improve.
          </p>
          <dl className="mt-9 grid max-w-lg grid-cols-2 border border-white/15">
            <div className="border-r border-white/15 p-5">
              <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                Awaiting review
              </dt>
              <dd className="mt-2 font-display text-3xl font-semibold">
                {pending}
              </dd>
            </div>
            <div className="p-5">
              <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                Helpful contributions
              </dt>
              <dd className="mt-2 font-display text-3xl font-semibold">
                {approved}
              </dd>
            </div>
          </dl>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-10 lg:px-12">
        <CorrectionActivityDashboard
          initialActivity={activity}
          initialRecognitionVisible={
            profile?.correction_recognition_visible === 1
          }
        />
      </div>
    </main>
  );
}
