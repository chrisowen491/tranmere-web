"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";

interface ProposedAppearance {
  key: string;
  playerName: string;
  shirtNumber: string;
  substitutedBy: string;
  substituteTime: string;
  yellowCard: boolean;
  redCard: boolean;
  substituteYellowCard: boolean;
  substituteRedCard: boolean;
}

const inputClass =
  "mt-1 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/50";

function blankAppearance(): ProposedAppearance {
  return {
    key: crypto.randomUUID(),
    playerName: "",
    shirtNumber: "",
    substitutedBy: "",
    substituteTime: "",
    yellowCard: false,
    redCard: false,
    substituteYellowCard: false,
    substituteRedCard: false,
  };
}

export function MissingAppearanceCorrectionForm({
  season,
  matchDate,
  emptyLineup = false,
}: {
  season: string;
  matchDate: string;
  emptyLineup?: boolean;
}) {
  const { user, isLoading } = useUser();
  const [rows, setRows] = useState<ProposedAppearance[]>([blankAppearance()]);
  const [open, setOpen] = useState(emptyLineup);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function update(key: string, changes: Partial<ProposedAppearance>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    );
  }

  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMessage(null);
    setIsError(false);
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/appearance-corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season,
          matchDate,
          newAppearances: rows.map((row) => ({
            playerName: row.playerName,
            shirtNumber: row.shirtNumber,
            substitutedBy: row.substitutedBy,
            substituteTime: row.substituteTime,
            yellowCard: row.yellowCard,
            redCard: row.redCard,
            substituteYellowCard: row.substituteYellowCard,
            substituteRedCard: row.substituteRedCard,
          })),
          source: formData.get("source"),
          explanation: formData.get("explanation"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(
          result.message || "The missing lineup data could not be sent.",
        );
      setMessage(
        result.message || "The missing lineup data is awaiting review.",
      );
      setRows([blankAppearance()]);
      setOpen(false);
      form.reset();
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The missing lineup data could not be sent.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return null;
  if (!user)
    return (
      <a
        href={`/auth/login?returnTo=${encodeURIComponent(`/match/${season}/${matchDate}`)}`}
        className="inline-block text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        Log in to add missing lineup data
      </a>
    );

  return (
    <div>
      {message && (
        <p
          role="status"
          className={`mb-3 text-sm font-semibold ${isError ? "text-red-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="border border-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-blue-700 hover:bg-blue-50"
      >
        {open ? "Cancel missing players" : "Add missing players"}
      </button>
      {open && (
        <form
          className="mt-5 border-t border-[#071a2b]/10 pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(event.currentTarget);
          }}
        >
          <div className="space-y-4">
            {rows.map((row, index) => (
              <fieldset
                key={row.key}
                className="border border-[#071a2b]/15 bg-[#f4f0e8] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <legend className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                    Missing player {index + 1}
                  </legend>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setRows((current) =>
                          current.filter((item) => item.key !== row.key),
                        )
                      }
                      className="text-xs font-bold text-red-700 underline underline-offset-4"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className={labelClass}>
                    Player
                    <input
                      required
                      maxLength={200}
                      value={row.playerName}
                      onChange={(event) =>
                        update(row.key, { playerName: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Shirt number
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={row.shirtNumber}
                      onChange={(event) =>
                        update(row.key, { shirtNumber: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Replacement
                    <input
                      maxLength={200}
                      value={row.substitutedBy}
                      onChange={(event) =>
                        update(row.key, { substitutedBy: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Substitution minute
                    <input
                      maxLength={40}
                      placeholder="For example: 74"
                      value={row.substituteTime}
                      onChange={(event) =>
                        update(row.key, { substituteTime: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {(
                    [
                      ["yellowCard", "Starter yellow"],
                      ["redCard", "Starter red"],
                      ["substituteYellowCard", "Replacement yellow"],
                      ["substituteRedCard", "Replacement red"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row[field]}
                        onChange={(event) =>
                          update(row.key, { [field]: event.target.checked })
                        }
                        className="h-4 w-4 accent-blue-700"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          {rows.length < 11 && (
            <button
              type="button"
              onClick={() =>
                setRows((current) => [...current, blankAppearance()])
              }
              className="mt-4 text-xs font-bold text-blue-700 underline underline-offset-4"
            >
              + Add another missing player
            </button>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Source <span className="font-sans font-normal">(optional)</span>
              <input
                name="source"
                maxLength={1000}
                placeholder="Programme, report or URL"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Additional notes{" "}
              <span className="font-sans font-normal">(optional)</span>
              <textarea
                name="explanation"
                rows={2}
                maxLength={1000}
                className={`${inputClass} resize-y`}
              />
            </label>
          </div>
          <button
            disabled={busy}
            className="mt-5 bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {busy ? "Sending…" : `Submit ${rows.length} for review`}
          </button>
        </form>
      )}
    </div>
  );
}
