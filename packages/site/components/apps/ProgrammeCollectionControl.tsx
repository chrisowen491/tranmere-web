"use client";

import type {
  ProgrammeCollectionRow,
  ProgrammeCollectionStatus,
} from "@tranmere-web/lib/src/d1-types";
import Link from "next/link";
import { useState } from "react";

const options: { value: ProgrammeCollectionStatus; label: string }[] = [
  { value: "owned", label: "Owned" },
  { value: "wanted", label: "Wanted" },
  { value: "trade", label: "Available to trade" },
];

export function ProgrammeCollectionControl({
  gameId,
  initialEntry,
}: {
  gameId: string;
  initialEntry: ProgrammeCollectionRow | null;
}) {
  const [entry, setEntry] = useState(initialEntry);
  const [status, setStatus] = useState<ProgrammeCollectionStatus>(
    initialEntry?.status || "owned",
  );
  const [conditionNotes, setConditionNotes] = useState(
    initialEntry?.condition_notes || "",
  );
  const [purchaseNotes, setPurchaseNotes] = useState(
    initialEntry?.purchase_notes || "",
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/programme-collection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, status, conditionNotes, purchaseNotes }),
    });
    const body = (await response.json()) as {
      entry?: ProgrammeCollectionRow;
      message?: string;
    };
    if (response.ok && body.entry) {
      setEntry(body.entry);
      setMessage("Collection updated.");
    } else setMessage(body.message || "Unable to update your collection.");
    setSaving(false);
  }

  async function remove() {
    setSaving(true);
    const response = await fetch("/api/programme-collection", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    if (response.ok) {
      setEntry(null);
      setMessage("Programme removed from your collection.");
    }
    setSaving(false);
  }

  return (
    <details className="group border border-[#071a2b]/15 bg-[#fffdf8]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 marker:hidden sm:p-8">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
            Your collection
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">
            Track this programme
          </h2>
          {entry && (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/45">
              Currently{" "}
              {options
                .find((option) => option.value === entry.status)
                ?.label.toLowerCase()}
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center border border-[#071a2b]/20 font-mono text-xl text-blue-700 transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="border-t border-[#071a2b]/10 px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`border px-4 py-3 text-left text-sm font-bold transition ${
                status === option.value
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-[#071a2b]/20 bg-[#fffdf8] hover:bg-[#e8e2d6]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold">
            Condition notes
            <textarea
              value={conditionNotes}
              onChange={(event) => setConditionNotes(event.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-2 w-full border border-[#071a2b]/20 bg-white px-4 py-3 font-normal focus:border-blue-700 focus:outline-none"
            />
          </label>
          <label className="text-sm font-bold">
            Purchase notes
            <textarea
              value={purchaseNotes}
              onChange={(event) => setPurchaseNotes(event.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-2 w-full border border-[#071a2b]/20 bg-white px-4 py-3 font-normal focus:border-blue-700 focus:outline-none"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-[#071a2b]/50">
          Notes are always private. Only wanted and trade entries can appear on
          an opted-in public list.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="bg-[#1557ff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071a2b] disabled:opacity-50"
          >
            {saving
              ? "Saving…"
              : entry
                ? "Update collection"
                : "Add to collection"}
          </button>
          {entry && (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={saving}
              className="border border-[#071a2b]/20 px-5 py-3 text-sm font-bold hover:bg-[#e8e2d6]"
            >
              Remove
            </button>
          )}
          <Link
            href="/profile/programmes"
            className="text-sm font-bold text-blue-700"
          >
            View collection dashboard →
          </Link>
        </div>
        {message && <p className="mt-4 text-sm font-semibold">{message}</p>}
      </div>
    </details>
  );
}
