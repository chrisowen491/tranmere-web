import {
  H2HResult,
  H2HTotal,
  Match,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { LinkButton } from "@/components/forms/LinkButton";
import Image from "next/image";

function trimDate(input?: string) {
  if (!input) {
    return "";
  } else if (input == "now()") {
    return "Present";
  } else {
    const date = new Date(input);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
}

export function ResultTable(props: {
  title: string;
  results: Match[];
  h2hresults?: H2HResult[];
  h2htotal?: H2HTotal[];
  fullDate?: boolean;
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {props.h2hresults && props.h2hresults.length > 0 ? (
              <>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl px-1 md:px-0">
                  Overall Record
                </h2>
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="thead-dark  font-semibold">
                    <tr>
                      <th scope="col" className="py-3.5 text-left px-3">
                        Venue
                      </th>
                      <th scope="col" className="py-3.5 px-3 text-center">
                        Pld
                      </th>
                      <th scope="col" className="py-3.5 px-3 text-center">
                        Won
                      </th>
                      <th scope="col" className="py-3.5 px-3 text-center">
                        Draws
                      </th>
                      <th scope="col" className="py-3.5 px-3 text-center">
                        Lost
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 lg:table-cell text-center"
                      >
                        For
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 lg:table-cell text-center"
                      >
                        Agn
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 lg:table-cell text-center"
                      >
                        Diff
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {props.h2hresults.map((result, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-3 py-4">
                          {result.venue}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-center">
                          {result.pld}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-center">
                          {result.wins}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-center">
                          {result.draws}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-center">
                          {result.lost}
                        </td>
                        <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center">
                          {result.for}
                        </td>
                        <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center">
                          {result.against}
                        </td>
                        <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center">
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
                            <td className="whitespace-nowrap px-3 py-4 text-center">
                              <strong>{result.pld}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-center">
                              <strong>{result.wins}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-center">
                              <strong>{result.draws}</strong>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-center">
                              <strong>{result.lost}</strong>
                            </td>
                            <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center">
                              <strong>{result.for}</strong>
                            </td>
                            <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center">
                              <strong>{result.against}</strong>
                            </td>
                            <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center">
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
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-2xl px-1 md:px-0">
              {props.title}
            </h2>
            <table className="min-w-full divide-y text-left">
              <thead className="font-semibold ">
                <tr>
                  <th scope="col" className="py-3.5 px-1 sm:px-3">
                    Date
                  </th>
                  <th scope="col" className="px-1 sm:px-3 py-3.5">
                    Opposition
                  </th>
                  <th
                    scope="col"
                    className="hidden px-1 sm:px-3 py-3.5 lg:table-cell"
                  >
                    Competition
                  </th>
                  <th scope="col" className="px-1 sm:px-3 py-3.5 text-center">
                    Result
                  </th>
                  <th
                    scope="col"
                    className="hidden px-1 sm:px-3 py-3.5 md:table-cell text-center"
                  >
                    Att.
                  </th>
                  <th
                    scope="col"
                    className="hidden px-1 sm:px-3 py-3.5 md:table-cell text-center"
                  >
                    Programme
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 ">
                {props.results.map((result: any, idx) => (
                  <tr key={idx}>
                    <td className="whitespace-nowrap px-1 sm:px-3 py-4">
                      {props.fullDate ? (
                        <LinkButton
                          text={result.date}
                          href={`/match/${result.season}/${result.date}`}
                        ></LinkButton>
                      ) : (
                        <LinkButton
                          text={trimDate(result.date)}
                          href={`/match/${result.season}/${result.date}`}
                        ></LinkButton>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-1 sm:px-3 py-4">
                      <LinkButton
                        text={result.opposition!}
                        href={`/games/${result.opposition}`}
                      ></LinkButton>
                    </td>
                    <td className="whitespace-nowrap hidden px-1 sm:px-3 py-3.5 lg:table-cell">
                      {result.competition}
                    </td>
                    <td className="whitespace-nowrap px-1 sm:px-3 py-4 text-center">
                      {result.ft}
                    </td>
                    <td className="whitespace-nowrap hidden px-1 sm:px-3 py-3.5 md:table-cell text-center">
                      {result.attendance}
                    </td>
                    <td className="whitespace-nowrap hidden px-3 py-3.5 md:table-cell text-center">
                      {result.programme ? (
                        <Image
                          width={100}
                          height={200}
                          src={`https://images.tranmere-web.com/${result.programme}`}
                          alt={`${result.home} v ${result.visitor} Match Programme ${result.date}`}
                          className="mx-auto"
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
