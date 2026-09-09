import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";
import { ClubCaptainAdmin } from "@/components/apps/admin/ClubCaptainAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { getClubCaptains } from "@/lib/clubCaptains";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Manage club captains",
  description: "Manage Tranmere Rovers club captains by season.",
};
export default async function ClubCaptainsAdminPage() {
  await requireAdminPage("/admin/club-captains");
  const captains = await getClubCaptains(getCloudflareContext().env.DB);
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="flex gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Admin overview
            </Link>
            <span className="text-blue-300">Club captains</span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Manage club captains
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Add, reorder or correct the players who held the captaincy in each
            season.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <ClubCaptainAdmin initialCaptains={captains} />
      </section>
    </main>
  );
}
