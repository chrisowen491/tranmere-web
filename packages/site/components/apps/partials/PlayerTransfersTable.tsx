import { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { LinkButton } from "@/components/forms/LinkButton";
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "@heroicons/react/20/solid";

export function PlayerTransfersTable(props: {
  title: string;
  records: Transfer[];
}) {
  return (
    <div className="px-2 sm:px-2 lg:px-4">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl">
              {props.title}
            </h2>
            <table className="min-w-full divide-y text-left text-sm">
              <thead className="font-semibold ">
                <tr>
                  <th scope="col" className="py-3.5">
                    Season
                  </th>
                  <th scope="col" className="py-3.5">
                    In/Out
                  </th>
                  <th scope="col" className="py-3.5">
                    Fee
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {props.records.map((record, idx) => {
                  const isDeparture = record.type === "out";
                  const club =
                    record.club ||
                    (isDeparture ? record.to : record.from) ||
                    "Unknown club";

                  return (
                    <tr key={`${record.id}-${idx}`}>
                      <td className="whitespace-nowrap px-3 py-4">
                        <LinkButton
                          text={record.season.toString()}
                          href={`/player-records/${record.season}`}
                        ></LinkButton>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white ${
                              isDeparture ? "bg-[#071a2b]" : "bg-blue-700"
                            }`}
                          >
                            {isDeparture ? (
                              <ArrowUpRightIcon className="h-4 w-4" />
                            ) : (
                              <ArrowDownLeftIcon className="h-4 w-4" />
                            )}
                            {isDeparture ? "Out" : "In"}
                          </span>
                          <span className="whitespace-nowrap font-semibold">
                            {isDeparture ? "to" : "from"} {club}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {record.value || "Undisclosed"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
