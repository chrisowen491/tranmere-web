"use client";

import type { HatTrickRow } from "@tranmere-web/lib/src/d1-types";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";

function blankHatTrick(season: number): HatTrickRow {
  return {
    id: "",
    season,
    match_date: "",
    opposition: "",
    player_name: "",
    goals: 3,
  };
}

function sortHatTricks(records: HatTrickRow[]) {
  return [...records].sort(
    (a, b) =>
      a.match_date.localeCompare(b.match_date) ||
      a.player_name.localeCompare(b.player_name),
  );
}

function payload(record: HatTrickRow) {
  return {
    id: record.id || undefined,
    season: record.season,
    matchDate: record.match_date,
    opposition: record.opposition,
    playerName: record.player_name,
    goals: record.goals,
  };
}

export function HatTrickAdmin({
  initialHatTricks,
  seasons,
  selectedSeason,
  selectedDate,
}: {
  initialHatTricks: HatTrickRow[];
  seasons: number[];
  selectedSeason: number;
  selectedDate?: string;
}) {
  const router = useRouter();
  const [hatTricks, setHatTricks] = useState(sortHatTricks(initialHatTricks));
  const [editing, setEditing] = useState<HatTrickRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function filterUrl(season: number, date: string) {
    const params = new URLSearchParams({ season: String(season) });
    if (date) params.set("date", date);
    return `/admin/hat-tricks?${params.toString()}`;
  }

  function update(key: keyof HatTrickRow, value: string) {
    setEditing((record) => {
      if (!record) return record;
      if (key === "season" || key === "goals") {
        return { ...record, [key]: Number(value) };
      }
      return { ...record, [key]: value };
    });
  }

  function closeEditor() {
    setEditing(null);
    setMessage(null);
    setIsError(false);
  }

  async function saveHatTrick() {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const isNew = !editing.id;
    try {
      const response = await fetch("/api/admin/hat-tricks", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(editing)),
      });
      const result = (await response.json()) as {
        message?: string;
        hatTrick?: HatTrickRow;
      };
      if (!response.ok || !result.hatTrick) {
        throw new Error(result.message || "The hat-trick could not be saved.");
      }
      setHatTricks((records) =>
        sortHatTricks(
          isNew
            ? [...records, result.hatTrick]
            : records.map((record) =>
                record.id === result.hatTrick!.id ? result.hatTrick! : record,
              ),
        ),
      );
      setEditing(result.hatTrick);
      setMessage(isNew ? "Hat-trick added." : "Hat-trick updated.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The hat-trick could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeHatTrick(record: HatTrickRow) {
    if (
      !window.confirm(
        `Delete ${record.player_name}'s hat-trick on ${record.match_date}?`,
      )
    ) {
      return;
    }
    setSaving(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await fetch("/api/admin/hat-tricks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(
          result.message || "The hat-trick could not be deleted.",
        );
      }
      setHatTricks((records) =>
        records.filter((item) => item.id !== record.id),
      );
      if (editing?.id === record.id) closeEditor();
      setMessage("Hat-trick removed.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The hat-trick could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <div className="border-b border-[#071a2b]/15 pb-6">
          <label htmlFor="hat-trick-season" className={labelClass}>
            Season
          </label>
          <select
            id="hat-trick-season"
            value={selectedSeason}
            onChange={(event) =>
              router.push(
                filterUrl(Number(event.target.value), selectedDate ?? ""),
              )
            }
            className={inputClass}
          >
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}/{String(season + 1).slice(-2)}
              </option>
            ))}
          </select>
          <label htmlFor="hat-trick-date" className={`mt-5 ${labelClass}`}>
            Match date
          </label>
          <input
            id="hat-trick-date"
            type="date"
            defaultValue={selectedDate}
            onChange={(event) =>
              router.push(filterUrl(selectedSeason, event.target.value))
            }
            className={inputClass}
          />
          <p className="mt-3 text-sm leading-6 text-[#071a2b]/55">
            Showing {hatTricks.length} hat-trick records.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(blankHatTrick(selectedSeason))}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800"
          >
            <PlusIcon className="h-4 w-4" /> Add hat-trick
          </button>
        ) : (
          <div className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  {editing.id ? "Edit hat-trick" : "New hat-trick"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  {editing.player_name || "Add a scorer"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="text-xs font-bold text-blue-700 underline underline-offset-4"
              >
                Close
              </button>
            </div>
            {message && (
              <p
                role="status"
                className={`mt-4 text-sm font-semibold ${isError ? "text-red-700" : "text-emerald-700"}`}
              >
                {message}
              </p>
            )}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Season">
                <select
                  value={editing.season}
                  onChange={(event) => update("season", event.target.value)}
                  className={inputClass}
                >
                  {seasons.map((season) => (
                    <option key={season} value={season}>
                      {season}/{String(season + 1).slice(-2)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Match date">
                <input
                  type="date"
                  value={editing.match_date}
                  onChange={(event) => update("match_date", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Player">
                <input
                  value={editing.player_name}
                  onChange={(event) =>
                    update("player_name", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Opposition">
                <input
                  value={editing.opposition}
                  onChange={(event) => update("opposition", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Goals">
                <input
                  type="number"
                  min="3"
                  step="1"
                  value={editing.goals}
                  onChange={(event) => update("goals", event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => void saveHatTrick()}
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {editing.id ? (
                <PencilSquareIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              {saving
                ? "Saving…"
                : editing.id
                  ? "Save hat-trick"
                  : "Add hat-trick"}
            </button>
          </div>
        )}
      </aside>

      <section className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Published hat-trick records
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {selectedSeason}/{String(selectedSeason + 1).slice(-2)} hat-tricks
        </h2>
        {message && !editing && (
          <p
            role="status"
            className={`mt-4 text-sm font-semibold ${isError ? "text-red-700" : "text-emerald-700"}`}
          >
            {message}
          </p>
        )}
        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-3 py-4">Player</th>
                <th className="px-3 py-4">Opposition</th>
                <th className="px-3 py-4">Goals</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {hatTricks.map((record) => (
                <tr key={record.id} className="hover:bg-[#f4f0e8]">
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">
                    {record.match_date}
                  </td>
                  <td className="px-3 py-4 font-semibold">
                    {record.player_name}
                  </td>
                  <td className="px-3 py-4">{record.opposition}</td>
                  <td className="px-3 py-4 font-mono text-xs">
                    {record.goals}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(record);
                          setMessage(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-blue-700 underline underline-offset-4"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void removeHatTrick(record)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-700 underline underline-offset-4 disabled:opacity-50"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={labelClass}>
      {label}
      {children}
    </label>
  );
}
