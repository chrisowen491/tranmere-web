import {
  ArrowRightIcon,
  CalendarDaysIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { buildImagePath } from "@tranmere-web/lib/src/apiFunctions";
import type { Manager } from "@tranmere-web/lib/src/tranmere-web-types";
import { getManagers } from "@/lib/managers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = pageMetadata({
  title: "Tranmere Rovers managers",
  description: "The complete record of Tranmere Rovers first-team managers.",
  pathname: "/managers",
});

function formatDate(value?: string) {
  if (!value || value.toLowerCase().startsWith("now")) {
    return "Present";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function isCurrentManager(manager: Manager) {
  return (
    manager.dateLeftText?.toLowerCase().startsWith("now") ||
    manager.dateLeft?.toLowerCase().startsWith("now")
  );
}

function managerImageSource(imagePath: string, width: number, height: number) {
  if (imagePath.startsWith("/") || /^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return buildImagePath(imagePath, width, height);
}

function managerStructuredImage(imagePath: string) {
  const source = managerImageSource(imagePath, 640, 480);
  return source.startsWith("/") ? absoluteUrl(source) : source;
}

export default async function ManagerRecords() {
  await connection();
  const managers = await getManagers(
    (await getCloudflareContext({ async: true })).env.DB,
  );
  const currentManager = managers.find(isCurrentManager);
  const earliestManager = managers.at(-1);
  const earliestYear = earliestManager?.dateJoined.match(/\d{4}/)?.[0];

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers managers",
          url: absoluteUrl("/managers"),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: managers.map((manager, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Person",
                name: manager.name,
                jobTitle: "Football manager",
                memberOf: { "@id": "https://www.tranmere-web.com/#team" },
                image: manager.imagePath
                  ? managerStructuredImage(manager.imagePath)
                  : undefined,
              },
            })),
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Managers", pathname: "/managers" },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Club history
          </p>
          <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
                The managers who shaped Rovers.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                A chronological archive of every first-team manager, from the
                earliest records to the Prenton Park dugout today.
              </p>
            </div>
            <div className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <strong className="block font-display text-4xl font-semibold">
                  {managers.length}
                </strong>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                  Managers
                </span>
              </div>
              <div className="p-5">
                <strong className="block font-display text-4xl font-semibold">
                  {earliestYear ?? "—"}
                </strong>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                  Records begin
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {currentManager && (
        <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:px-10 md:grid-cols-[180px_1fr_auto] md:items-center lg:px-12">
            <div className="aspect-[4/3] overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
              {currentManager.imagePath ? (
                <Image
                  alt={currentManager.name}
                  height={300}
                  width={400}
                  src={managerImageSource(
                    currentManager.imagePath,
                    400,
                    300,
                  )}
                  unoptimized
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <UserIcon className="h-full w-full p-10 text-blue-700/35" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Current manager
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                {currentManager.name}
              </h2>
              <p className="mt-3 flex items-center gap-2 text-sm text-[#071a2b]/60">
                <CalendarDaysIcon className="h-4 w-4" />
                Appointed {formatDate(currentManager.dateJoined)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-self-end">
              <Link
                href="/managers/comparison"
                className="inline-flex items-center gap-3 border border-blue-700 bg-blue-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                Compare managers
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/managers/trusted-xi"
                className="inline-flex items-center gap-3 border border-[#071a2b] bg-[#fffdf8] px-5 py-4 text-sm font-bold text-[#071a2b] transition hover:bg-white"
              >
                Trusted XI
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/managers/fingerprints"
                className="inline-flex items-center gap-3 border border-[#071a2b] bg-[#fffdf8] px-5 py-4 text-sm font-bold text-[#071a2b] transition hover:bg-white"
              >
                Manager fingerprints
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/results"
                className="inline-flex items-center gap-3 border border-[#071a2b] bg-[#071a2b] px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Match records
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-[#071a2b]/15 pb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              The complete record
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Managerial timeline
            </h2>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#071a2b]/45">
            Most recent first
          </p>
        </div>

        <ol className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((manager, index) => {
            const current = isCurrentManager(manager);

            return (
              <li
                key={`${manager.name}-${manager.dateJoined}`}
                className="group bg-[#fffdf8] p-4 transition hover:bg-white sm:p-5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e2d6]">
                  {manager.imagePath ? (
                    <Image
                      alt={manager.name}
                      height={480}
                      width={640}
                      src={managerImageSource(manager.imagePath, 640, 480)}
                      unoptimized
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-[#071a2b]">
                      <UserIcon className="h-24 w-24 text-white/15" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 bg-[#071a2b] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                    {current
                      ? "Current manager"
                      : `No. ${managers.length - index}`}
                  </span>
                </div>
                <div className="px-1 pb-2 pt-6">
                  <h3 className="font-display text-3xl font-semibold tracking-[-0.035em]">
                    {manager.name}
                  </h3>
                  <dl className="mt-6 grid grid-cols-2 border-t border-[#071a2b]/15 pt-4">
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#071a2b]/45">
                        Appointed
                      </dt>
                      <dd className="mt-1 text-sm font-semibold">
                        {formatDate(manager.dateJoined)}
                      </dd>
                    </div>
                    <div className="border-l border-[#071a2b]/15 pl-4">
                      <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#071a2b]/45">
                        Departed
                      </dt>
                      <dd className="mt-1 text-sm font-semibold">
                        {current
                          ? "Present"
                          : formatDate(
                              manager.dateLeftText ?? manager.dateLeft,
                            )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
