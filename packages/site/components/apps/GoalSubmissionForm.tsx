"use client";

import { useUser } from "@auth0/nextjs-auth0";
import {
  ASSIST_TYPES,
  GOAL_FEET,
  GOAL_TYPES,
} from "@tranmere-web/lib/src/goal-constants";
import { useState } from "react";

const inputClass =
  "mt-1 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/50";

export function GoalSubmissionForm({
  season,
  matchDate,
  opposition,
  competition,
  playerNames,
}: {
  season: string;
  matchDate: string;
  opposition: string;
  competition?: string | null;
  playerNames: string[];
}) {
  const { user, isLoading } = useUser();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  if (isLoading) return null;
  if (!user)
    return (
      <a
        href={`/auth/login?returnTo=${encodeURIComponent(`/match/${season}/${matchDate}`)}`}
        className="text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        Log in to suggest a missing goal
      </a>
    );
  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMessage("");
    setError(false);
    const data = new FormData(form);
    const response = await fetch("/api/goal-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        season,
        matchDate,
        opposition,
        competition,
        goal: {
          scorer: data.get("scorer"),
          minute: data.get("minute"),
          goalType: data.get("goalType"),
          foot: data.get("foot"),
          assist: data.get("assist"),
          assistType: data.get("assistType"),
        },
        source: data.get("source"),
        explanation: data.get("explanation"),
      }),
    });
    const body = (await response.json()) as { message?: string };
    setBusy(false);
    if (response.ok) {
      form.reset();
      setMessage("Thanks — the missing goal is awaiting review.");
    } else {
      setError(true);
      setMessage(body.message || "The goal could not be submitted.");
    }
  }
  return (
    <details className="group mt-6 border border-[#071a2b]/15 bg-[#fffdf8]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden sm:p-6">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
            Community archive
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">
            Suggest a missing goal
          </h3>
        </div>
        <span
          aria-hidden="true"
          className="grid h-9 w-9 place-items-center border border-[#071a2b]/20 font-mono text-xl text-blue-700 transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="border-t border-[#071a2b]/10 p-5 sm:p-6">
        {message && (
          <p
            role="status"
            className={`mb-4 text-sm font-semibold ${error ? "text-red-700" : "text-emerald-700"}`}
          >
            {message}
          </p>
        )}
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(event.currentTarget);
          }}
        >
          <div>
            <label className={labelClass}>Scorer</label>
            <input
              name="scorer"
              required
              list="missing-goal-players"
              maxLength={200}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Minute</label>
            <input
              name="minute"
              placeholder="74 or 90+3"
              maxLength={40}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Goal type</label>
            <input
              name="goalType"
              list="missing-goal-types"
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Foot or body part</label>
            <select name="foot" className={inputClass}>
              <option value="">Not recorded</option>
              {GOAL_FEET.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Assist</label>
            <input
              name="assist"
              list="missing-goal-players"
              maxLength={200}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Assist type</label>
            <input
              name="assistType"
              list="missing-assist-types"
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Source <span className="font-sans font-normal">(optional)</span>
            </label>
            <input
              name="source"
              maxLength={1000}
              placeholder="Programme, report or URL"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Additional notes{" "}
              <span className="font-sans font-normal">(optional)</span>
            </label>
            <textarea
              name="explanation"
              rows={2}
              maxLength={1000}
              className={`${inputClass} resize-y`}
            />
          </div>
          <button
            disabled={busy}
            className="w-fit bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50 sm:col-span-2 lg:col-span-3"
          >
            {busy ? "Sending…" : "Submit for review"}
          </button>
          <datalist id="missing-goal-players">
            {playerNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <datalist id="missing-goal-types">
            {GOAL_TYPES.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          <datalist id="missing-assist-types">
            {ASSIST_TYPES.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </form>
      </div>
    </details>
  );
}
