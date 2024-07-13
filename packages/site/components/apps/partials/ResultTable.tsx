import {
  H2HResult,
  H2HTotal,
  Match,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { LinkButton } from "@/components/forms/LinkButton";

export function ResultTable(props: {
  title: string;
  results: Match[];
  h2hresults?: H2HResult[];
  h2htotal?: H2HTotal[];
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {props.h2hresults && props.h2hresults.length > 0 ? (
              <>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl">
                  Overall Record
                </h2>
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="thead-dark text-sm font-semibold">
                    <tr>
                      <th scope="col" className="py-3 py-3.5 text-left">
                        Venue
                      </th>
                      <th scope="col" className="py-3 py-3.5 text-left">
                        Pld
                      </th>
                      <th scope="col" className="py-3 py-3.5 text-left">
                        Won
                      </th>
                      <th scope="col" className="py-3 py-3.5 text-left">
                        Draws
                      </th>
                      <th scope="col" className="py-3 py-3.5 text-left">
                        Lost
                      </th>
                      <th scope="col" className="py-3 py-3.5 text-left">
                        For
                      </th>
                      <th scope="col" className="py-3 py-3.5 text-left">
                        Agn
                      </th>
                      <th scope="col" className="py-3 py-3.5 text-left">
                        Diff
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200  text-sm">
                    {props.h2hresults.map((result, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.venue}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.pld}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.wins}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.draws}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.lost}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.for}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.against}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.diff}
                        </td>
                      </tr>
                    ))}
                    {props.h2htotal && props.h2htotal.length > 0 ? (
                      <>
                        {props.h2htotal.map((result, idx) => (
                          <tr key={idx}>
                            <td className="whitespace-nowrap px-3 py-4">
                              <strong>{result.venue}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <strong>{result.pld}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <strong>{result.wins}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <strong>{result.draws}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <strong>{result.lost}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <strong>{result.for}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <strong>{result.against}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <strong>{result.diff}</strong>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      ""
                    )}
                  </tbody>
                </table>
              </>
            ) : (
              ""
            )}
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl">
              {props.title}
            </h2>
            <table className="min-w-full divide-y text-left text-sm">
              <thead className="font-semibold ">
                <tr>
                  <th scope="col" className="py-3 py-3.5">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Opposition
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Competition
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Result
                  </th>
                  <th scope="col" className="hidden px-3 py-3.5 lg:table-cell">
                    Att.
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Programme
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {props.results.map((result, idx) => (
                  <tr key={idx}>
                    <td className="whitespace-nowrap px-3 py-4">
                      <LinkButton
                        text={result.date}
                        href={`/match/${result.season}/${result.date}`}
                      ></LinkButton>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <LinkButton
                        text={result.opposition!}
                        href={`/games/${result.opposition}`}
                      ></LinkButton>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {result.competition}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">{result.ft}</td>
                    <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell">
                      {result.attendance}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {result.programme ? (
                        <img
                          src={`https://images.tranmere-web.com/${result.programme}`}
                        />
                      ) : (
                        ""
                      )}
                    </td>
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