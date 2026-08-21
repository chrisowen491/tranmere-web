"use client";

import type { GoalRow } from "@tranmere-web/lib/src/d1-types";
import {
  ASSIST_TYPES,
  CROSS_SIDES,
  GOAL_DISTANCES,
  GOAL_DISTANCE_LABELS,
  GOAL_FEET,
  GOAL_TYPES,
} from "@tranmere-web/lib/src/goal-constants";
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

function blankGoal(season: number, date?: string): GoalRow {
  return {
    id: "",
    season,
    match_date: date ?? "",
    scorer: "",
    opposition: "",
    competition: null,
    minute: null,
    goal_type: null,
    assist: null,
    assist_type: null,
    foot: null,
    distance: null,
    cross_side: null,
  };
}

function sortGoals(goals: GoalRow[]) {
  return [...goals].sort(
    (a, b) =>
      a.match_date.localeCompare(b.match_date) ||
      a.scorer.localeCompare(b.scorer) ||
      (a.minute ?? "").localeCompare(b.minute ?? ""),
  );
}

function filterUrl(season: number, date: string) {
  const params = new URLSearchParams({ season: String(season) });
  if (date) params.set("date", date);
  return `/admin/goals?${params.toString()}`;
}

function payload(goal: GoalRow) {
  return {
    id: goal.id || undefined,
    season: goal.season,
    matchDate: goal.match_date,
    scorer: goal.scorer,
    opposition: goal.opposition,
    competition: goal.competition,
    minute: goal.minute,
    goalType: goal.goal_type,
    assist: goal.assist,
    assistType: goal.assist_type,
    foot: goal.foot,
    distance: goal.distance,
    crossSide: goal.cross_side,
  };
}

export function GoalAdmin({
  initialGoals,
  seasons,
  clubs,
  selectedSeason,
  selectedDate,
}: {
  initialGoals: GoalRow[];
  seasons: number[];
  clubs: string[];
  selectedSeason: number;
  selectedDate?: string;
}) {
  const router = useRouter();
  const [goals, setGoals] = useState(sortGoals(initialGoals));
  const [editing, setEditing] = useState<GoalRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function changeField(key: keyof GoalRow, value: string) {
    setEditing((goal) => {
      if (!goal) return goal;
      if (key === "season") return { ...goal, season: Number(value) };
      return { ...goal, [key]: String(value) || null } as GoalRow;
    });
  }

  function closeEditor() {
    setEditing(null);
    setMessage(null);
    setIsError(false);
  }

  async function saveGoal() {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const isNew = !editing.id;
    try {
      const response = await fetch("/api/admin/goals", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(editing)),
      });
      const result = (await response.json()) as {
        message?: string;
        goal?: GoalRow;
      };
      if (!response.ok || !result.goal) {
        throw new Error(result.message || "The goal could not be saved.");
      }
      setGoals((records) =>
        sortGoals(
          isNew
            ? [...records, result.goal!]
            : records.map((record) =>
                record.id === result.goal!.id ? result.goal! : record,
              ),
        ),
      );
      setEditing(result.goal);
      setMessage(isNew ? "Goal added." : "Goal updated.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "The goal could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeGoal(goal: GoalRow) {
    if (!window.confirm(`Delete ${goal.scorer}'s goal on ${goal.match_date}?`))
      return;
    setSaving(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await fetch("/api/admin/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goal.id }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "The goal could not be deleted.");
      setGoals((records) => records.filter((record) => record.id !== goal.id));
      if (editing?.id === goal.id) closeEditor();
      setMessage("Goal removed.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The goal could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[390px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <div className="border-b border-[#071a2b]/15 pb-6">
          <label htmlFor="goal-season" className={labelClass}>
            Season
          </label>
          <select
            id="goal-season"
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
          <label htmlFor="goal-date" className={`mt-5 ${labelClass}`}>
            Match date
          </label>
          <input
            id="goal-date"
            type="date"
            defaultValue={selectedDate}
            onChange={(event) =>
              router.push(filterUrl(selectedSeason, event.target.value))
            }
            className={inputClass}
          />
          <p className="mt-3 text-sm leading-6 text-[#071a2b]/55">
            Showing {goals.length} goal records.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(blankGoal(selectedSeason, selectedDate))}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800"
          >
            <PlusIcon className="h-4 w-4" /> Add goal
          </button>
        ) : (
          <div className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  {editing.id ? "Edit goal" : "New goal"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  {editing.scorer || "Add a scorer"}
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
              <Field label="Scorer">
                <input
                  value={editing.scorer}
                  onChange={(event) =>
                    changeField("scorer", event.target.value)
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
              <Field label="Minute">
                <input
                  value={editing.minute ?? ""}
                  onChange={(event) =>
                    changeField("minute", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Goal type">
                <select
                  value={editing.goal_type ?? ""}
                  onChange={(event) =>
                    changeField("goal_type", event.target.value)
                  }
                  className={inputClass}
                >
                  <OptionList
                    options={GOAL_TYPES}
                    value={editing.goal_type}
                    placeholder="Select goal type"
                  />
                </select>
              </Field>
              <Field label="Assist">
                <input
                  value={editing.assist ?? ""}
                  onChange={(event) =>
                    changeField("assist", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Assist type">
                <select
                  value={editing.assist_type ?? ""}
                  onChange={(event) =>
                    changeField("assist_type", event.target.value)
                  }
                  className={inputClass}
                >
                  <OptionList
                    options={ASSIST_TYPES}
                    value={editing.assist_type}
                    placeholder="Select assist type"
                  />
                </select>
              </Field>
              <Field label="Foot">
                <select
                  value={editing.foot ?? ""}
                  onChange={(event) => changeField("foot", event.target.value)}
                  className={inputClass}
                >
                  <OptionList
                    options={GOAL_FEET}
                    value={editing.foot}
                    placeholder="Select foot"
                  />
                </select>
              </Field>
              <Field label="Cross side">
                <select
                  value={editing.cross_side ?? ""}
                  onChange={(event) =>
                    changeField("cross_side", event.target.value)
                  }
                  className={inputClass}
                >
                  <OptionList
                    options={CROSS_SIDES}
                    value={editing.cross_side}
                    placeholder="Select cross side"
                  />
                </select>
              </Field>
              <Field label="Distance">
                <select
                  value={editing.distance ?? ""}
                  onChange={(event) =>
                    changeField("distance", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Not recorded</option>
                  {GOAL_DISTANCES.map((distance) => (
                    <option key={distance} value={distance}>
                      {GOAL_DISTANCE_LABELS[distance]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button
              type="button"
              onClick={() => void saveGoal()}
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {editing.id ? (
                <PencilSquareIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}{" "}
              {saving ? "Saving…" : editing.id ? "Save goal" : "Add goal"}
            </button>
          </div>
        )}
      </aside>
      <section className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Published goal records
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {selectedDate
            ? `Goals on ${selectedDate}`
            : `${selectedSeason}/${String(selectedSeason + 1).slice(-2)} goal list`}
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
                <th className="px-3 py-4">Scorer</th>
                <th className="px-3 py-4">Opposition</th>
                <th className="px-3 py-4">Min.</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {goals.map((goal) => (
                <tr key={goal.id} className="hover:bg-[#f4f0e8]">
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">
                    {goal.match_date}
                  </td>
                  <td className="px-3 py-4 font-semibold">{goal.scorer}</td>
                  <td className="px-3 py-4">{goal.opposition}</td>
                  <td className="px-3 py-4 font-mono text-xs">
                    {goal.minute ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(goal);
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
                        onClick={() => void removeGoal(goal)}
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

function OptionList({
  options,
  value,
  placeholder,
}: {
  options: readonly string[];
  value: string | null;
  placeholder: string;
}) {
  return (
    <>
      <option value="">{placeholder}</option>
      {[...new Set([...options, value])]
        .filter((option): option is string => Boolean(option))
        .map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
    </>
  );
}
