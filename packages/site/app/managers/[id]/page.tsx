import { JsonLd, absoluteUrl, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { getAllArticlesForTag } from "@/lib/api";
import { mapGame } from "@/lib/games";
import {
  calculateManagerStats,
  formatManagerDate,
} from "@/lib/managerComparisonData";
import {
  getManagerById,
  getManagerLinks,
  managerArticleTag,
} from "@/lib/managers";
import { pageMetadata } from "@/lib/seo";
import { queryGameRows } from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ArrowLeftIcon, UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
const fallbackImage =
  "https://images.ctfassets.net/pz711f8blqyy/4xiJsea65ajh0swqmdEbOF/a2fc207703c03245cd64a8c01b857e28/2021.svg";

export async function generateMetadata({ params }: Props) {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const manager = await getManagerById(db, (await params).id);
  if (!manager) return {};
  return pageMetadata({
    title: `${manager.name} – Tranmere Rovers manager`,
    description: `${manager.name}'s Tranmere Rovers managerial record, statistics, archive stories and external links.`,
    pathname: `/managers/${manager.id}`,
  });
}

export default async function ManagerProfilePage({ params }: Props) {
  const id = (await params).id;
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const manager = await getManagerById(db, id);
  if (!manager) notFound();
  const dateTo = /^(now|present)/i.test(manager.dateLeft.trim())
    ? new Date().toISOString().slice(0, 10)
    : manager.dateLeft;
  const articleTag = managerArticleTag(manager.name);
  const [rows, links, articles] = await Promise.all([
    queryGameRows(db, {
      dateFrom: manager.dateJoined,
      dateTo,
      playedOnly: true,
      statisticsOnly: true,
      sort: "date-desc",
    }),
    getManagerLinks(db, manager.id),
    getAllArticlesForTag(100, articleTag),
  ]);
  const stats = calculateManagerStats(rows.map(mapGame));
  const primaryStats = [
    ["Played", stats.played],
    ["Won", stats.won],
    ["Drawn", stats.drawn],
    ["Lost", stats.lost],
    ["Win rate", `${stats.winRate.toFixed(1)}%`],
    ["Points/game", stats.pointsPerGame.toFixed(2)],
  ];
  const secondaryStats = [
    ["Goals for", stats.goalsFor],
    ["Goals against", stats.goalsAgainst],
    ["Best winning run", stats.bestWinningRun],
    ["Best unbeaten run", stats.bestUnbeatenRun],
  ];

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: manager.name,
          jobTitle: "Football manager",
          image: manager.imagePath,
          url: absoluteUrl(`/managers/${manager.id}`),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Managers", pathname: "/managers" },
          { name: manager.name, pathname: `/managers/${manager.id}` },
        ])}
      />
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <Link
            href="/managers"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-300"
          >
            <ArrowLeftIcon className="h-4 w-4" /> All managers
          </Link>
          <div className="mt-7 grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] md:items-end">
            <div className="aspect-[4/3] overflow-hidden border border-white/15 bg-white/5">
              {manager.imagePath ? (
                <Image
                  src={manager.imagePath}
                  alt={manager.name}
                  width={640}
                  height={480}
                  unoptimized
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <UserIcon className="h-full w-full p-14 text-white/15" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                Manager archive
              </p>
              <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
                {manager.name}
              </h1>
              <p className="mt-5 font-mono text-sm text-white/60">
                {formatManagerDate(manager.dateJoined)} –{" "}
                {formatManagerDate(manager.dateLeft)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <section aria-labelledby="manager-record-heading">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            At a glance
          </p>
          <h2
            id="manager-record-heading"
            className="mt-2 font-display text-3xl font-semibold"
          >
            Managerial record
          </h2>
          <dl className="mt-6 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-3 lg:grid-cols-6">
            {primaryStats.map(([label, value]) => (
              <div key={label} className="bg-[#fffdf8] p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#071a2b]/45">
                  {label}
                </dt>
                <dd className="mt-2 font-mono text-3xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-px grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4">
            {secondaryStats.map(([label, value]) => (
              <div key={label} className="bg-[#e8e2d6] px-5 py-4">
                <dt className="text-xs font-bold text-[#071a2b]/55">{label}</dt>
                <dd className="mt-1 font-mono text-xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-[#071a2b]/50">
            Competitive first-team matches during the recorded appointment.
            {manager.favouriteFormation
              ? ` Recorded preferred formation: ${manager.favouriteFormation}.`
              : ""}
          </p>
        </section>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-labelledby="manager-stories-heading">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Stories &amp; history
            </p>
            <h2
              id="manager-stories-heading"
              className="mt-2 font-display text-3xl font-semibold"
            >
              Tagged articles
            </h2>
            {articles.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {articles.map((article) => (
                  <article
                    key={article.slug}
                    className="group border border-[#071a2b]/15 bg-[#fffdf8] p-3"
                  >
                    <Link
                      href={`/page/blog/${article.slug}`}
                      className="relative block aspect-[4/3] overflow-hidden bg-[#e8e2d6]"
                    >
                      <Image
                        src={article.pic?.url ?? fallbackImage}
                        alt={article.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.025]"
                      />
                    </Link>
                    <div className="px-2 pb-2 pt-5">
                      <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                        {new Date(article.datePosted).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </time>
                      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                        <Link
                          href={`/page/blog/${article.slug}`}
                          className="hover:text-blue-700"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#071a2b]/60">
                        {article.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] p-7">
                <p className="font-semibold">No tagged articles yet.</p>
                <p className="mt-2 text-sm text-[#071a2b]/55">
                  Tag a blog post with “{articleTag}” to include it here.
                </p>
              </div>
            )}
          </section>

          <aside aria-labelledby="manager-links-heading">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Further reading
            </p>
            <h2
              id="manager-links-heading"
              className="mt-2 font-display text-3xl font-semibold"
            >
              External links
            </h2>
            {links.length > 0 ? (
              <div className="mt-6 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#fffdf8] px-5 py-4 transition hover:bg-[#e8e2d6]"
                  >
                    <span className="block font-bold text-blue-700">
                      {link.description || link.label} ↗
                    </span>
                    {link.publisher && (
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                        {link.publisher}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] p-5 text-sm text-[#071a2b]/55">
                No external sources have been added yet.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
