import { GoalCorrectionReview } from "@/components/apps/admin/GoalCorrectionReview";
import { requireAdminPage } from "@/lib/adminAuth";
import { getGoalCorrections } from "@/lib/goalCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { GoalSubmissionReview } from "@/components/apps/admin/GoalSubmissionReview";
import { getGoalSubmissions } from "@/lib/goalSubmissions";

export const dynamic = "force-dynamic";

export default async function GoalCorrectionsAdminPage() {
  await requireAdminPage("/admin/goal-corrections");
  const db = getCloudflareContext().env.DB;
  const [corrections, submissions] = await Promise.all([
    getGoalCorrections(db, "pending"),
    getGoalSubmissions(db),
  ]);
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
            Approval queue
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold">
            Goal corrections
          </h1>
          <p className="mt-4 text-white/65">
            Review scorer, minute, assist and goal-detail changes before
            publishing them.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <GoalSubmissionReview initialSubmissions={submissions} />
        <GoalCorrectionReview initialCorrections={corrections} />
      </section>
    </main>
  );
}
