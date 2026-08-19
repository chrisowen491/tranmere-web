"use client";

import Link from "next/link";
import { useState } from "react";
import { kitLabel, type KitCorrection } from "@/lib/kitCorrections";

export function KitCorrectionReview({
  initialCorrections,
}: {
  initialCorrections: KitCorrection[];
}) {
  const [corrections, setCorrections] = useState(initialCorrections);
  const [message, setMessage] = useState<string | null>(null);
  async function review(
    correction: KitCorrection,
    status: "approved" | "rejected",
  ) {
    const response = await fetch("/api/kit-corrections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: correction.id, status }),
    });
    const result = (await response.json()) as { message?: string };
    setMessage(result.message || "The review could not be saved.");
    if (response.ok)
      setCorrections((items) =>
        items.filter((item) => item.id !== correction.id),
      );
  }
  if (!corrections.length)
    return (
      <p className="border border-[#071a2b]/15 bg-[#fffdf8] p-10 text-center">
        No kit suggestions are awaiting review.
      </p>
    );
  return (
    <div className="space-y-4">
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
          className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-blue-700">
            {correction.season} · {correction.matchDate}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            {correction.homeTeam} v {correction.awayTeam}
          </h2>
          <Link
            href={`/match/${correction.season}/${correction.matchDate}`}
            className="mt-2 inline-block text-xs font-bold text-blue-700 underline underline-offset-4"
          >
            Open match page ↗
          </Link>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <p>
              <span className="block text-xs uppercase text-[#071a2b]/50">
                Current
              </span>
              {kitLabel(correction.currentKit)}
            </p>
            <p>
              <span className="block text-xs uppercase text-[#071a2b]/50">
                Proposed
              </span>
              <strong className="text-blue-700">
                {kitLabel(correction.proposedKit)}
              </strong>
            </p>
            <p>
              <span className="block text-xs uppercase text-[#071a2b]/50">
                Contributor
              </span>
              {correction.submittedByName}
            </p>
          </div>
          {correction.explanation && (
            <p className="mt-4 border-t border-[#071a2b]/15 pt-4 text-sm">
              {correction.explanation}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => void review(correction, "approved")}
              className="bg-emerald-700 px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Approve & publish
            </button>
            <button
              onClick={() => void review(correction, "rejected")}
              className="border border-red-700 px-4 py-2 text-xs font-bold uppercase text-red-700"
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
