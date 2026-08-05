"use client";

import {
  editablePlayerProfileLabels,
  type EditablePlayerProfile,
  type PlayerProfileCorrection,
} from "@/lib/playerProfileCorrections";
import { useState } from "react";
import Link from "next/link";

function displayValue(value: string | undefined) {
  return value || "Not recorded";
}

export function PlayerProfileCorrectionReview({
  initialCorrections,
}: {
  initialCorrections: PlayerProfileCorrection[];
}) {
  const [corrections, setCorrections] = useState(initialCorrections);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function review(
    correction: PlayerProfileCorrection,
    status: "approved" | "rejected",
    form: HTMLFormElement,
  ) {
    setBusyId(correction.id);
    setMessage(null);
    try {
      const response = await fetch("/api/player-profile-corrections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: correction.id,
          status,
          reviewNote: new FormData(form).get("reviewNote"),
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
          ? `${correction.playerName}'s changes were approved and published.`
          : `${correction.playerName}'s changes were rejected.`,
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
            There are no player profile corrections awaiting review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {corrections.map((correction) => (
            <article
              key={correction.id}
              className="border border-[#071a2b]/15 bg-[#fffdf8]"
            >
              <header className="flex flex-wrap items-end justify-between gap-4 bg-[#071a2b] p-6 text-white sm:p-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                    Player profile correction
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    {correction.playerName}
                  </h2>
                </div>
                <Link
                  href={`/page/player/${correction.playerName}`}
                  className="text-xs font-bold text-blue-200 underline underline-offset-4"
                >
                  Open player profile ↗
                </Link>
              </header>

              <div className="p-6 sm:p-8">
                <div className="space-y-5">
                  {Object.entries(correction.changes).map(
                    ([field, proposed]) => {
                      const key = field as keyof EditablePlayerProfile;
                      return (
                        <div
                          key={field}
                          className="grid gap-3 border-b border-[#071a2b]/10 pb-5 sm:grid-cols-[170px_minmax(0,1fr)_40px_minmax(0,1fr)] sm:items-start"
                        >
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                            {editablePlayerProfileLabels[key]}
                          </p>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/35">
                              Current
                            </span>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#071a2b]/60">
                              {displayValue(correction.current[key])}
                            </p>
                          </div>
                          <span
                            aria-hidden="true"
                            className="hidden pt-5 text-center text-blue-700 sm:block"
                          >
                            →
                          </span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                              Proposed
                            </span>
                            <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6">
                              {displayValue(proposed)}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                      Source
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#071a2b]/70">
                      {correction.source || "No source supplied."}
                    </p>
                    {correction.explanation && (
                      <>
                        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                          Contributor notes
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#071a2b]/70">
                          {correction.explanation}
                        </p>
                      </>
                    )}
                    <p className="mt-5 text-xs text-[#071a2b]/45">
                      Submitted by{" "}
                      <span className="font-semibold">
                        {correction.submittedByName}
                      </span>{" "}
                      on{" "}
                      {new Date(correction.submittedAt).toLocaleString("en-GB")}
                    </p>
                  </div>

                  <form
                    className="border-t border-[#071a2b]/15 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
                    onSubmit={(event) => event.preventDefault()}
                  >
                    <label
                      htmlFor={`profile-review-note-${correction.id}`}
                      className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45"
                    >
                      Moderator note{" "}
                      <span className="font-normal">(optional)</span>
                    </label>
                    <textarea
                      id={`profile-review-note-${correction.id}`}
                      name="reviewNote"
                      rows={4}
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
