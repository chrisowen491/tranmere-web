import { ShirtAdmin } from "@/components/apps/admin/ShirtAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { getAllShirts } from "@/lib/shirts";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage shirts",
  description: "Add and maintain shirts in the Tranmere archive.",
};

export default async function ShirtAdminPage() {
  await requireAdminPage("/admin/shirts");
  const shirts = await getAllShirts(getCloudflareContext().env.DB, 500);

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Admin overview
            </Link>
            <span className="text-blue-300">Shirts</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Manage shirts
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Maintain shirt details, seasons, archive imagery and the
                avatar-builder image.
              </p>
            </div>
            <div className="border border-white/15 px-5 py-4">
              <span className="block font-mono text-3xl font-bold">
                {shirts.length}
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-white/50">
                Shirt records
              </span>
            </div>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <ShirtAdmin initialShirts={shirts} />
      </section>
    </main>
  );
}
