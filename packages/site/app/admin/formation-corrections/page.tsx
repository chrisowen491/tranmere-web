import { FormationCorrectionReview } from "@/components/apps/admin/FormationCorrectionReview";
import { requireAdminPage } from "@/lib/adminAuth";
import { getFormationCorrections } from "@/lib/formationCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function FormationCorrectionsAdminPage() {
  await requireAdminPage("/admin/formation-corrections");
  await connection();
  const corrections = await getFormationCorrections(
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
            Formation corrections
          </h1>
          <p className="mt-4 text-white/65">
            Review suggested match formations before publishing them to the
            archive.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <FormationCorrectionReview initialCorrections={corrections} />
      </section>
    </main>
  );
}
