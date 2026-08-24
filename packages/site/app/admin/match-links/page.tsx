import { MatchLinkAdmin } from "@/components/apps/admin/MatchLinkAdmin";
import { MatchLinkReview } from "@/components/apps/admin/MatchLinkReview";
import { requireAdminPage } from "@/lib/adminAuth";
import { getMatchLinkSuggestions } from "@/lib/matchLinks";
import { getCloudflareContext } from "@opennextjs/cloudflare";
export const dynamic = "force-dynamic";
export default async function MatchLinksAdminPage() {
  await requireAdminPage("/admin/match-links");
  const suggestions = await getMatchLinkSuggestions(
    getCloudflareContext().env.DB,
  );
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">
            Match archive
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold">
            External match links
          </h1>
          <p className="mt-4 text-white/65">
            Publish trusted links and review supporter suggestions.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 sm:px-10 lg:px-12">
        <MatchLinkAdmin />
        <MatchLinkReview initialSuggestions={suggestions} />
      </section>
    </main>
  );
}
