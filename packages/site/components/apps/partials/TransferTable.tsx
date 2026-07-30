import { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export function TransferTable(props: { title: string; records: Transfer[] }) {
  return (
    <section className="pb-8 pt-8">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Movement log
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {props.title}
        </h2>
      </div>

      {props.records.length > 0 ? (
        <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#f4f0e8] text-xs font-bold uppercase tracking-[0.1em] text-[#071a2b]/55">
              <tr>
                <th scope="col" className="px-5 py-4">
                  Player
                </th>
                <th scope="col" className="hidden px-4 py-4 sm:table-cell">
                  Season
                </th>
                <th scope="col" className="hidden px-4 py-4 lg:table-cell">
                  Date
                </th>
                <th scope="col" className="px-4 py-4">
                  Direction
                </th>
                <th scope="col" className="px-4 py-4">
                  Club
                </th>
                <th scope="col" className="px-5 py-4 text-right">
                  Fee
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {props.records.map((record, idx) => {
                const isDeparture = record.type === "out";
                const club = isDeparture ? record.to : record.from;

                return (
                  <tr
                    key={`${record.name}-${record.season}-${idx}`}
                    className="transition hover:bg-[#f4f0e8]"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <Link
                        href={`/page/player/${record.name}`}
                        className="font-semibold hover:text-blue-700"
                      >
                        {record.name}
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 sm:table-cell">
                      <Link
                        href={`/player-records/${record.season}`}
                        className="font-mono text-xs text-blue-700"
                      >
                        {record.season}
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 font-mono text-xs text-[#071a2b]/55 lg:table-cell">
                      {record.date || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${
                          isDeparture
                            ? "bg-[#071a2b] text-white"
                            : "bg-blue-700 text-white"
                        }`}
                      >
                        {isDeparture ? (
                          <ArrowUpRightIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeftIcon className="h-4 w-4" />
                        )}
                        {isDeparture ? "Out" : "In"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Link
                        href={`/games/${club}`}
                        className="font-semibold hover:text-blue-700"
                      >
                        {club || "Unknown"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-xs font-bold">
                      {record.value || "Undisclosed"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">
            No transfers match this search
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#071a2b]/55">
            Broaden the season, club or direction filters to explore more of the
            archive.
          </p>
        </div>
      )}
    </section>
  );
}
