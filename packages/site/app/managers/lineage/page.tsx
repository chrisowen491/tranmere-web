import {
  ArrowRightIcon,
  CalendarDaysIcon,
  LinkIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getManagerLineage } from "@/lib/managerLineage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers manager lineage",
  description:
    "Follow every Tranmere Rovers managerial handover, inherited squad, tactical thread, key result, transfer and honour.",
  pathname: "/managers/lineage",
});

function formatDate(value: string) {
  if (/^(now|present)/i.test(value.trim())) return "Present";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

export default async function ManagerLineagePage() {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const lineage = await getManagerLineage(db);

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Managers", pathname: "/managers" },
          { name: "Manager lineage", pathname: "/managers/lineage" },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Manager lineage
          </p>
          <h1 className="mt-7 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
            Every handover.
            <br />
            Every inherited side.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Follow the Rovers dugout chronologically and open each tenure to see
            the players, shapes, results and decisions carried from one era into
            the next.
          </p>
          <nav
            aria-label="Manager analysis"
            className="mt-10 flex flex-wrap gap-px border border-white/15 bg-white/15"
          >
            {[
              ["Fingerprints", "/managers/fingerprints"],
              ["Comparisons", "/managers/comparison"],
              ["Trusted XIs", "/managers/trusted-xi"],
              ["All managers", "/managers"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 bg-[#071a2b] px-5 py-4 text-sm font-bold transition hover:bg-blue-700"
              >
                {label}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-10 border-b border-[#071a2b]/15 pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            Earliest appointment first
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            The succession line
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-[#071a2b]/60">
            Open a tenure for its inherited players, tactical record, landmark
            result, notable transfers and honours. Where appointments overlap, a
            match is attributed to the most recently appointed active manager.
          </p>
        </div>

        <ol className="relative border-l border-[#071a2b]/20 pl-5 sm:pl-9">
          {lineage.map((entry, index) => (
            <li
              key={entry.manager.id}
              id={`tenure-${entry.manager.id}`}
              className="relative pb-8 last:pb-0"
            >
              <span
                aria-hidden="true"
                className="absolute -left-[26px] top-7 h-3 w-3 border-2 border-[#f4f0e8] bg-blue-700 sm:-left-[42px]"
              />
              <details
                open={index === lineage.length - 1}
                className="group border border-[#071a2b]/15 bg-[#fffdf8]"
              >
                <summary className="cursor-pointer list-none px-5 py-6 marker:hidden sm:px-7 [&::-webkit-details-marker]:hidden">
                  <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                          Tenure {index + 1}
                        </span>
                        {entry.tenureLabels.map((label) => (
                          <span
                            key={label}
                            className="border border-[#071a2b]/15 bg-[#e8e2d6] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em]"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                      <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                        {entry.manager.name}
                      </h3>
                      <p className="mt-3 flex items-center gap-2 text-sm text-[#071a2b]/60">
                        <CalendarDaysIcon
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        {formatDate(entry.manager.dateJoined)}–
                        {formatDate(entry.manager.dateLeft)}
                      </p>
                    </div>
                    <dl className="grid grid-cols-2 border border-[#071a2b]/15 text-center">
                      <div className="border-r border-[#071a2b]/15 px-5 py-3">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/45">
                          Games
                        </dt>
                        <dd className="mt-1 font-mono text-xl font-bold">
                          {entry.games}
                        </dd>
                      </div>
                      <div className="px-5 py-3">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/45">
                          Players
                        </dt>
                        <dd className="mt-1 font-mono text-xl font-bold">
                          {entry.playersUsed}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <p className="mt-5 border-t border-[#071a2b]/10 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                    <span className="group-open:hidden">
                      Open tenure details +
                    </span>
                    <span className="hidden group-open:inline">
                      Close tenure details −
                    </span>
                  </p>
                </summary>

                <div className="grid gap-px border-t border-[#071a2b]/15 bg-[#071a2b]/15 lg:grid-cols-2">
                  <section className="bg-[#fffdf8] p-5 sm:p-7">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                      Succession
                    </p>
                    <dl className="mt-4 grid grid-cols-2 border border-[#071a2b]/15">
                      <div className="p-4">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/45">
                          Previous
                        </dt>
                        <dd className="mt-2 font-semibold">
                          {entry.previous ? (
                            <Link
                              href={`#tenure-${entry.previous.id}`}
                              className="hover:text-blue-700"
                            >
                              {entry.previous.name}
                            </Link>
                          ) : (
                            "Archive begins"
                          )}
                        </dd>
                      </div>
                      <div className="border-l border-[#071a2b]/15 p-4">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/45">
                          Next
                        </dt>
                        <dd className="mt-2 font-semibold">
                          {entry.next ? (
                            <Link
                              href={`#tenure-${entry.next.id}`}
                              className="hover:text-blue-700"
                            >
                              {entry.next.name}
                            </Link>
                          ) : (
                            "Current era"
                          )}
                        </dd>
                      </div>
                    </dl>
                    <Link
                      href={`/managers/${entry.manager.id}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
                    >
                      Full manager profile
                      <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </section>

                  <section className="bg-[#fffdf8] p-5 sm:p-7">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                      Tactical continuity
                    </p>
                    <p className="mt-4 text-sm text-[#071a2b]/55">
                      Preferred formation
                    </p>
                    <p className="mt-1 font-display text-3xl font-semibold">
                      {entry.preferredFormation ?? "Not recorded"}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {entry.commonFormations.length ? (
                        entry.commonFormations.map((formation) => (
                          <span
                            key={formation.formation}
                            className="border border-[#071a2b]/15 bg-[#e8e2d6] px-3 py-2 font-mono text-xs font-bold"
                          >
                            {formation.formation} · {formation.games}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[#071a2b]/50">
                          No match formations recorded.
                        </span>
                      )}
                    </div>
                  </section>

                  <section className="bg-[#fffdf8] p-5 sm:p-7">
                    <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                      <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
                      Players inherited from predecessor
                    </p>
                    {entry.inheritedPlayers.length ? (
                      <ul className="mt-4 divide-y divide-[#071a2b]/10 border-y border-[#071a2b]/10">
                        {entry.inheritedPlayers.map((player) => (
                          <li
                            key={player.name}
                            className="flex items-center justify-between gap-4 py-2.5"
                          >
                            <Link
                              href={`/page/player/${encodeURIComponent(player.name)}`}
                              className="font-semibold hover:text-blue-700"
                            >
                              {player.name}
                            </Link>
                            <span className="font-mono text-xs text-[#071a2b]/45">
                              {player.selections} selections
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-[#071a2b]/50">
                        No shared-player record is available for this handover.
                      </p>
                    )}
                  </section>

                  <section className="bg-[#fffdf8] p-5 sm:p-7">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                      Landmark result
                    </p>
                    {entry.keyResult ? (
                      <Link
                        href={`/match/${entry.keyResult.season}/${entry.keyResult.date}`}
                        className="mt-4 block border-l-4 border-emerald-500 bg-emerald-50 p-4 transition hover:bg-emerald-100"
                      >
                        <span className="font-display text-2xl font-semibold">
                          {entry.keyResult.opposition} · {entry.keyResult.score}
                        </span>
                        <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#071a2b]/50">
                          {formatDate(entry.keyResult.date)} · biggest winning
                          margin
                        </span>
                      </Link>
                    ) : (
                      <p className="mt-4 text-sm text-[#071a2b]/50">
                        No competitive win is recorded for this tenure.
                      </p>
                    )}
                  </section>

                  <section className="bg-[#fffdf8] p-5 sm:p-7">
                    <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                      <LinkIcon className="h-4 w-4" aria-hidden="true" />
                      Transfer markers
                    </p>
                    {entry.transfers.length ? (
                      <ul className="mt-4 divide-y divide-[#071a2b]/10">
                        {entry.transfers.map((transfer) => (
                          <li
                            key={`${transfer.player}-${transfer.season}`}
                            className="py-3"
                          >
                            <Link
                              href={`/page/player/${encodeURIComponent(transfer.player)}`}
                              className="font-semibold hover:text-blue-700"
                            >
                              {transfer.player}
                            </Link>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                              {transfer.direction} · {transfer.otherClub} ·{" "}
                              {seasonLabel(transfer.season)}
                              {transfer.fee ? ` · ${transfer.fee}` : ""}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-[#071a2b]/50">
                        No transfer marker is recorded for this tenure.
                      </p>
                    )}
                  </section>

                  <section className="bg-[#fffdf8] p-5 sm:p-7">
                    <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                      <TrophyIcon className="h-4 w-4" aria-hidden="true" />
                      Honours and milestones
                    </p>
                    {entry.honours.length ? (
                      <ul className="mt-4 space-y-3">
                        {entry.honours.map((honour) => (
                          <li
                            key={`${honour.title}-${honour.achievedOn}`}
                            className={`border-l-4 p-4 ${
                              honour.kind === "Relegation"
                                ? "border-rose-500 bg-rose-50"
                                : "border-blue-700 bg-blue-50"
                            }`}
                          >
                            {honour.href ? (
                              <Link
                                href={honour.href}
                                className="font-bold hover:text-blue-700"
                              >
                                {honour.title}
                              </Link>
                            ) : (
                              <strong>{honour.title}</strong>
                            )}
                            <p className="mt-1 text-sm text-[#071a2b]/55">
                              {honour.detail}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-[#071a2b]/50">
                        No listed honour falls within this tenure.
                      </p>
                    )}
                  </section>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
