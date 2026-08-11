"use client";

import { Shirt } from "@/lib/types";
import type { Comment } from "@/lib/comments";
import CommentPanel from "@/components/comments/CommentPanel";
import { Reviews } from "@/components/comments/Reviews";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  PaintBrushIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

function factValue(value: string | undefined) {
  return value && value !== "Other" ? value : "Not recorded";
}

export function ShirtApp({
  shirt,
  comments,
  averageRating,
}: {
  shirt: Shirt;
  comments: Comment[];
  averageRating: number;
}) {
  const images = shirt.imagesCollection.items;
  const primaryImage = images[0];
  const firstSeason = shirt.seasons[0];
  const lastSeason = shirt.seasons.at(-1);
  const seasonRange =
    firstSeason === lastSeason ? firstSeason : `${firstSeason}–${lastSeason}`;
  const variants = shirt.variants?.filter(Boolean) ?? [];

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/10 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-10 lg:px-12 lg:pb-24">
          <Link
            href="/shirts"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            The shirt archive
          </Link>

          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                <span className="h-px w-10 bg-blue-400" />
                Kit study · {shirt.use}
              </p>
              <h1 className="mt-7 max-w-4xl font-display text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
                {shirt.name}
              </h1>
            </div>

            <div className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <span className="block font-display text-3xl font-semibold">
                  {seasonRange || "—"}
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                  Seasons worn
                </span>
              </div>
              <div className="p-5">
                <span className="block font-display text-3xl font-semibold">
                  {shirt.color}
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                  Primary colour
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:px-12 lg:py-16">
        <div className="min-w-0">
          <div className="relative overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
            <div className="absolute left-5 top-5 z-10 bg-blue-700 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              Archive reconstruction
            </div>
            <div className="absolute right-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.16em] text-[#071a2b]/35">
              Tranmere-Web
            </div>
            {primaryImage ? (
              <div className="relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src={primaryImage.url}
                  alt={
                    primaryImage.description ||
                    `${shirt.name} archive reconstruction`
                  }
                  fill
                  priority
                  sizes="(min-width: 1024px) 760px, 100vw"
                  className="object-contain p-5 sm:p-10"
                />
              </div>
            ) : (
              <div className="grid aspect-[4/5] place-items-center text-sm text-[#071a2b]/45">
                No kit image available
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.slice(1).map((image) => (
                <div
                  key={image.url}
                  className="relative aspect-square overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]"
                >
                  <Image
                    src={image.url}
                    alt={image.description || `${shirt.name} detail`}
                    fill
                    sizes="(min-width: 640px) 240px, 50vw"
                    className="object-contain p-4"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              The shirt
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em]">
              A piece of Rovers history
            </h2>
            <div className="mt-6 text-base leading-7 text-[#071a2b]/65 [&_p+p]:mt-4">
              {shirt.description ? (
                documentToReactComponents(shirt.description.json)
              ) : (
                <p>
                  A clean {shirt.color.toLowerCase()} {shirt.use.toLowerCase()}{" "}
                  shirt from the {shirt.decade} archive, reconstructed to
                  preserve the look of the kit worn at the time.
                </p>
              )}
            </div>

            <dl className="mt-8 grid grid-cols-2 border-l border-t border-[#071a2b]/15">
              {[
                {
                  label: "Usage",
                  value: shirt.use,
                  icon: TagIcon,
                },
                {
                  label: "Colour",
                  value: shirt.color,
                  icon: PaintBrushIcon,
                },
                {
                  label: "Manufacturer",
                  value: factValue(shirt.manufacturer),
                  icon: SparklesIcon,
                },
                {
                  label: "Era",
                  value: shirt.decade || "Not recorded",
                  icon: CalendarDaysIcon,
                },
              ].map((fact) => (
                <div
                  key={fact.label}
                  className="min-h-32 border-b border-r border-[#071a2b]/15 p-4"
                >
                  <fact.icon className="h-5 w-5 text-blue-700" />
                  <dt className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-bold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-5 border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Seasons in use
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {shirt.seasons.map((season) => (
                <Link
                  key={season}
                  href={`/season/${season}`}
                  className="border border-[#071a2b]/20 bg-[#f4f0e8] px-3 py-2 font-mono text-xs font-bold transition hover:border-blue-700 hover:bg-blue-700 hover:text-white"
                >
                  {season}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-5 border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Supporter verdict
            </p>
            <Reviews
              text="Supporter rating"
              avg={averageRating}
              count={comments.length}
              className="mt-3"
            />
          </section>

          <section className="mt-5 border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Known variants
            </p>
            {variants.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[#071a2b]/65">
                {variants.map((variant) => (
                  <li key={variant} className="border-l-2 border-blue-700 pl-3">
                    {variant}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#071a2b]/55">
                No contemporary variants are currently recorded.
              </p>
            )}
          </section>

          <section className="mt-5 bg-[#071a2b] p-6 text-white sm:p-8">
            <InformationCircleIcon className="h-6 w-6 text-blue-300" />
            <h2 className="mt-4 font-display text-2xl font-semibold">
              About this reconstruction
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Archive kit images are AI-assisted visual studies based on known
              colours and period details. They are illustrative rather than
              original match-worn photographs.
            </p>
          </section>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 sm:px-10 lg:px-12">
        <div className="grid gap-8 border-y border-[#071a2b]/15 py-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Supporter verdict
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em]">
              Comments &amp; ratings
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#071a2b]/60">
              Share your memories and rate this shirt from the Rovers archive.
            </p>
          </div>
          <CommentPanel comments={comments} url={`/shirts/${shirt.slug}`} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <Link
          href="/shirts"
          className="group flex items-center justify-between border-y border-[#071a2b]/15 py-8"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Continue exploring
            </span>
            <span className="mt-2 block font-display text-3xl font-semibold">
              Browse the complete shirt archive
            </span>
          </span>
          <ArrowLeftIcon className="h-7 w-7 rotate-180 transition group-hover:translate-x-1" />
        </Link>
      </section>
    </main>
  );
}
