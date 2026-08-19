import { KitCorrectionReview } from "@/components/apps/admin/KitCorrectionReview";
import { requireAdminPage } from "@/lib/adminAuth";
import { getKitCorrections } from "@/lib/kitCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export default async function KitCorrectionsAdminPage() {
  await requireAdminPage("/admin/kit-corrections");
  const corrections = await getKitCorrections(
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
            Match kit suggestions
          </h1>
          <p className="mt-4 text-white/65">
            Review supporter-suggested kits before publishing them to the match
            archive.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <KitCorrectionReview initialCorrections={corrections} />
      </section>
    </main>
  );
}
