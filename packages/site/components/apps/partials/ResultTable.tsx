import {
  H2HResult,
  H2HTotal,
  Match,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { LinkButton } from "@/components/forms/LinkButton";
import Image from "next/image";
import Link from "next/link";

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

function resultOutcome(match: Match) {
  const roversGoals = match.location === "H" ? match.hgoal : match.vgoal;
  const oppositionGoals = match.location === "H" ? match.vgoal : match.hgoal;
  return roversGoals > oppositionGoals
    ? "W"
    : roversGoals < oppositionGoals
      ? "L"
      : "D";
}

function venueLabel(match: Match) {
  return match.location === "H"
    ? "Home"
    : match.location === "N"
      ? "Neutral"
      : "Away";
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
          <section className="overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8]">
            <div className="flex flex-wrap items-end justify-between gap-5 bg-[#071a2b] px-5 py-6 text-white sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                  Selection summary
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold">
                  Overall record
                </h2>
              </div>
              {props.h2htotal?.[0] && (
                <p className="font-mono text-sm text-white/65">
                  <strong className="text-2xl text-white">
                    {props.h2htotal[0].pld}
                  </strong>{" "}
                  matches played
                </p>
              )}
            </div>
            <div className="overflow-x-auto p-3 sm:p-4">
              <table className="min-w-full">
                <thead className="bg-[#e8e2d6] text-xs font-bold uppercase tracking-[0.1em] text-[#071a2b]/55">
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
                    <tr key={idx} className="transition hover:bg-blue-50/60">
                      <td className="whitespace-nowrap px-3 py-4 font-semibold">
                        <span className="border-l-2 border-blue-700 pl-2.5">
                          {result.venue}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center font-mono font-bold">
                        {result.pld}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <span className="inline-grid min-w-8 place-items-center bg-emerald-100 px-2 py-1 font-mono text-xs font-bold text-emerald-900">
                          {result.wins}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <span className="inline-grid min-w-8 place-items-center bg-amber-100 px-2 py-1 font-mono text-xs font-bold text-amber-900">
                          {result.draws}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <span className="inline-grid min-w-8 place-items-center bg-red-100 px-2 py-1 font-mono text-xs font-bold text-red-800">
                          {result.lost}
                        </span>
                      </td>
                      <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center font-mono">
                        {result.for}
                      </td>
                      <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center font-mono">
                        {result.against}
                      </td>
                      <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center font-mono font-bold">
                        <span
                          className={
                            result.diff > 0
                              ? "text-emerald-700"
                              : result.diff < 0
                                ? "text-red-700"
                                : "text-[#071a2b]/55"
                          }
                        >
                          {result.diff > 0 ? "+" : ""}
                          {result.diff}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {props.h2htotal && props.h2htotal.length > 0 ? (
                    <>
                      {props.h2htotal.map((result, idx) => (
                        <tr key={idx} className="bg-[#e8e2d6]">
                          <td className="whitespace-nowrap px-3 py-4">
                            <strong className="border-l-2 border-[#071a2b] pl-2.5">
                              {result.venue}
                            </strong>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center font-mono">
                            <strong>{result.pld}</strong>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <strong className="inline-grid min-w-8 place-items-center bg-emerald-600 px-2 py-1 font-mono text-xs text-white">
                              {result.wins}
                            </strong>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <strong className="inline-grid min-w-8 place-items-center bg-amber-400 px-2 py-1 font-mono text-xs text-[#071a2b]">
                              {result.draws}
                            </strong>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <strong className="inline-grid min-w-8 place-items-center bg-red-600 px-2 py-1 font-mono text-xs text-white">
                              {result.lost}
                            </strong>
                          </td>
                          <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center font-mono">
                            <strong>{result.for}</strong>
                          </td>
                          <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center font-mono">
                            <strong>{result.against}</strong>
                          </td>
                          <td className="whitespace-nowrap hidden px-3 py-3.5 lg:table-cell text-center font-mono">
                            <strong
                              className={
                                result.diff > 0
                                  ? "text-emerald-700"
                                  : result.diff < 0
                                    ? "text-red-700"
                                    : "text-[#071a2b]/55"
                              }
                            >
                              {result.diff > 0 ? "+" : ""}
                              {result.diff}
                            </strong>
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
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Match list
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                {props.title}
              </h2>
            </div>
            <p className="border border-[#071a2b]/15 bg-[#fffdf8] px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/60">
              {props.results.length}{" "}
              {props.results.length === 1 ? "match" : "matches"}
            </p>
          </div>
          {props.results.length > 0 ? (
            <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8] shadow-[5px_5px_0_rgba(7,26,43,0.08)]">
              <table className="min-w-full text-left">
                <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/55">
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
                  {props.results.map((result: Match, idx) => {
                    const outcome = resultOutcome(result);
                    const outcomeStyle =
                      outcome === "W"
                        ? "border-l-emerald-500"
                        : outcome === "L"
                          ? "border-l-rose-500"
                          : "border-l-amber-400";
                    return (
                    <tr
                      key={idx}
                      className={`border-l-4 ${outcomeStyle} transition hover:bg-blue-50/70`}
                    >
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
                        <div className="flex items-center gap-2">
                          <span className="hidden border border-[#071a2b]/15 bg-[#f4f0e8] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#071a2b]/60 sm:inline">
                            {venueLabel(result)}
                          </span>
                          <LinkButton
                            text={result.opposition!}
                            href={`/games/${result.opposition}`}
                          ></LinkButton>
                        </div>
                      </td>
                      <td className="whitespace-nowrap hidden px-1 sm:px-3 py-3.5 lg:table-cell">
                        <span className="text-xs font-semibold text-[#071a2b]/70">
                          {result.competition}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-1 py-4 text-center sm:px-3">
                        <Link
                          href={`/match/${result.season}/${result.date}`}
                          prefetch={false}
                          aria-label={`View match report for ${result.opposition}, ${result.ft}`}
                          className={`inline-flex min-w-14 justify-center px-2 py-1.5 font-mono text-xs font-bold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                            outcome === "W"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : outcome === "L"
                                ? "bg-rose-600 hover:bg-rose-700"
                                : "bg-amber-500 hover:bg-amber-600"
                          }`}
                        >
                          {result.ft}
                        </Link>
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
                            className="mx-auto h-16 w-12 border border-[#071a2b]/15 object-cover shadow-sm"
                          />
                        ) : (
                          ""
                        )}
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
