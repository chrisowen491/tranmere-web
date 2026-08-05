import Link from "next/link";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

const archiveLinks = [
  {
    title: "Search every player",
    description: "Browse the full alphabetical archive and filter by season.",
    href: "/players",
    icon: MagnifyingGlassIcon,
  },
  {
    title: "Explore player records",
    description: "Find Rovers’ leading appearance makers and goalscorers.",
    href: "/players/records/most-appearances",
    icon: TrophyIcon,
  },
];

export default function PlayerNotFound() {
  return (
    <main className="min-h-[70vh] border-b border-[#071a2b]/10 bg-[#f4f0e8] text-[#071a2b]">
      <section className="border-b border-[#071a2b]/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:px-12 lg:py-24">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-blue-700" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Player archive · 404
              </p>
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              No profile on the teamsheet.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#071a2b]/65">
              We could not find this player in the Tranmere-Web database. The
              archive may use a different spelling, or their profile may not
              have been added yet.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/players"
                className="inline-flex items-center justify-center gap-3 bg-blue-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-[#071a2b] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-4"
              >
                Browse all players
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-[#071a2b]/20 px-6 py-4 text-sm font-bold transition hover:border-[#071a2b] hover:bg-[#fffdf8] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-4"
              >
                Tell us who is missing
              </Link>
            </div>
          </div>

          <div
            className="relative min-h-80 overflow-hidden bg-[#071a2b] p-8 text-white shadow-[14px_14px_0_0_rgba(7,26,43,0.1)] sm:p-10"
            aria-hidden="true"
          >
            <div className="absolute inset-0 opacity-15 [background-image:repeating-linear-gradient(115deg,transparent,transparent_22px,white_23px,transparent_24px)]" />
            <div className="relative flex h-full min-h-64 flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Squad search
                </p>
                <span className="border border-white/25 px-3 py-1 text-xs font-bold">
                  NOT FOUND
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-display text-8xl font-semibold leading-none text-white/15">
                    ?
                  </p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em]">
                    Awaiting a Rovers record
                  </p>
                </div>
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/10">
                  <UserIcon className="h-12 w-12 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          Keep exploring
        </p>
        <div className="mt-5 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 md:grid-cols-2">
          {archiveLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex gap-5 bg-[#fffdf8] p-6 transition hover:bg-white sm:p-8"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#071a2b]/15 text-blue-700 transition group-hover:border-blue-700">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.02em]">
                  {item.title}
                  <ArrowRightIcon
                    className="h-4 w-4 transition group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-2 block text-sm leading-6 text-[#071a2b]/60">
                  {item.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
