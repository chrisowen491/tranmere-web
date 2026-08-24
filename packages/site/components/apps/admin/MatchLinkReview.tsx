"use client";
import type { MatchLinkSuggestion } from "@/lib/matchLinks";
import { useState } from "react";
export function MatchLinkReview({
  initialSuggestions,
}: {
  initialSuggestions: MatchLinkSuggestion[];
}) {
  const [items, setItems] = useState(initialSuggestions);
  const [busy, setBusy] = useState<string | null>(null);
  const review = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    const response = await fetch("/api/match-link-suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok)
      setItems((current) => current.filter((item) => item.id !== id));
    setBusy(null);
  };
  return (
    <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">
        Community submissions
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold">
        Awaiting review
      </h2>
      {items.length ? (
        <ul className="mt-5 divide-y divide-[#071a2b]/10">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div>
                <a
                  className="font-bold text-blue-700 underline"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label} ↗
                </a>
                <p className="mt-1 text-sm">
                  {item.season} · {item.matchDate} · suggested by{" "}
                  {item.submittedByName}
                </p>
                {item.notes && (
                  <p className="mt-1 text-sm text-[#071a2b]/60">{item.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={busy === item.id}
                  onClick={() => void review(item.id, "approved")}
                  className="bg-blue-700 px-3 py-2 text-xs font-bold text-white"
                >
                  Approve
                </button>
                <button
                  disabled={busy === item.id}
                  onClick={() => void review(item.id, "rejected")}
                  className="border border-[#071a2b]/20 px-3 py-2 text-xs font-bold"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#071a2b]/60">
          No supporter links are waiting for review.
        </p>
      )}
    </div>
  );
}
