import { ClubAdmin } from "@/components/apps/admin/ClubAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { getClubRecords } from "@/lib/clubs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "Manage clubs",
  description: "Add and edit football club records.",
};

export default async function ClubAdminPage() {
  await requireAdminPage("/admin/clubs");
  await connection();
  const env = getCloudflareContext().env;
  const clubs = await getClubRecords(env.DB);

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Admin overview
            </Link>
            <span className="text-blue-300">Clubs</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Manage clubs
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Add clubs and maintain their archive names, colours and
                geographic details.
              </p>
            </div>
            <div className="border border-white/15 px-5 py-4">
              <span className="block font-mono text-3xl font-bold">
                {clubs.length}
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-white/50">
                Club records
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <ClubAdmin initialClubs={clubs} />
      </section>
    </main>
  );
}
