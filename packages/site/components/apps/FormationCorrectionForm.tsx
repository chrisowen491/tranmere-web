"use client";

import { MANAGER_FORMATIONS } from "@tranmere-web/lib/src/manager-constants";
import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";

export function FormationCorrectionForm({
  season,
  matchDate,
  currentFormation,
}: {
  season: string;
  matchDate: string;
  currentFormation?: string;
}) {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMessage(null);
    const data = new FormData(form);
    try {
      const response = await fetch("/api/formation-corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season,
          matchDate,
          proposedFormation: data.get("formation"),
          explanation: data.get("explanation"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "Suggestion could not be sent.");
      setMessage("Thanks — your formation suggestion is awaiting review.");
      setOpen(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Suggestion could not be sent.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return null;
  if (!user) {
    return (
      <a
        href="/auth/login"
        className="mt-2 block text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        Log in to suggest a formation
      </a>
    );
  }
  return (
    <div className="mt-2">
      {message && (
        <p
          role="status"
          className="mb-2 text-xs font-semibold text-emerald-700"
        >
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        {open ? "Cancel suggestion" : "Suggest a formation"}
      </button>
      {open && (
        <form
          className="mt-3 space-y-3 border-t border-[#071a2b]/15 pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(event.currentTarget);
          }}
        >
          <select
            name="formation"
            defaultValue={
              currentFormation &&
              MANAGER_FORMATIONS.includes(
                currentFormation as (typeof MANAGER_FORMATIONS)[number],
              )
                ? currentFormation
                : ""
            }
            required
            className="block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Choose formation
            </option>
            {MANAGER_FORMATIONS.map((formation) => (
              <option key={formation} value={formation}>
                {formation}
              </option>
            ))}
          </select>
          <textarea
            name="explanation"
            rows={2}
            maxLength={1000}
            placeholder="Why this formation? (optional)"
            className="block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm"
          />
          <button
            disabled={busy}
            className="bg-blue-700 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : "Submit for review"}
          </button>
        </form>
      )}
    </div>
  );
}
