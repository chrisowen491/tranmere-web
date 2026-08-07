"use client";

import Link from "next/link";
import { useState } from "react";
import type { AttendanceCorrection } from "@/lib/attendanceCorrections";

export function AttendanceCorrectionReview({
  initialCorrections,
}: {
  initialCorrections: AttendanceCorrection[];
}) {
  const [corrections, setCorrections] = useState(initialCorrections);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function review(
    correction: AttendanceCorrection,
    status: "approved" | "rejected",
    form: HTMLFormElement,
  ) {
    setBusyId(correction.id);
    setMessage(null);

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/attendance-corrections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: correction.id,
          status,
          reviewNote: formData.get("reviewNote"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "The review could not be saved.");
      }

      setCorrections((items) =>
        items.filter((item) => item.id !== correction.id),
      );
      setMessage(
        status === "approved"
          ? "Correction approved and published on the match page."
          : "Correction rejected.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The review could not be saved.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {message && (
        <p
          role="status"
          className="mb-6 border border-blue-700/20 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900"
        >
          {message}
        </p>
      )}

      {corrections.length === 0 ? (
        <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-10 text-center">
          <p className="font-display text-2xl font-semibold">Queue cleared</p>
          <p className="mt-2 text-sm text-[#071a2b]/60">
            There are no attendance corrections waiting for review.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {corrections.map((correction) => (
            <article
              key={correction.id}
              className="grid gap-0 border border-[#071a2b]/15 bg-[#fffdf8] lg:grid-cols-[220px_minmax(0,1fr)]"
            >
              <div className="bg-[#071a2b] p-6 text-white">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-blue-300">
                  {correction.season} · {correction.matchDate}
                </p>
                <h2 className="mt-4 font-display text-2xl font-semibold">
                  {correction.homeTeam}
                  <span className="my-1 block text-white/35">v</span>
                  {correction.awayTeam}
                </h2>
                <Link
                  href={`/match/${correction.season}/${correction.matchDate}`}
                  className="mt-6 inline-block text-xs font-bold text-blue-200 underline underline-offset-4"
                >
                  Open match page ↗
                </Link>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                      Current
                    </p>
                    <p className="mt-2 font-mono text-2xl font-bold">
                      {correction.currentAttendance?.toLocaleString("en-GB") ||
                        "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                      Proposed
                    </p>
                    <p className="mt-2 font-mono text-2xl font-bold text-blue-700">
                      {correction.proposedAttendance.toLocaleString("en-GB")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                      Contributor
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {correction.submittedByName}
                    </p>
                    <p className="mt-1 text-xs text-[#071a2b]/45">
                      {new Date(correction.submittedAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#071a2b]/15 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                    Evidence
                  </p>
                  {!correction.source ? (
                    <p className="mt-2 text-sm text-[#071a2b]/45">
                      No source supplied.
                    </p>
                  ) : /https?:\/\/\S+/i.test(correction.source) ? (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold text-[#071a2b]/75">
                      {correction.source
                        .split(/(https?:\/\/\S+)/i)
                        .map((part, index) =>
                          /^https?:\/\/\S+$/i.test(part) ? (
                            <a
                              key={`${correction.id}-source-${index}`}
                              href={part}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline underline-offset-4"
                            >
                              {part} ↗
                            </a>
                          ) : (
                            part
                          ),
                        )}
                    </p>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#071a2b]/75">
                      {correction.source}
                    </p>
                  )}
                  {correction.explanation && (
                    <p className="mt-3 text-sm leading-6 text-[#071a2b]/65">
                      {correction.explanation}
                    </p>
                  )}
                </div>

                <form
                  className="mt-6 border-t border-[#071a2b]/15 pt-5"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label
                    htmlFor={`review-note-${correction.id}`}
                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45"
                  >
                    Moderator note{" "}
                    <span className="font-normal">(optional)</span>
                  </label>
                  <textarea
                    id={`review-note-${correction.id}`}
                    name="reviewNote"
                    rows={2}
                    maxLength={1000}
                    className="mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busyId === correction.id}
                      onClick={(event) =>
                        void review(
                          correction,
                          "approved",
                          event.currentTarget.form!,
                        )
                      }
                      className="bg-emerald-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      Approve &amp; publish
                    </button>
                    <button
                      type="button"
                      disabled={busyId === correction.id}
                      onClick={(event) =>
                        void review(
                          correction,
                          "rejected",
                          event.currentTarget.form!,
                        )
                      }
                      className="border border-red-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
