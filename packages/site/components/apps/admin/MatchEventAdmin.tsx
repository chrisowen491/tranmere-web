"use client";

import {
  MATCH_EVENT_FANTASY_POINTS,
  MATCH_EVENT_TYPE_LABELS,
  MATCH_EVENT_TYPES,
  matchEventTypeLabel,
  type MatchEventType,
} from "@tranmere-web/lib/src/match-event-constants";
import type { MatchEventRow } from "@tranmere-web/lib/src/d1-types";
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

function blankEvent(season: number, date?: string): MatchEventRow {
  const now = new Date().toISOString();
  return {
    id: "",
    season,
    match_date: date ?? "",
    player_name: "",
    event_type: "PenaltySave",
    minute: null,
    notes: null,
    metadata_json: null,
    created_at: now,
    updated_at: now,
  };
}

function fantasyPoints(eventType: string) {
  return MATCH_EVENT_TYPES.includes(eventType as MatchEventType)
    ? MATCH_EVENT_FANTASY_POINTS[eventType as MatchEventType]
    : null;
}

function sortEvents(events: MatchEventRow[]) {
  return [...events].sort(
    (a, b) =>
      b.match_date.localeCompare(a.match_date) ||
      a.event_type.localeCompare(b.event_type) ||
      a.player_name.localeCompare(b.player_name) ||
      (a.minute ?? "").localeCompare(b.minute ?? ""),
  );
}

function filterUrl(season: number, date: string) {
  const params = new URLSearchParams({ season: String(season) });
  if (date) params.set("date", date);
  return `/admin/match-events?${params.toString()}`;
}

function payload(event: MatchEventRow) {
  return {
    id: event.id || undefined,
    season: event.season,
    matchDate: event.match_date,
    playerName: event.player_name,
    eventType: event.event_type,
    minute: event.minute,
    notes: event.notes,
    metadataJson: event.metadata_json,
  };
}

export function MatchEventAdmin({
  initialEvents,
  seasons,
  players,
  selectedSeason,
  selectedDate,
}: {
  initialEvents: MatchEventRow[];
  seasons: number[];
  players: string[];
  selectedSeason: number;
  selectedDate?: string;
}) {
  const router = useRouter();
  const [events, setEvents] = useState(sortEvents(initialEvents));
  const [editing, setEditing] = useState<MatchEventRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function changeField(key: keyof MatchEventRow, value: string) {
    setEditing((event) => {
      if (!event) return event;
      if (key === "season") return { ...event, season: Number(value) };
      if (["match_date", "player_name", "event_type"].includes(key)) {
        return { ...event, [key]: value } as MatchEventRow;
      }
      return { ...event, [key]: value || null } as MatchEventRow;
    });
  }

  function closeEditor() {
    setEditing(null);
    setMessage(null);
    setIsError(false);
  }

  async function saveEvent() {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const isNew = !editing.id;
    try {
      const response = await fetch("/api/admin/match-events", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(editing)),
      });
      const result = (await response.json()) as {
        message?: string;
        event?: MatchEventRow;
      };
      if (!response.ok || !result.event) {
        throw new Error(
          result.message || "The match event could not be saved.",
        );
      }
      setEvents((records) =>
        sortEvents(
          isNew
            ? [...records, result.event!]
            : records.map((record) =>
                record.id === result.event!.id ? result.event! : record,
              ),
        ),
      );
      setEditing(result.event);
      setMessage(isNew ? "Match event added." : "Match event updated.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The match event could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(event: MatchEventRow) {
    if (
      !window.confirm(
        `Delete ${matchEventTypeLabel(event.event_type)} for ${event.player_name}?`,
      )
    )
      return;
    setSaving(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await fetch("/api/admin/match-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "The event could not be deleted.");
      setEvents((records) =>
        records.filter((record) => record.id !== event.id),
      );
      if (editing?.id === event.id) closeEditor();
      setMessage("Match event removed.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The event could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[390px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <div className="border-b border-[#071a2b]/15 pb-6">
          <label htmlFor="event-season" className={labelClass}>
            Season
          </label>
          <select
            id="event-season"
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
          <label htmlFor="event-date" className={`mt-5 ${labelClass}`}>
            Match date
          </label>
          <input
            id="event-date"
            type="date"
            defaultValue={selectedDate}
            onChange={(event) =>
              router.push(filterUrl(selectedSeason, event.target.value))
            }
            className={inputClass}
          />
          <p className="mt-3 text-sm leading-6 text-[#071a2b]/55">
            Showing {events.length} match event records.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(blankEvent(selectedSeason, selectedDate))}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" /> Add event
          </button>
        ) : (
          <div className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  {editing.id ? "Edit event" : "New event"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  {editing.player_name || "Add a player event"}
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Season">
                <select
                  value={editing.season}
                  onChange={(event) =>
                    changeField("season", event.target.value)
                  }
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
                  onChange={(event) =>
                    changeField("match_date", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Player">
                <input
                  list="match-event-players"
                  value={editing.player_name}
                  onChange={(event) =>
                    changeField("player_name", event.target.value)
                  }
                  className={inputClass}
                />
                <datalist id="match-event-players">
                  {players.map((player) => (
                    <option key={player} value={player} />
                  ))}
                </datalist>
              </Field>
              <Field label="Event type">
                <input
                  list="match-event-types"
                  value={editing.event_type}
                  onChange={(event) =>
                    changeField("event_type", event.target.value)
                  }
                  className={inputClass}
                />
                <datalist id="match-event-types">
                  {MATCH_EVENT_TYPES.map((eventType) => (
                    <option key={eventType} value={eventType}>
                      {MATCH_EVENT_TYPE_LABELS[eventType]}
                    </option>
                  ))}
                </datalist>
                <p className="mt-2 text-xs leading-5 text-[#071a2b]/50">
                  Use a short code without spaces. New codes can be added
                  without changing the database.
                </p>
              </Field>
              <Field label="Minute">
                <input
                  value={editing.minute ?? ""}
                  onChange={(event) =>
                    changeField("minute", event.target.value)
                  }
                  placeholder="For example: 74"
                  className={inputClass}
                />
              </Field>
              <Field label="Notes">
                <textarea
                  value={editing.notes ?? ""}
                  onChange={(event) => changeField("notes", event.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <Field label="Metadata JSON">
                  <textarea
                    value={editing.metadata_json ?? ""}
                    onChange={(event) =>
                      changeField("metadata_json", event.target.value)
                    }
                    rows={4}
                    placeholder='Optional, for example: {"outcome":"saved"}'
                    className={`${inputClass} font-mono text-xs`}
                  />
                </Field>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={saveEvent}
              className="mt-6 inline-flex w-full items-center justify-center bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing.id ? "Save changes" : "Add event"}
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
            Recorded match events
          </h2>
        </div>
        {events.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-[#071a2b] font-mono text-[10px] uppercase tracking-[0.12em] text-white/65">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Player</th>
                  <th className="px-5 py-4">Event</th>
                  <th className="px-5 py-4 text-center">Minute</th>
                  <th className="px-5 py-4 text-center">Fantasy</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071a2b]/10">
                {events.map((event) => {
                  const points = fantasyPoints(event.event_type);
                  return (
                    <tr key={event.id} className="hover:bg-blue-50/60">
                      <td className="px-5 py-4 font-mono text-xs">
                        {event.match_date}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {event.player_name}
                      </td>
                      <td className="px-5 py-4">
                        {matchEventTypeLabel(event.event_type)}
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {event.minute || "—"}
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-bold">
                        {points === null
                          ? "Not scored"
                          : `${points > 0 ? "+" : ""}${points}`}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing(event)}
                            className="inline-flex items-center gap-1 border border-[#071a2b]/15 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-[#e8e2d6]"
                          >
                            <PencilSquareIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => removeEvent(event)}
                            className="inline-flex items-center gap-1 border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <h3 className="font-display text-2xl font-semibold">
              No events recorded
            </h3>
            <p className="mt-2 text-sm text-[#071a2b]/55">
              Add the first event for this season or choose another filter.
            </p>
          </div>
        )}
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
