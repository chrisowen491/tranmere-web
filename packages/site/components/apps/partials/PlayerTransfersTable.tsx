import { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

function isDeparture(record: Transfer) {
  return record.type === "out";
}

function otherClub(record: Transfer) {
  return (
    record.club ||
    (isDeparture(record) ? record.to : record.from) ||
    "Unknown club"
  );
}

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

export function PlayerTransfersTable({
  title,
  records,
}: {
  title: string;
  records: Transfer[];
}) {
  const arrivals = records.filter((record) => !isDeparture(record)).length;
  const departures = records.length - arrivals;
  const clubs = new Set(records.map(otherClub)).size;

  if (records.length === 0) {
    return (
      <div className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8] p-6 text-sm text-[#071a2b]/55">
        No transfer movements are currently recorded.
      </div>
    );
  }

  return (
    <section className="mt-6">
      <div className="grid border border-[#071a2b]/15 bg-[#fffdf8] sm:grid-cols-3">
        <div className="border-b border-[#071a2b]/15 p-5 sm:border-b-0 sm:border-r">
          <ArrowDownLeftIcon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Arrivals
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">{arrivals}</p>
          <p className="mt-1 text-xs text-[#071a2b]/50">
            Moves into Prenton Park
          </p>
        </div>
        <div className="border-b border-[#071a2b]/15 p-5 sm:border-b-0 sm:border-r">
          <ArrowUpRightIcon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Departures
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {departures}
          </p>
          <p className="mt-1 text-xs text-[#071a2b]/50">Recorded moves away</p>
        </div>
        <div className="p-5">
          <BuildingOffice2Icon className="h-5 w-5 text-blue-700" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
            Clubs involved
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">{clubs}</p>
          <p className="mt-1 text-xs text-[#071a2b]/50">
            Other clubs in the record
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="flex items-end justify-between gap-4 border-b border-[#071a2b]/15 bg-[#071a2b] px-5 py-5 text-white">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
              Career movement
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {title}
            </h2>
          </div>
          <ArrowsRightLeftIcon className="h-7 w-7 text-white/35" />
        </div>

        <ol className="divide-y divide-[#071a2b]/10">
          {records.map((record, index) => {
            const departure = isDeparture(record);
            const club = otherClub(record);

            return (
              <li
                key={`${record.id}-${index}`}
                className="grid gap-5 p-5 transition hover:bg-blue-50/60 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center"
              >
                <div>
                  <Link
                    href={`/player-records/${record.season}`}
                    className="font-display text-xl font-semibold hover:text-blue-700"
                  >
                    {seasonLabel(record.season)}
                  </Link>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/40">
                    {record.date || `Movement ${index + 1}`}
                  </p>
                </div>

                <div className="flex min-w-0 items-center gap-4">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center ${
                      departure
                        ? "bg-[#071a2b] text-white"
                        : "bg-blue-700 text-white"
                    }`}
                  >
                    {departure ? (
                      <ArrowUpRightIcon className="h-5 w-5" />
                    ) : (
                      <ArrowDownLeftIcon className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                      {departure ? "Departed for" : "Arrived from"}
                    </p>
                    <p className="mt-1 truncate font-display text-xl font-semibold">
                      {club}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#071a2b]/10 pt-4 sm:min-w-36 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
                  <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/40 sm:justify-end">
                    <BanknotesIcon className="h-4 w-4" />
                    Fee
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {record.value || "Undisclosed"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
