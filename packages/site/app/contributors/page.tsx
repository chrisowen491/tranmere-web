import { getPublicContributors } from "@/lib/correctionActivity";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Archive contributors",
  description: "Supporters who have helped improve the Tranmere-Web archive.",
};

export default async function ContributorsPage() {
  const contributors = await getPublicContributors(
    getCloudflareContext().env.DB,
  );
  const approved = contributors.reduce(
    (sum, contributor) => sum + contributor.approved_count,
    0,
  );
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Supporter-built archive
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Archive contributors
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            A voluntary acknowledgement of supporters whose approved corrections
            have made the Rovers archive more accurate.
          </p>
          <dl className="mt-9 grid max-w-lg grid-cols-2 border border-white/15">
            <div className="border-r border-white/15 p-5">
              <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                Recognised contributors
              </dt>
              <dd className="mt-2 font-display text-3xl font-semibold">
                {contributors.length}
              </dd>
            </div>
            <div className="p-5">
              <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                Approved contributions
              </dt>
              <dd className="mt-2 font-display text-3xl font-semibold">
                {approved}
              </dd>
            </div>
          </dl>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        {contributors.length ? (
          <section className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
            {contributors.map((contributor) => (
              <article
                key={contributor.auth_sub}
                className="bg-[#fffdf8] p-6 sm:p-8"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                  Archive contributor
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold">
                  @{contributor.display_name}
                </h2>
                <p className="mt-6 border-t border-[#071a2b]/10 pt-5 text-sm">
                  <span className="font-mono text-2xl font-bold">
                    {contributor.approved_count}
                  </span>{" "}
                  <span className="text-[#071a2b]/55">
                    approved{" "}
                    {contributor.approved_count === 1
                      ? "contribution"
                      : "contributions"}
                  </span>
                </p>
              </article>
            ))}
          </section>
        ) : (
          <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-8 sm:p-12">
            <h2 className="font-display text-4xl font-semibold">
              No public contributors yet
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#071a2b]/60">
              Contributors choose whether their supporter name and approved
              total appear here.
            </p>
            <Link
              href="/profile/corrections"
              className="mt-7 inline-block text-sm font-bold text-blue-700"
            >
              Manage your recognition preference →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
