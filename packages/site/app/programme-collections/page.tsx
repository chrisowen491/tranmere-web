import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { getPublicProgrammeCollectors } from "@/lib/programmeCollections";
import { SupporterAvatar } from "@/components/apps/SupporterAvatar";

export const dynamic = "force-dynamic";

export default async function ProgrammeCollectorsPage() {
  const collectors = await getPublicProgrammeCollectors(
    getCloudflareContext().env.DB,
  );

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Programme collectors
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Find a collector
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Browse anonymous wanted and trade lists shared by Rovers programme
            collectors. Personal details and private collection notes remain
            hidden.
          </p>
          <dl className="mt-9 max-w-xs border border-white/15">
            <div className="p-5">
              <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                Public collectors
              </dt>
              <dd className="mt-2 font-display text-3xl font-semibold">
                {collectors.length}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        {collectors.length ? (
          <section className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
            {collectors.map((collector, index) => (
              <Link
                key={collector.public_id}
                href={`/programme-collections/${collector.public_id}`}
                className="group bg-[#fffdf8] p-6 transition hover:bg-[#e8e2d6] sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <SupporterAvatar
                    avatarUrl={collector.avatar_url}
                    label={`Anonymous collector ${index + 1} avatar`}
                    className="h-14 w-14"
                  />
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    Anonymous collector {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] group-hover:text-blue-700">
                  Wanted and trade list
                </h2>
                <dl className="mt-6 grid grid-cols-2 border border-[#071a2b]/15">
                  <div className="border-r border-[#071a2b]/15 p-4">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/45">
                      Wanted
                    </dt>
                    <dd className="mt-2 font-mono text-2xl font-bold">
                      {collector.wanted_count}
                    </dd>
                  </div>
                  <div className="p-4">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/45">
                      To trade
                    </dt>
                    <dd className="mt-2 font-mono text-2xl font-bold">
                      {collector.trade_count}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 border-t border-[#071a2b]/15 pt-5 text-right text-sm font-bold">
                  <span className="text-blue-700">Open list →</span>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Collector directory
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
              No public lists yet
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#071a2b]/60">
              Logged-in collectors can publish an anonymous wanted and trade
              list from their programme profile.
            </p>
            <Link
              href="/profile/programmes"
              className="mt-7 inline-block bg-[#1557ff] px-5 py-3 text-sm font-bold text-white hover:bg-[#071a2b]"
            >
              Open your programme collection →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
