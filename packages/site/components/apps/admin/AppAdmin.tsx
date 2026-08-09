"use client";

import type { AppRow } from "@tranmere-web/lib/src/d1-types";
import { MATCH_COMPETITIONS } from "@tranmere-web/lib/src/competition-constants";
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

type AppForm = AppRow;

function blankApp(season: number, date?: string): AppForm {
  return {
    id: "",
    season,
    match_date: date ?? "",
    player_name: "",
    competition: null,
    opposition: "",
    shirt_number: null,
    yellow_card: 0,
    red_card: 0,
    substitute_yellow_card: 0,
    substitute_red_card: 0,
    substitute_time: null,
    substituted_by: null,
    substitute_substituted_by: null,
  };
}

function sortApps(apps: AppRow[]) {
  return [...apps].sort(
    (a, b) =>
      a.match_date.localeCompare(b.match_date) ||
      (a.shirt_number ?? 99) - (b.shirt_number ?? 99) ||
      a.player_name.localeCompare(b.player_name),
  );
}

function payload(app: AppForm) {
  return {
    id: app.id || undefined,
    season: app.season,
    matchDate: app.match_date,
    playerName: app.player_name,
    competition: app.competition,
    opposition: app.opposition,
    shirtNumber: app.shirt_number,
    yellowCard: app.yellow_card,
    redCard: app.red_card,
    substituteYellowCard: app.substitute_yellow_card,
    substituteRedCard: app.substitute_red_card,
    substituteTime: app.substitute_time,
    substitutedBy: app.substituted_by,
    substituteSubstitutedBy: app.substitute_substituted_by,
  };
}

function filterUrl(season: number, date: string) {
  const params = new URLSearchParams({ season: String(season) });
  if (date) params.set("date", date);
  return `/admin/apps?${params.toString()}`;
}

export function AppAdmin({
  initialApps,
  seasons,
  clubs,
  selectedSeason,
  selectedDate,
}: {
  initialApps: AppRow[];
  seasons: number[];
  clubs: string[];
  selectedSeason: number;
  selectedDate?: string;
}) {
  const router = useRouter();
  const [apps, setApps] = useState(sortApps(initialApps));
  const [editing, setEditing] = useState<AppForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function changeField(key: keyof AppForm, value: string | boolean) {
    setEditing((app) => {
      if (!app) return app;
      if (key === "season") return { ...app, season: Number(value) };
      if (key === "shirt_number") {
        return { ...app, shirt_number: value === "" ? null : Number(value) };
      }
      if (
        key === "yellow_card" ||
        key === "red_card" ||
        key === "substitute_yellow_card" ||
        key === "substitute_red_card"
      ) {
        return { ...app, [key]: value ? 1 : 0 } as AppForm;
      }
      return { ...app, [key]: String(value) || null } as AppForm;
    });
  }

  function closeEditor() {
    setEditing(null);
    setMessage(null);
    setIsError(false);
  }

  async function saveApp() {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const isNew = !editing.id;

    try {
      const response = await fetch("/api/admin/apps", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(editing)),
      });
      const result = (await response.json()) as {
        message?: string;
        app?: AppRow;
      };
      if (!response.ok || !result.app) {
        throw new Error(result.message || "The appearance could not be saved.");
      }

      setApps((records) =>
        sortApps(
          isNew
            ? [...records, result.app!]
            : records.map((record) =>
                record.id === result.app!.id ? result.app! : record,
              ),
        ),
      );
      setEditing(result.app);
      setMessage(isNew ? "Appearance added." : "Appearance updated.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The appearance could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeApp(app: AppRow) {
    if (
      !window.confirm(
        `Delete ${app.player_name}'s appearance on ${app.match_date}?`,
      )
    ) {
      return;
    }
    setSaving(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await fetch("/api/admin/apps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(
          result.message || "The appearance could not be deleted.",
        );
      }
      setApps((records) => records.filter((record) => record.id !== app.id));
      if (editing?.id === app.id) closeEditor();
      setMessage("Appearance removed.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The appearance could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[390px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <div className="border-b border-[#071a2b]/15 pb-6">
          <label htmlFor="app-season" className={labelClass}>
            Season
          </label>
          <select
            id="app-season"
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
          <label htmlFor="app-date" className={`mt-5 ${labelClass}`}>
            Match date
          </label>
          <input
            id="app-date"
            type="date"
            defaultValue={selectedDate}
            onChange={(event) =>
              router.push(filterUrl(selectedSeason, event.target.value))
            }
            className={inputClass}
          />
          <p className="mt-3 text-sm leading-6 text-[#071a2b]/55">
            Showing {apps.length} appearance records.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(blankApp(selectedSeason, selectedDate))}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800"
          >
            <PlusIcon className="h-4 w-4" />
            Add appearance
          </button>
        ) : (
          <div className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  {editing.id ? "Edit appearance" : "New appearance"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  {editing.player_name || "Add a player"}
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
              <Field label="Player name">
                <input
                  value={editing.player_name}
                  onChange={(event) =>
                    changeField("player_name", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Opposition">
                <select
                  value={editing.opposition}
                  onChange={(event) =>
                    changeField("opposition", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select opposition</option>
                  {[...new Set([...clubs, editing.opposition])]
                    .filter(Boolean)
                    .sort((a, b) => a.localeCompare(b))
                    .map((club) => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Competition">
                <select
                  value={editing.competition ?? ""}
                  onChange={(event) =>
                    changeField("competition", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select competition</option>
                  {[...new Set([...MATCH_COMPETITIONS, editing.competition])]
                    .filter((competition): competition is string =>
                      Boolean(competition),
                    )
                    .map((competition) => (
                      <option key={competition} value={competition}>
                        {competition}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Shirt number">
                <input
                  type="number"
                  min="0"
                  value={editing.shirt_number ?? ""}
                  onChange={(event) =>
                    changeField("shirt_number", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Substitution minute">
                <input
                  value={editing.substitute_time ?? ""}
                  onChange={(event) =>
                    changeField("substitute_time", event.target.value)
                  }
                  placeholder="For example: 68"
                  className={inputClass}
                />
              </Field>
              <Field label="Replaced by">
                <input
                  value={editing.substituted_by ?? ""}
                  onChange={(event) =>
                    changeField("substituted_by", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Replacement then replaced by">
                <input
                  value={editing.substitute_substituted_by ?? ""}
                  onChange={(event) =>
                    changeField("substitute_substituted_by", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 grid grid-cols-2 gap-3 border border-[#071a2b]/10 p-3">
                <Checkbox
                  label="Yellow card"
                  checked={Boolean(editing.yellow_card)}
                  onChange={(checked) => changeField("yellow_card", checked)}
                />
                <Checkbox
                  label="Red card"
                  checked={Boolean(editing.red_card)}
                  onChange={(checked) => changeField("red_card", checked)}
                />
                <Checkbox
                  label="Sub yellow"
                  checked={Boolean(editing.substitute_yellow_card)}
                  onChange={(checked) =>
                    changeField("substitute_yellow_card", checked)
                  }
                />
                <Checkbox
                  label="Sub red"
                  checked={Boolean(editing.substitute_red_card)}
                  onChange={(checked) =>
                    changeField("substitute_red_card", checked)
                  }
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void saveApp()}
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
                  ? "Save appearance"
                  : "Add appearance"}
            </button>
          </div>
        )}
      </aside>

      <section className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Published player records
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {selectedDate
            ? `Appearances on ${selectedDate}`
            : `${selectedSeason}/${String(selectedSeason + 1).slice(-2)} appearance list`}
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
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-3 py-4">Player</th>
                <th className="px-3 py-4">Opposition</th>
                <th className="px-3 py-4">No.</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-[#f4f0e8]">
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">
                    {app.match_date}
                  </td>
                  <td className="px-3 py-4 font-semibold">{app.player_name}</td>
                  <td className="px-3 py-4">{app.opposition}</td>
                  <td className="px-3 py-4 font-mono text-xs">
                    {app.shirt_number ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(app);
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
                        onClick={() => void removeApp(app)}
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-[#071a2b]/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#1d4ed8]"
      />
      {label}
    </label>
  );
}
