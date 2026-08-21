"use client";

import { useUser } from "@auth0/nextjs-auth0";
import {
  ASSIST_TYPES,
  GOAL_FEET,
  GOAL_DISTANCES,
  GOAL_DISTANCE_LABELS,
  GOAL_TYPES,
} from "@tranmere-web/lib/src/goal-constants";
import type { Goal } from "@tranmere-web/lib/src/tranmere-web-types";
import { useState } from "react";

const inputClass =
  "mt-1 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/50";

export function GoalCorrectionForm({
  goal,
  season,
  matchDate,
  playerNames,
}: {
  goal: Goal;
  season: string;
  matchDate: string;
  playerNames: string[];
}) {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!goal.id || isLoading) return null;
  const current = {
    scorer: goal.Scorer,
    minute: goal.Minute ?? "",
    goalType: goal.GoalType ?? "",
    foot: goal.Foot ?? "",
    assist: goal.Assist ?? "",
    assistType: goal.AssistType ?? "",
    distance: goal.Distance ?? "",
  };

  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMessage(null);
    setIsError(false);
    const data = new FormData(form);
    const changes = Object.fromEntries(
      Object.entries(current)
        .map(([field, value]) => [
          field,
          String(data.get(field) ?? "").trim(),
          value,
        ])
        .filter(([, value, existing]) => value !== existing)
        .map(([field, value]) => [field, value]),
    );
    try {
      const response = await fetch("/api/goal-corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: goal.id,
          changes,
          source: data.get("source"),
          explanation: data.get("explanation"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "The changes could not be sent.");
      setMessage("Thanks — these goal changes are awaiting review.");
      setOpen(false);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The changes could not be sent.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!user)
    return (
      <a
        href={`/auth/login?returnTo=${encodeURIComponent(`/match/${season}/${matchDate}`)}`}
        className="mt-4 inline-block text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        Log in to suggest goal changes
      </a>
    );

  return (
    <div className="mt-4 border-t border-[#071a2b]/10 pt-4">
      {message && (
        <p
          role="status"
          className={`mb-3 text-xs font-semibold ${isError ? "text-red-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        {open ? "Cancel correction" : "Suggest changes to this goal"}
      </button>

      {open && (
        <form
          className="mt-4 grid gap-4 border-t border-[#071a2b]/10 pt-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(event.currentTarget);
          }}
        >
          <div>
            <label className={labelClass} htmlFor={`goal-scorer-${goal.id}`}>
              Scorer
            </label>
            <input
              id={`goal-scorer-${goal.id}`}
              name="scorer"
              required
              defaultValue={current.scorer}
              list={`goal-players-${goal.id}`}
              maxLength={200}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`goal-minute-${goal.id}`}>
              Minute
            </label>
            <input
              id={`goal-minute-${goal.id}`}
              name="minute"
              defaultValue={current.minute}
              placeholder="For example: 74 or 90+3"
              maxLength={40}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`goal-type-${goal.id}`}>
              Goal type
            </label>
            <input
              id={`goal-type-${goal.id}`}
              name="goalType"
              defaultValue={current.goalType}
              list={`goal-types-${goal.id}`}
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`goal-assist-${goal.id}`}>
              Assist
            </label>
            <input
              id={`goal-assist-${goal.id}`}
              name="assist"
              defaultValue={current.assist}
              list={`goal-players-${goal.id}`}
              maxLength={200}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`goal-foot-${goal.id}`}>
              Foot or body part
            </label>
            <select
              id={`goal-foot-${goal.id}`}
              name="foot"
              defaultValue={current.foot}
              className={inputClass}
            >
              <option value="">Not recorded</option>
              {GOAL_FEET.map((foot) => (
                <option key={foot} value={foot}>
                  {foot}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className={labelClass}
              htmlFor={`goal-assist-type-${goal.id}`}
            >
              Assist type
            </label>
            <input
              id={`goal-assist-type-${goal.id}`}
              name="assistType"
              defaultValue={current.assistType}
              list={`assist-types-${goal.id}`}
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`goal-distance-${goal.id}`}>
              Distance
            </label>
            <select
              id={`goal-distance-${goal.id}`}
              name="distance"
              defaultValue={current.distance}
              className={inputClass}
            >
              <option value="">Not recorded</option>
              {GOAL_DISTANCES.map((distance) => (
                <option key={distance} value={distance}>
                  {GOAL_DISTANCE_LABELS[distance]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`goal-source-${goal.id}`}>
              Source <span className="font-sans font-normal">(optional)</span>
            </label>
            <input
              id={`goal-source-${goal.id}`}
              name="source"
              maxLength={1000}
              placeholder="Programme, report or URL"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor={`goal-notes-${goal.id}`}>
              Additional notes{" "}
              <span className="font-sans font-normal">(optional)</span>
            </label>
            <textarea
              id={`goal-notes-${goal.id}`}
              name="explanation"
              rows={2}
              maxLength={1000}
              className={`${inputClass} resize-y`}
            />
          </div>
          <button
            disabled={busy}
            className="w-fit bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50 sm:col-span-2"
          >
            {busy ? "Sending…" : "Submit for review"}
          </button>

          <datalist id={`goal-players-${goal.id}`}>
            {playerNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <datalist id={`goal-types-${goal.id}`}>
            {GOAL_TYPES.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
          <datalist id={`assist-types-${goal.id}`}>
            {ASSIST_TYPES.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </form>
      )}
    </div>
  );
}
