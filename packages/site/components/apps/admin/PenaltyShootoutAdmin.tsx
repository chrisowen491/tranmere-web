"use client";
import type { PenaltyShootoutKickRow } from "@tranmere-web/lib/src/d1-types";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";

const input =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const label =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";
const sort = (rows: PenaltyShootoutKickRow[]) =>
  [...rows].sort(
    (a, b) =>
      b.match_date.localeCompare(a.match_date) || a.kick_order - b.kick_order,
  );
const blank = (
  season: number,
  date?: string,
  order = 1,
): PenaltyShootoutKickRow => ({
  id: "",
  season,
  match_date: date ?? "",
  kick_order: order,
  team_side: "tranmere",
  player_name: "",
  outcome: "scored",
  notes: null,
  created_at: "",
  updated_at: "",
});

export function PenaltyShootoutAdmin({
  initialKicks,
  seasons,
  players,
  selectedSeason,
  selectedDate,
}: {
  initialKicks: PenaltyShootoutKickRow[];
  seasons: number[];
  players: string[];
  selectedSeason: number;
  selectedDate?: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(sort(initialKicks));
  const [editing, setEditing] = useState<PenaltyShootoutKickRow | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const url = (season: number, date: string) =>
    `/admin/penalty-shootouts?season=${season}${date ? `&date=${date}` : ""}`;
  const change = (key: keyof PenaltyShootoutKickRow, value: string) =>
    setEditing((current) =>
      current
        ? ({
            ...current,
            [key]:
              key === "season" || key === "kick_order"
                ? Number(value)
                : key === "notes"
                  ? value || null
                  : value,
          } as PenaltyShootoutKickRow)
        : current,
    );
  async function save() {
    if (!editing) return;
    setSaving(true);
    setMessage("");
    const fresh = !editing.id;
    try {
      const response = await fetch("/api/admin/penalty-shootouts", {
        method: fresh ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id || undefined,
          season: editing.season,
          matchDate: editing.match_date,
          kickOrder: editing.kick_order,
          teamSide: editing.team_side,
          playerName: editing.player_name,
          outcome: editing.outcome,
          notes: editing.notes,
        }),
      });
      const result = (await response.json()) as {
        kick?: PenaltyShootoutKickRow;
        message?: string;
      };
      if (!response.ok || !result.kick)
        throw new Error(result.message || "Could not save kick.");
      setRows((current) =>
        sort(
          fresh
            ? [...current, result.kick!]
            : current.map((row) =>
                row.id === result.kick!.id ? result.kick! : row,
              ),
        ),
      );
      setEditing(result.kick);
      setMessage(fresh ? "Kick added." : "Kick updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save kick.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove(row: PenaltyShootoutKickRow) {
    if (!confirm(`Delete kick ${row.kick_order} by ${row.player_name}?`))
      return;
    const response = await fetch("/api/admin/penalty-shootouts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    if (response.ok) {
      setRows((current) => current.filter((item) => item.id !== row.id));
      if (editing?.id === row.id) setEditing(null);
    } else {
      const result = (await response.json()) as { message?: string };
      setMessage(result.message || "Could not delete kick.");
    }
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[390px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <label className={label}>
          Season
          <select
            value={selectedSeason}
            onChange={(e) =>
              router.push(url(Number(e.target.value), selectedDate ?? ""))
            }
            className={input}
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}/{String(s + 1).slice(-2)}
              </option>
            ))}
          </select>
        </label>
        <label className={`mt-5 ${label}`}>
          Match date
          <input
            type="date"
            defaultValue={selectedDate}
            onChange={(e) => router.push(url(selectedSeason, e.target.value))}
            className={input}
          />
        </label>
        {!editing ? (
          <button
            onClick={() =>
              setEditing(blank(selectedSeason, selectedDate, rows.length + 1))
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
          >
            <PlusIcon className="h-4 w-4" />
            Add kick
          </button>
        ) : (
          <div className="mt-6 border-t border-[#071a2b]/15 pt-6">
            <div className="flex justify-between">
              <h2 className="font-display text-2xl font-semibold">
                {editing.id ? "Edit kick" : "New kick"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-xs font-bold text-blue-700"
              >
                Close
              </button>
            </div>
            {message && <p className="mt-3 text-sm font-semibold">{message}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <label className={label}>
                Date
                <input
                  type="date"
                  value={editing.match_date}
                  onChange={(e) => change("match_date", e.target.value)}
                  className={input}
                />
              </label>
              <label className={label}>
                Order
                <input
                  type="number"
                  min="1"
                  value={editing.kick_order}
                  onChange={(e) => change("kick_order", e.target.value)}
                  className={input}
                />
              </label>
              <label className={label}>
                Team
                <select
                  value={editing.team_side}
                  onChange={(e) => change("team_side", e.target.value)}
                  className={input}
                >
                  <option value="tranmere">Tranmere Rovers</option>
                  <option value="opposition">Opposition</option>
                </select>
              </label>
              <label className={label}>
                Player
                <input
                  list={
                    editing.team_side === "tranmere"
                      ? "shootout-players"
                      : undefined
                  }
                  value={editing.player_name}
                  onChange={(e) => change("player_name", e.target.value)}
                  className={input}
                />
                <datalist id="shootout-players">
                  {players.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </label>
              <label className={label}>
                Outcome
                <select
                  value={editing.outcome}
                  onChange={(e) => change("outcome", e.target.value)}
                  className={input}
                >
                  <option value="scored">Scored</option>
                  <option value="missed">Missed</option>
                  <option value="saved">Saved</option>
                </select>
              </label>
              <label className={label}>
                Notes
                <input
                  value={editing.notes ?? ""}
                  onChange={(e) => change("notes", e.target.value)}
                  className={input}
                />
              </label>
            </div>
            <button
              disabled={saving}
              onClick={save}
              className="mt-6 w-full bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save kick"}
            </button>
          </div>
        )}
      </aside>
      <section className="border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="border-b border-[#071a2b]/15 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Published data
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Recorded kicks
          </h2>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-[#071a2b] font-mono text-[10px] uppercase tracking-[0.12em] text-white/65">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Team</th>
                  <th className="px-5 py-4">Player</th>
                  <th className="px-5 py-4">Outcome</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071a2b]/10">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/60">
                    <td className="px-5 py-4 font-mono text-xs">
                      {row.match_date}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold">
                      {row.kick_order}
                    </td>
                    <td className="px-5 py-4">
                      {row.team_side === "tranmere" ? "Tranmere" : "Opposition"}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {row.player_name}
                    </td>
                    <td
                      className={`px-5 py-4 font-bold ${row.outcome === "scored" ? "text-emerald-700" : "text-rose-700"}`}
                    >
                      {row.outcome}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(row)}
                          className="border border-[#071a2b]/15 p-2 text-blue-700"
                          aria-label={`Edit ${row.player_name}`}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(row)}
                          className="border border-red-200 p-2 text-red-700"
                          aria-label={`Delete ${row.player_name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-sm text-[#071a2b]/55">
            No kicks recorded for this filter.
          </p>
        )}
      </section>
    </div>
  );
}
