"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { MATCH_LINK_TYPES } from "@/lib/matchLinks";
import { useState } from "react";

export function MatchLinkSuggestionForm({
  season,
  matchDate,
}: {
  season: string;
  matchDate: string;
}) {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMessage(null);
    const data = new FormData(form);
    try {
      const response = await fetch("/api/match-link-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season,
          matchDate,
          label: data.get("label"),
          url: data.get("url"),
          linkType: data.get("linkType"),
          publisher: data.get("publisher"),
          notes: data.get("notes"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "The link could not be sent.");
      form.reset();
      setOpen(false);
      setMessage("Thanks — your link is awaiting review.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "The link could not be sent.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (isLoading) return null;
  if (!user)
    return (
      <a
        href="/auth/login"
        className="text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        Log in to suggest a link
      </a>
    );
  return (
    <div>
      {message && (
        <p role="status" className="mb-3 text-xs font-semibold text-blue-700">
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        {open ? "Cancel" : "Suggest an external link"}
      </button>
      {open && (
        <form
          className="mt-4 grid gap-3 border-t border-[#071a2b]/15 pt-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(event.currentTarget);
          }}
        >
          <label className="text-[10px] font-bold uppercase tracking-[.12em] text-[#071a2b]/55">
            Link title
            <input
              required
              name="label"
              maxLength={200}
              className="mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-[10px] font-bold uppercase tracking-[.12em] text-[#071a2b]/55">
            URL
            <input
              required
              type="url"
              name="url"
              className="mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-[10px] font-bold uppercase tracking-[.12em] text-[#071a2b]/55">
            Type
            <select
              name="linkType"
              className="mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm"
            >
              {MATCH_LINK_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-[.12em] text-[#071a2b]/55">
            Publisher <span className="font-normal">(optional)</span>
            <input
              name="publisher"
              maxLength={100}
              className="mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="sm:col-span-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#071a2b]/55">
            Notes <span className="font-normal">(optional)</span>
            <textarea
              name="notes"
              maxLength={1000}
              rows={2}
              className="mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm"
            />
          </label>
          <button
            disabled={busy}
            className="bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[.12em] text-white disabled:opacity-60 sm:col-span-2"
          >
            {busy ? "Sending…" : "Submit for review"}
          </button>
        </form>
      )}
    </div>
  );
}
