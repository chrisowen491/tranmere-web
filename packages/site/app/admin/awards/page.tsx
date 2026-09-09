import { AwardsAdmin } from "@/components/apps/admin/AwardsAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { getAwards, getPlayerAwards } from "@/lib/awards";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Manage awards",
  description: "Manage seasonal player awards.",
};
export default async function AwardsAdminPage() {
  await requireAdminPage("/admin/awards");
  const db = getCloudflareContext().env.DB;
  const [awards, assignments] = await Promise.all([
    getAwards(db),
    getPlayerAwards(db),
  ]);
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
          <Link
            href="/admin"
            className="text-xs font-bold uppercase tracking-[0.14em] text-white/45 hover:text-white"
          >
            Admin overview
          </Link>
          <h1 className="mt-5 font-display text-5xl font-semibold">
            Manage awards
          </h1>
          <p className="mt-4 text-white/65">
            Create award types and record each season’s recipients.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <AwardsAdmin initialAwards={awards} initialAssignments={assignments} />
      </section>
    </main>
  );
}
