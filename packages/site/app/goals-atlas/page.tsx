import { GoalsAtlas } from "@/components/apps/GoalsAtlas";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { searchGoalAtlas } from "@/lib/goalAtlas";
import { pageMetadata } from "@/lib/seo";
import { queryGoalAtlasFilterOptions } from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const metadata = pageMetadata({
  title: "Tranmere Rovers Goals Atlas",
  description:
    "Explore when, how and against whom Tranmere Rovers goals were scored.",
  pathname: "/goals-atlas",
});

export default async function GoalsAtlasPage() {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const [initialData, options] = await Promise.all([
    searchGoalAtlas(db, {}, { cursor: 0, limit: 50 }),
    queryGoalAtlasFilterOptions(db),
  ]);
  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers Goals Atlas",
          description: "Interactive archive of Tranmere Rovers goals.",
          url: "https://www.tranmere-web.com/goals-atlas",
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Goals Atlas", pathname: "/goals-atlas" },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Goals archive
          </p>
          <h1 className="mt-7 max-w-4xl font-display text-6xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-8xl">
            The Goals Atlas.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65">
            Explore when, how and against whom Rovers scored—then follow every
            goal back to its scorer and match.
          </p>
        </div>
      </header>
      <GoalsAtlas initialData={initialData} options={options} />
    </main>
  );
}
