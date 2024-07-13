import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { LinkButton } from "@/components/forms/LinkButton";

export function PlayerStatsTable(props: { title: string, records: PlayerSeasonSummary[]}) {

  return (
    <div className="px-2 sm:px-2 lg:px-4">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl">{props.title}</h2>
            <table className="min-w-full divide-y text-left text-sm">
              <thead className="font-semibold ">
                <tr>
                  <th scope="col" className="py-3 py-3.5">
                    Season
                  </th>
                  <th scope="col" className="py-3 py-3.5">
                    Starts
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Goals
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Assists
                  </th>
                  <th scope="col" className="hidden px-3 py-3.5 lg:table-cell">
                    Headers
                  </th>
                  <th scope="col" className="hidden px-3 py-3.5 lg:table-cell">
                    Free Kicks
                  </th>
                  <th scope="col" className="hidden px-3 py-3.5 lg:table-cell">
                    Penalties
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Red Cards
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Yellow Cards
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {props.records.map((record, idx) => (
                  <tr key={idx}>
                    <td className="whitespace-nowrap px-3 py-4">
                        <LinkButton text={record.Season} href={`/player-records/${record.Season}`} ></LinkButton>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">{record.starts}</td>
                    <td className="whitespace-nowrap px-3 py-4">{record.goals}</td>
                    <td className="whitespace-nowrap px-3 py-4">{record.assists}</td>
                    <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell">{record.headers}</td>
                    <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell">{record.freekicks}</td>
                    <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell">{record.penalties}</td>
                    <td className="whitespace-nowrap px-3 py-4">{record.red}</td>
                    <td className="whitespace-nowrap px-3 py-4">{record.yellow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
