import { SeasonNewsAdmin } from "@/components/apps/admin/SeasonNewsAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { getSeasonNewsSnippets } from "@/lib/seasonNews";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Manage season news",
  description: "Manage archive news snippets for season timelines.",
};

export default async function SeasonNewsAdminPage() {
  await requireAdminPage("/admin/season-news");
  const snippets = await getSeasonNewsSnippets(getCloudflareContext().env.DB);
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
          <Link
            href="/admin"
            className="text-xs font-bold uppercase tracking-[0.14em] text-white/45 hover:text-white"
          >
            Admin overview
          </Link>
          <h1 className="mt-5 font-display text-5xl font-semibold">
            Manage season news
          </h1>
          <p className="mt-4 max-w-2xl text-white/65">
            Add short, dated archive notes to a season’s timeline and tag the
            people involved.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <SeasonNewsAdmin initialSnippets={snippets} />
      </section>
    </main>
  );
}
