"use client";

import { useUser } from "@auth0/nextjs-auth0";
import type { Appearance } from "@tranmere-web/lib/src/tranmere-web-types";
import { useState } from "react";

const inputClass =
  "mt-1 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/50";
const checkboxClass = "h-4 w-4 accent-blue-700";

export function AppearanceCorrectionForm({
  appearance,
  season,
  matchDate,
  playerNames,
}: {
  appearance: Appearance;
  season: string;
  matchDate: string;
  playerNames: string[];
}) {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  if (!appearance.id || isLoading) return null;

  const current = {
    playerName: appearance.Name,
    shirtNumber: appearance.Number ?? "",
    yellowCard: Boolean(appearance.YellowCard),
    redCard: Boolean(appearance.RedCard),
    substitutedBy: appearance.SubbedBy ?? "",
    substituteTime: appearance.SubTime ?? "",
    substituteYellowCard: Boolean(appearance.SubYellow),
    substituteRedCard: Boolean(appearance.SubRed),
  };

  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMessage(null);
    setIsError(false);
    const data = new FormData(form);
    const proposed = {
      playerName: String(data.get("playerName") ?? "").trim(),
      shirtNumber: String(data.get("shirtNumber") ?? "").trim(),
      yellowCard: data.has("yellowCard"),
      redCard: data.has("redCard"),
      substitutedBy: String(data.get("substitutedBy") ?? "").trim(),
      substituteTime: String(data.get("substituteTime") ?? "").trim(),
      substituteYellowCard: data.has("substituteYellowCard"),
      substituteRedCard: data.has("substituteRedCard"),
    };
    const changes = Object.fromEntries(
      Object.entries(proposed).filter(
        ([field, value]) => value !== current[field as keyof typeof current],
      ),
    );
    try {
      const response = await fetch("/api/appearance-corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearanceId: appearance.id,
          changes,
          source: data.get("source"),
          explanation: data.get("explanation"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "The changes could not be sent.");
      setMessage("Thanks — these appearance changes are awaiting review.");
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
        className="text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        Log in to suggest changes
      </a>
    );

  return (
    <div>
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
        {open ? "Cancel correction" : "Suggest changes"}
      </button>
      {open && (
        <form
          className="mt-4 grid gap-4 border-t border-[#071a2b]/10 pt-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(event.currentTarget);
          }}
        >
          <div>
            <label
              className={labelClass}
              htmlFor={`app-player-${appearance.id}`}
            >
              Player
            </label>
            <input
              id={`app-player-${appearance.id}`}
              name="playerName"
              required
              defaultValue={current.playerName}
              list={`app-players-${appearance.id}`}
              maxLength={200}
              className={inputClass}
            />
          </div>
          <div>
            <label
              className={labelClass}
              htmlFor={`app-number-${appearance.id}`}
            >
              Shirt number
            </label>
            <input
              id={`app-number-${appearance.id}`}
              name="shirtNumber"
              type="number"
              min="0"
              max="999"
              defaultValue={current.shirtNumber}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`app-sub-${appearance.id}`}>
              Replacement
            </label>
            <input
              id={`app-sub-${appearance.id}`}
              name="substitutedBy"
              defaultValue={current.substitutedBy}
              list={`app-players-${appearance.id}`}
              maxLength={200}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`app-time-${appearance.id}`}>
              Substitution minute
            </label>
            <input
              id={`app-time-${appearance.id}`}
              name="substituteTime"
              defaultValue={current.substituteTime}
              placeholder="For example: 74"
              maxLength={40}
              className={inputClass}
            />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className={labelClass}>Starter cards</legend>
            <div className="mt-2 flex gap-5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  className={checkboxClass}
                  name="yellowCard"
                  type="checkbox"
                  defaultChecked={current.yellowCard}
                />{" "}
                Yellow
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  className={checkboxClass}
                  name="redCard"
                  type="checkbox"
                  defaultChecked={current.redCard}
                />{" "}
                Red
              </label>
            </div>
          </fieldset>
          <fieldset className="sm:col-span-2">
            <legend className={labelClass}>Replacement cards</legend>
            <div className="mt-2 flex gap-5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  className={checkboxClass}
                  name="substituteYellowCard"
                  type="checkbox"
                  defaultChecked={current.substituteYellowCard}
                />{" "}
                Yellow
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  className={checkboxClass}
                  name="substituteRedCard"
                  type="checkbox"
                  defaultChecked={current.substituteRedCard}
                />{" "}
                Red
              </label>
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label
              className={labelClass}
              htmlFor={`app-source-${appearance.id}`}
            >
              Source <span className="font-sans font-normal">(optional)</span>
            </label>
            <input
              id={`app-source-${appearance.id}`}
              name="source"
              maxLength={1000}
              placeholder="Programme, report or URL"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className={labelClass}
              htmlFor={`app-notes-${appearance.id}`}
            >
              Additional notes{" "}
              <span className="font-sans font-normal">(optional)</span>
            </label>
            <textarea
              id={`app-notes-${appearance.id}`}
              name="explanation"
              rows={2}
              maxLength={1000}
              className={`${inputClass} resize-y`}
            />
          </div>
          <button
            disabled={busy}
            className="w-fit bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50 sm:col-span-2 lg:col-span-4"
          >
            {busy ? "Sending…" : "Submit for review"}
          </button>
          <datalist id={`app-players-${appearance.id}`}>
            {playerNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </form>
      )}
    </div>
  );
}
