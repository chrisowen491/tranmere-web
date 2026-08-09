import { ManagerAdmin } from "@/components/apps/admin/ManagerAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { getManagers } from "@/lib/managers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage managers",
  description: "Add and edit Tranmere Rovers manager records.",
};

export default async function ManagerAdminPage() {
  await requireAdminPage("/admin/managers");
  const env = getCloudflareContext().env;
  const managers = await getManagers(env.DB);

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Admin overview
            </Link>
            <span className="text-blue-300">Managers</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Manage managers
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Add a new appointment or correct an existing managerial record.
              </p>
            </div>
            <div className="border border-white/15 px-5 py-4">
              <span className="block font-mono text-3xl font-bold">
                {managers.length}
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-white/50">
                Manager records
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <ManagerAdmin initialManagers={managers} />
      </section>
    </main>
  );
}
