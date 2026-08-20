"use client";

import {
  editableAppearanceLabels,
  isNewAppearanceCorrection,
  type AppearanceCorrection,
  type EditableAppearance,
} from "@/lib/appearanceCorrections";
import Link from "next/link";
import { useState } from "react";

function display(value: string | boolean | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value || "Not recorded";
}

export function AppearanceCorrectionReview({
  initialCorrections,
}: {
  initialCorrections: AppearanceCorrection[];
}) {
  const [corrections, setCorrections] = useState(initialCorrections);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function review(
    correction: AppearanceCorrection,
    status: "approved" | "rejected",
    form: HTMLFormElement,
  ) {
    setBusyId(correction.id);
    setMessage(null);
    try {
      const response = await fetch("/api/appearance-corrections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: correction.id,
          status,
          reviewNote: new FormData(form).get("reviewNote"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "The review could not be saved.");
      setCorrections((items) =>
        items.filter((item) => item.id !== correction.id),
      );
      setMessage(`Appearance correction ${status}.`);
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

  if (!corrections.length)
    return (
      <p className="border border-[#071a2b]/15 bg-[#fffdf8] p-10 text-center">
        No appearance corrections are awaiting review.
      </p>
    );
  return (
    <div className="space-y-5">
      {message && (
        <p
          role="status"
          className="border border-blue-700/20 bg-blue-50 px-4 py-3 text-sm font-semibold"
        >
          {message}
        </p>
      )}
      {corrections.map((correction) => (
        <article
          key={correction.id}
          className="border border-[#071a2b]/15 bg-[#fffdf8]"
        >
          <header className="bg-[#071a2b] p-6 text-white sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-blue-300">
              {isNewAppearanceCorrection(correction.appearanceId)
                ? "Missing lineup entry"
                : "Appearance correction"}{" "}
              · {correction.season} · {correction.matchDate}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {display(
                correction.current.playerName ?? correction.changes.playerName,
              )}{" "}
              v {correction.opposition}
            </h2>
            <Link
              href={`/match/${correction.season}/${correction.matchDate}`}
              className="mt-3 inline-block text-xs font-bold text-blue-200 underline underline-offset-4"
            >
              Open match page ↗
            </Link>
          </header>
          <div className="p-6 sm:p-8">
            <div className="space-y-4">
              {Object.entries(correction.changes).map(([field, proposed]) => {
                const key = field as keyof EditableAppearance;
                return (
                  <div
                    key={field}
                    className="grid gap-3 border-b border-[#071a2b]/10 pb-4 sm:grid-cols-[180px_minmax(0,1fr)_40px_minmax(0,1fr)]"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                      {editableAppearanceLabels[key]}
                    </p>
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#071a2b]/35">
                        Current
                      </span>
                      <p className="mt-1 text-sm text-[#071a2b]/60">
                        {display(correction.current[key])}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="hidden pt-5 text-center text-blue-700 sm:block"
                    >
                      →
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase text-blue-700">
                        Proposed
                      </span>
                      <p className="mt-1 text-sm font-semibold">
                        {display(proposed)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="text-sm leading-6 text-[#071a2b]/70">
                <p>
                  <strong>Source:</strong>{" "}
                  {correction.source || "No source supplied."}
                </p>
                {correction.explanation && (
                  <p className="mt-3">
                    <strong>Notes:</strong> {correction.explanation}
                  </p>
                )}
                <p className="mt-3 text-xs text-[#071a2b]/45">
                  Submitted by {correction.submittedByName} on{" "}
                  {new Date(correction.submittedAt).toLocaleString("en-GB")}
                </p>
              </div>
              <form
                className="border-t border-[#071a2b]/15 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
                onSubmit={(event) => event.preventDefault()}
              >
                <label
                  htmlFor={`appearance-review-${correction.id}`}
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45"
                >
                  Moderator note (optional)
                </label>
                <textarea
                  id={`appearance-review-${correction.id}`}
                  name="reviewNote"
                  rows={3}
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
                    className="bg-emerald-700 px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-50"
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
                    className="border border-red-700 px-4 py-2 text-xs font-bold uppercase text-red-700 disabled:opacity-50"
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
  );
}
