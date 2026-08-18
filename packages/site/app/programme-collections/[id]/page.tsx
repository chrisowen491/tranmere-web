import { getCloudflareContext } from "@opennextjs/cloudflare";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCollection } from "@/lib/programmeCollections";

export const dynamic = "force-dynamic";

export default async function PublicProgrammeCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getPublicCollection(
    getCloudflareContext().env.DB,
    id,
  );
  if (!collection) notFound();
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Programme collectors
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Wanted and available to trade
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            An anonymous supporter list. Personal details and private collection
            notes are never published.
          </p>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-10 lg:px-12">
        <nav aria-label="Programme collector navigation">
          <Link
            href="/programme-collections"
            className="text-sm font-bold text-blue-700"
          >
            ← Browse all collectors
          </Link>
        </nav>
        {collection.entries.length ? (
          <section className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
            {collection.entries.map((entry) => (
              <Link
                key={entry.game_id}
                href={`/match/${entry.season}/${entry.match_date}`}
                className="group bg-[#fffdf8] transition hover:bg-[#e8e2d6]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#071a2b] p-5">
                  {entry.programme_url ? (
                    <Image
                      src={`https://img.tranmere-web.com/${entry.programme_url}`}
                      alt={`${entry.match_name} match programme`}
                      fill
                      className="object-contain p-5 transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center font-mono text-xs uppercase tracking-[0.14em] text-white/55">
                      Programme cover not recorded
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    {entry.status === "wanted"
                      ? "Wanted"
                      : "Available to trade"}
                  </span>
                  <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em]">
                    {entry.match_name}
                  </h2>
                  <p className="mt-3 text-sm text-[#071a2b]/55">
                    {entry.match_date} · {entry.competition}
                  </p>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Shared collector
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
              No wanted or trade items yet
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#071a2b]/60">
              This collector has made their list discoverable, but has not
              published any programmes as wanted or available to trade.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
