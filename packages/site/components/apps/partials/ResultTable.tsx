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
    <div className="pb-8">
      <div className="mt-8 space-y-8">
        {props.results.length > 0 &&
        props.h2hresults &&
        props.h2hresults.length > 0 ? (
          <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Selection summary
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Overall record
            </h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-[#071a2b]/15 text-xs font-bold uppercase tracking-[0.1em] text-[#071a2b]/55">
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
                <tbody className="divide-y divide-[#071a2b]/10 text-sm">
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
            </div>
          </section>
        ) : (
          ""
        )}
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Match list
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {props.title}
            </h2>
          </div>
          {props.results.length > 0 ? (
            <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
              <table className="min-w-full text-left">
                <thead className="border-b border-[#071a2b]/15 bg-[#f4f0e8] text-xs font-bold uppercase tracking-[0.1em] text-[#071a2b]/55">
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
                <tbody className="divide-y divide-[#071a2b]/10 text-sm">
                  {props.results.map((result: Match, idx) => (
                    <tr key={idx} className="transition hover:bg-[#f4f0e8]">
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
                      <td className="whitespace-nowrap px-1 py-4 text-center sm:px-3">
                        <span className="inline-flex min-w-14 justify-center bg-[#071a2b] px-2 py-1.5 font-mono text-xs font-bold text-white">
                          {result.ft}
                        </span>
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
                            className="mx-auto h-16 w-12 object-cover"
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
          ) : (
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-14 text-center">
              <p className="font-display text-2xl font-semibold">
                No matches recorded yet
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#071a2b]/55">
                Try an earlier season or broaden the filters to explore the
                results archive.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
