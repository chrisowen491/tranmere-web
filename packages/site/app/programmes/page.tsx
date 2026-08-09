import { BookOpenIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getProgrammes, type ProgrammeRecord } from "@/lib/programmes";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Tranmere Rovers programme gallery",
  description:
    "Browse digitised Tranmere Rovers match programmes in an interactive page-turning archive.",
  pathname: "/programmes",
});

function formatProgrammeDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function absoluteProgrammeUrl(programme: ProgrammeRecord) {
  return programme.url.startsWith("http")
    ? programme.url
    : `https://www.tranmere-web.com${programme.url}`;
}

export default async function ProgrammesPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const programmes = await getProgrammes(env.DB);
  const digitisedPages = programmes.reduce(
    (total, programme) => total + programme.pages,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Programme gallery", pathname: "/programmes" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers programme gallery",
          description:
            "Digitised Tranmere Rovers match programmes available to read online.",
          url: "https://www.tranmere-web.com/programmes",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: programmes.length,
            itemListElement: programmes.map((programme, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `https://www.tranmere-web.com/programmes/${programme.date}`,
              item: {
                "@type": "DigitalDocument",
                name: programme.name,
                datePublished: programme.date,
                numberOfPages: programme.pages,
                encodingFormat: "application/pdf",
                contentUrl: absoluteProgrammeUrl(programme),
              },
            })),
          },
        }}
      />

      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Programme archive
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
                Matchday history,
                <br />
                page by page.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Choose a programme, turn the pages and revisit the stories,
                squads and moments recorded on matchday.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Editions
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {programmes.length}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Digitised pages
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {digitisedPages}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-9 border-b border-[#071a2b]/15 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            The collection
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Browse programmes
          </h2>
        </div>

        {programmes.length > 0 ? (
          <div className="grid gap-px overflow-hidden border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 xl:grid-cols-3">
            {programmes.map((programme, index) => (
              <Link
                key={`${programme.date}-${programme.url}`}
                href={`/programmes/${programme.date}`}
                className="group flex min-h-64 flex-col bg-[#fffdf8] p-7 transition hover:bg-white sm:p-8"
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    Edition {String(index + 1).padStart(2, "0")}
                  </span>
                  <BookOpenIcon className="h-6 w-6 text-[#071a2b]/30 transition group-hover:text-blue-700" />
                </div>
                <h3 className="mt-8 font-display text-3xl font-semibold leading-tight tracking-[-0.035em]">
                  {programme.name}
                </h3>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-8 text-sm text-[#071a2b]/60">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-blue-700" />
                    {formatProgrammeDate(programme.date)}
                  </span>
                  <span>{programme.pages} pages</span>
                </div>
                <span className="mt-5 border-t border-[#071a2b]/12 pt-5 text-sm font-bold text-blue-700">
                  Read the programme <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-16 text-center">
            <BookOpenIcon className="mx-auto h-10 w-10 text-blue-700" />
            <h3 className="mt-5 font-display text-3xl font-semibold">
              The digital shelf is being prepared.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#071a2b]/60">
              Programmes added to the Tranmere-Web database will appear here
              automatically.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-[#071a2b]/10 bg-[#fffdf8]">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              The collection will grow
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
              More programmes can join the shelf.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
              Have a Tranmere programme that could be preserved in the digital
              archive? Get in touch and tell us about it.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex w-fit items-center justify-center bg-[#1557ff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071a2b]"
          >
            Contact Tranmere-Web
          </Link>
        </div>
      </section>
    </main>
  );
}
