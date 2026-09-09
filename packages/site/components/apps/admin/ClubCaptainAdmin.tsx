"use client";

import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import type { ClubCaptainRecord } from "@/lib/clubCaptains";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";
const sortRecords = (records: ClubCaptainRecord[]) =>
  [...records].sort(
    (a, b) =>
      b.season - a.season ||
      a.sortOrder - b.sortOrder ||
      a.playerName.localeCompare(b.playerName),
  );

export function ClubCaptainAdmin({
  initialCaptains,
}: {
  initialCaptains: ClubCaptainRecord[];
}) {
  const [captains, setCaptains] = useState(sortRecords(initialCaptains));
  const [editing, setEditing] = useState<ClubCaptainRecord | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const reset = () => {
    setEditing(null);
    setFormKey((value) => value + 1);
  };

  async function save(form: HTMLFormElement) {
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/club-captains", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          season: Number(data.get("season")),
          playerName: data.get("playerName"),
          notes: data.get("notes"),
          sortOrder: Number(data.get("sortOrder")),
        }),
      });
      const result = (await response.json()) as {
        captain?: ClubCaptainRecord;
        message?: string;
      };
      if (!response.ok || !result.captain)
        throw new Error(result.message || "The captain could not be saved.");
      setCaptains((records) =>
        sortRecords(
          editing
            ? records.map((record) =>
                record.id === result.captain!.id ? result.captain! : record,
              )
            : [result.captain!, ...records],
        ),
      );
      setMessage(`${result.captain.playerName} was saved.`);
      reset();
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The captain could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(captain: ClubCaptainRecord) {
    if (
      !window.confirm(
        `Delete ${captain.playerName} from ${captain.season}/${String(captain.season + 1).slice(-2)}?`,
      )
    )
      return;
    const response = await fetch(
      `/api/admin/club-captains?id=${encodeURIComponent(captain.id)}`,
      { method: "DELETE" },
    );
    if (response.ok) {
      setCaptains((records) =>
        records.filter((record) => record.id !== captain.id),
      );
      if (editing?.id === captain.id) reset();
      setMessage(`${captain.playerName} was deleted.`);
      setIsError(false);
    } else {
      const result = (await response.json()) as { message?: string };
      setMessage(result.message || "The captain could not be deleted.");
      setIsError(true);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
      <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          {editing ? "Edit record" : "New record"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {editing ? editing.playerName : "Add a captain"}
        </h2>
        {editing && (
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-xs font-bold text-blue-700 underline"
          >
            Cancel
          </button>
        )}
        {message && (
          <p
            role="status"
            className={`mt-5 text-sm font-semibold ${isError ? "text-red-700" : "text-emerald-700"}`}
          >
            {message}
          </p>
        )}
        <form
          key={`${editing?.id || "new"}-${formKey}`}
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void save(event.currentTarget);
          }}
        >
          <label className={labelClass}>
            Season
            <input
              name="season"
              type="number"
              min="1800"
              max="2200"
              required
              defaultValue={editing?.season ?? new Date().getFullYear()}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Player name
            <input
              name="playerName"
              required
              maxLength={200}
              defaultValue={editing?.playerName}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Note
            <textarea
              name="notes"
              maxLength={500}
              defaultValue={editing?.notes || ""}
              className={inputClass}
              rows={3}
            />
          </label>
          <label className={labelClass}>
            Display order
            <input
              name="sortOrder"
              type="number"
              required
              defaultValue={editing?.sortOrder ?? 0}
              className={inputClass}
            />
          </label>
          <button
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50"
          >
            {editing ? (
              <PencilSquareIcon className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            {saving ? "Saving…" : editing ? "Save captain" : "Add captain"}
          </button>
        </form>
      </section>
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Captaincy archive
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {captains.length} records
        </h2>
        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#071a2b] text-white/65">
              <tr>
                <th className="px-5 py-4">Season</th>
                <th className="px-5 py-4">Captain</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {captains.map((captain) => (
                <tr key={captain.id}>
                  <td className="px-5 py-4 font-mono font-bold">
                    {captain.season}/{String(captain.season + 1).slice(-2)}
                  </td>
                  <td className="px-5 py-4">
                    <strong>{captain.playerName}</strong>
                    {captain.notes && (
                      <span className="ml-2 text-[#071a2b]/50">
                        {captain.notes}
                      </span>
                    )}
                  </td>
                  <td className="space-x-4 px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setEditing(captain);
                        setMessage(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-blue-700"
                    >
                      <PencilSquareIcon className="inline h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => void remove(captain)}
                      className="text-red-700"
                    >
                      <TrashIcon className="inline h-4 w-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
