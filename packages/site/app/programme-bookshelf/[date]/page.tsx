import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlipBook } from "@/components/apps/partials/FlipBook";
import { ProgrammeCollectionControl } from "@/components/apps/ProgrammeCollectionControl";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";
import {
  getCollectionEntry,
  getProgrammeGame,
} from "@/lib/programmeCollections";
import { getProgrammeByDate, type ProgrammeRecord } from "@/lib/programmes";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface ProgrammePageParams {
  date: string;
}

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

async function loadProgramme(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const env = (await getCloudflareContext({ async: true })).env;
  return getProgrammeByDate(env.DB, date);
}

export async function generateMetadata(props: {
  params: Promise<ProgrammePageParams>;
}): Promise<Metadata> {
  const { date } = await props.params;
  const programme = await loadProgramme(date);

  if (!programme) {
    return pageMetadata({
      title: "Programme not found",
      description: "This programme could not be found in the archive.",
      pathname: `/programme-bookshelf/${date}`,
    });
  }

  return pageMetadata({
    title: `${programme.name} programme`,
    description: `Read the ${formatProgrammeDate(programme.date)} ${programme.name} match programme online.`,
    pathname: `/programme-bookshelf/${programme.date}`,
  });
}

export default async function ProgrammePage(props: {
  params: Promise<ProgrammePageParams>;
}) {
  const { date } = await props.params;
  const programme = await loadProgramme(date);
  if (!programme) notFound();
  const env = (await getCloudflareContext({ async: true })).env;
  const session = await auth0.getSession();
  const game = await getProgrammeGame(env.DB, programme.date);
  const account = session
    ? await resolveAccount(env.DB, session.user.sub)
    : null;
  const collectionEntry =
    account && game
      ? await getCollectionEntry(env.DB, account.id, game.id)
      : null;

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Programme gallery", pathname: "/programme-bookshelf" },
          {
            name: programme.name,
            pathname: `/programme-bookshelf/${programme.date}`,
          },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DigitalDocument",
          name: programme.name,
          datePublished: programme.date,
          numberOfPages: programme.pages,
          encodingFormat: "application/pdf",
          contentUrl: absoluteProgrammeUrl(programme),
          url: `https://www.tranmere-web.com/programme-bookshelf/${programme.date}`,
        }}
      />

      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <Link
            href="/programme-bookshelf"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Programme archive
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Matchday edition · {formatProgrammeDate(programme.date)}
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl">
                {programme.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="grid border border-[#071a2b]/15 bg-[#fffdf8] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-[#071a2b]/15 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-blue-700">
              Digital programme
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em]">
              {programme.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#071a2b]/60">
              Browse this digitised Tranmere Rovers matchday programme and
              revisit the stories, squads and moments recorded on the day.
            </p>

            <dl className="mt-8 divide-y divide-[#071a2b]/12 border-y border-[#071a2b]/12">
              <div className="flex items-center gap-3 py-4">
                <CalendarDaysIcon className="h-5 w-5 text-blue-700" />
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#071a2b]/45">
                    Match date
                  </dt>
                  <dd className="mt-1 text-sm font-bold">
                    {formatProgrammeDate(programme.date)}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3 py-4">
                <BookOpenIcon className="h-5 w-5 text-blue-700" />
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#071a2b]/45">
                    Edition
                  </dt>
                  <dd className="mt-1 text-sm font-bold">
                    {programme.pages} pages
                  </dd>
                </div>
              </div>
            </dl>

            <p className="mt-7 text-xs leading-5 text-[#071a2b]/45">
              Use the arrows to turn pages, or open the reader full-screen for a
              closer look.
            </p>
          </aside>

          <div className="min-w-0 bg-[#071a2b] p-2 sm:p-4">
            <FlipBook
              bookPath={programme.url}
              className="h-[34rem] sm:h-[44rem] lg:h-[54rem]"
            />
          </div>
        </div>
        <div className="mt-8">
          {session && game ? (
            <ProgrammeCollectionControl
              gameId={game.id}
              initialEntry={collectionEntry}
            />
          ) : session ? (
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 text-sm font-semibold">
              This programme is not yet linked to its canonical match record.
            </div>
          ) : (
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 text-sm font-semibold">
              <a
                href={`/auth/login?returnTo=${encodeURIComponent(`/programme-bookshelf/${programme.date}`)}`}
                className="text-blue-700"
              >
                Log in
              </a>{" "}
              to add this programme to your collection.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
