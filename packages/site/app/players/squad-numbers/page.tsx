import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { queryAppRows } from "@tranmere-web/lib/src/d1-queries";
import Link from "next/link";
import { buildSquadNumberHistory } from "@/lib/squadNumberHistory";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers squad-number history",
  description:
    "Explore the Tranmere Rovers players and seasons associated with every recorded shirt number.",
  pathname: "/players/squad-numbers",
});

type SearchParams = Promise<{ number?: string; season?: string }>;
const formatter = new Intl.NumberFormat("en-GB");

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

function yearRange(seasons: number[]) {
  if (seasons.length === 1) return seasonLabel(seasons[0]);
  return `${seasons[0]}–${seasons.at(-1)! + 1}`;
}

function selectionHref(number?: number, season?: number) {
  const params = new URLSearchParams();
  if (number) params.set("number", String(number));
  if (season) params.set("season", String(season));
  const query = params.toString();
  return `/players/squad-numbers${query ? `?${query}` : ""}`;
}

export default async function SquadNumberHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const params = await searchParams;
  const rows = await queryAppRows(db, { statisticsOnly: true });
  const archive = buildSquadNumberHistory(rows);
  const requestedNumber = Number(params.number);
  const selectedNumber = archive.numbers.some(
    (record) => record.number === requestedNumber,
  )
    ? requestedNumber
    : undefined;
  const requestedSeason = Number(params.season);
  const selectedSeason = archive.seasons.includes(requestedSeason)
    ? requestedSeason
    : undefined;
  const filtered = buildSquadNumberHistory(rows, {
    number: selectedNumber,
    season: selectedSeason,
  });
  const selectedRecord = selectedNumber
    ? filtered.numbers.find((record) => record.number === selectedNumber)
    : undefined;
  const firstSeason = archive.seasons.at(-1);
  const latestSeason = archive.seasons[0];

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Tranmere Rovers squad-number history",
          description:
            "Recorded starting shirt numbers from Tranmere Rovers match team sheets.",
          url: absoluteUrl("/players/squad-numbers"),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          { name: "Squad-number history", pathname: "/players/squad-numbers" },
        ])}
      />

      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <Link
            href="/players"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Player archive
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Shirts through time
              </p>
              <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
                Squad-number history.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Discover who wore each recorded Rovers number, from the
                traditional 1–11 to the modern squad-number era.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              {[
                [
                  formatter.format(archive.numberedRows.length),
                  "Recorded starts",
                ],
                [formatter.format(archive.players), "Players numbered"],
                [formatter.format(archive.numbers.length), "Numbers recorded"],
                [
                  firstSeason && latestSeason
                    ? `${firstSeason}–${latestSeason + 1}`
                    : "—",
                  "Archive span",
                ],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={`${index < 2 ? "border-b" : ""} ${index % 2 === 0 ? "border-r" : ""} border-white/15 p-5`}
                >
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    {label}
                  </dt>
                  <dd className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      <section className="border-b border-[#071a2b]/15 bg-[#e8e2d6]">
        <form
          action="/players/squad-numbers"
          className="mx-auto grid max-w-7xl gap-5 px-6 py-8 sm:grid-cols-[1fr_1fr_auto] sm:px-10 lg:px-12"
        >
          <label className="text-sm font-bold">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/50">
              Shirt number
            </span>
            <select
              name="number"
              defaultValue={selectedNumber ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="">Every number</option>
              {archive.numbers.map((record) => (
                <option key={record.number} value={record.number}>
                  Number {record.number}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#071a2b]/50">
              Season
            </span>
            <select
              name="season"
              defaultValue={selectedSeason ?? ""}
              className="w-full border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="">Every season</option>
              {archive.seasons.map((season) => (
                <option key={season} value={season}>
                  {seasonLabel(season)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Explore
            </button>
            {(selectedNumber || selectedSeason) && (
              <Link
                href="/players/squad-numbers"
                className="border border-[#071a2b]/20 bg-[#fffdf8] px-5 py-3 text-sm font-bold hover:text-blue-700"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          Number index
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          {selectedSeason
            ? `The ${seasonLabel(selectedSeason)} team sheets.`
            : "Every number in the archive."}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#071a2b]/60">
          Counts cover starting appearances where a shirt number has been
          recorded. Substitute numbers are not currently stored, and older
          numbers represent matchday shirts rather than permanent squad
          assignments.
        </p>

        {filtered.numbers.length ? (
          <div className="mt-9 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.numbers.map((record) => (
              <Link
                key={record.number}
                href={selectionHref(record.number, selectedSeason)}
                className="group flex min-h-52 flex-col bg-[#fffdf8] p-6 transition hover:bg-blue-50/70"
              >
                <div className="flex items-start justify-between gap-5">
                  <strong className="font-display text-6xl font-semibold tracking-[-0.05em] text-blue-700">
                    {record.number}
                  </strong>
                  <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#071a2b]/40">
                    {record.players}{" "}
                    {record.players === 1 ? "player" : "players"}
                  </span>
                </div>
                <p className="mt-6 font-bold group-hover:text-blue-700">
                  {record.leadingPlayer.player}
                </p>
                <p className="mt-1 text-xs text-[#071a2b]/50">
                  Most recorded starts · {record.leadingPlayer.appearances}
                </p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#071a2b]/40">
                    {record.appearances} starts · {yearRange(record.seasons)}
                  </span>
                  <ArrowRightIcon
                    className="h-4 w-4 text-blue-700 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-9 border border-[#071a2b]/15 bg-[#fffdf8] p-8">
            <h2 className="font-display text-3xl font-semibold">
              No numbered team sheets match these filters.
            </h2>
          </div>
        )}
      </section>

      {selectedRecord && (
        <section className="border-y border-[#071a2b]/15 bg-[#e8e2d6]">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Number {selectedRecord.number}
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Everyone recorded in the shirt.
            </h2>
            <div className="mt-8 overflow-x-auto border border-[#071a2b]/15">
              <table className="w-full min-w-[720px] border-collapse bg-[#fffdf8] text-left">
                <thead className="bg-[#071a2b] text-white">
                  <tr className="font-mono text-[9px] uppercase tracking-[0.14em]">
                    <th className="px-5 py-4">Player</th>
                    <th className="px-5 py-4">Seasons</th>
                    <th className="px-5 py-4">First recorded</th>
                    <th className="px-5 py-4">Last recorded</th>
                    <th className="px-5 py-4 text-right">Starts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071a2b]/10">
                  {selectedRecord.playerRecords.map((player) => (
                    <tr key={player.player} className="hover:bg-blue-50/70">
                      <td className="px-5 py-4">
                        <Link
                          href={`/page/player/${player.player}`}
                          className="font-bold hover:text-blue-700"
                        >
                          {player.player}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#071a2b]/60">
                        {yearRange(player.seasons)}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#071a2b]/60">
                        {player.firstDate}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#071a2b]/60">
                        {player.lastDate}
                      </td>
                      <td className="px-5 py-4 text-right font-display text-2xl font-semibold">
                        {player.appearances}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {!selectedNumber &&
        !selectedSeason &&
        archive.versatilePlayers.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Number collectors
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Players recorded in the most shirts.
            </h2>
            <div className="mt-8 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 md:grid-cols-2">
              {archive.versatilePlayers.slice(0, 10).map((player, index) => (
                <Link
                  key={player.player}
                  href={`/page/player/${player.player}`}
                  className="group grid grid-cols-[36px_1fr_auto] items-center gap-4 bg-[#fffdf8] px-5 py-5 hover:bg-blue-50/70"
                >
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <span>
                    <strong className="block group-hover:text-blue-700">
                      {player.player}
                    </strong>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                      Numbers {player.numbers.join(", ")}
                    </span>
                  </span>
                  <span className="text-right">
                    <strong className="block font-display text-2xl">
                      {player.numbers.length}
                    </strong>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#071a2b]/40">
                      shirts
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
    </main>
  );
}
