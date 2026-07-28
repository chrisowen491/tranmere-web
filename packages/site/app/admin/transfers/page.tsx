import { TransferAdmin } from "@/components/apps/admin/TransferAdmin";
import { auth0 } from "@/lib/auth0";
import { getTransfers, getTransferTeams } from "@/lib/transfers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage transfers",
  description: "Add and edit Tranmere Rovers transfer records.",
};

export default async function TransferAdminPage() {
  const session = await auth0.getSession();
  if (!session) {
    redirect(`/auth/login?returnTo=${encodeURIComponent("/admin/transfers")}`);
  }

  const env = getCloudflareContext().env;
  const adminEmail = env.AUTH0_ADMIN_EMAIL || process.env.AUTH0_ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) notFound();

  const [transfers, teams] = await Promise.all([
    getTransfers(env.DB),
    getTransferTeams(env.DB),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Admin overview
            </Link>
            <span className="text-blue-300">Transfers</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Manage transfers
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Add new arrivals and departures or correct an existing D1
                transfer record.
              </p>
            </div>
            <div className="border border-white/15 px-5 py-4">
              <span className="block font-mono text-3xl font-bold">
                {transfers.length.toLocaleString()}
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-white/50">
                Transfer records
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <TransferAdmin initialTransfers={transfers} teams={teams} />
      </section>
    </main>
  );
}
