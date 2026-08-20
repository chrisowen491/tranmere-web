import { AppearanceCorrectionReview } from "@/components/apps/admin/AppearanceCorrectionReview";
import { requireAdminPage } from "@/lib/adminAuth";
import { getAppearanceCorrections } from "@/lib/appearanceCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export default async function AppearanceCorrectionsAdminPage() {
  await requireAdminPage("/admin/appearance-corrections");
  const corrections = await getAppearanceCorrections(
    getCloudflareContext().env.DB,
    "pending",
  );
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
            Approval queue
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold">
            Appearance corrections
          </h1>
          <p className="mt-4 text-white/65">
            Review team-sheet, shirt-number, discipline and substitution changes
            before publishing them.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <AppearanceCorrectionReview initialCorrections={corrections} />
      </section>
    </main>
  );
}
