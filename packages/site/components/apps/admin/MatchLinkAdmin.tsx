"use client";
import { MATCH_LINK_TYPES } from "@/lib/matchLinks";
import { useState } from "react";
export function MatchLinkAdmin() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">
        Publish directly
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold">
        Add a match link
      </h2>
      {message && (
        <p role="status" className="mt-4 text-sm font-semibold text-blue-700">
          {message}
        </p>
      )}
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          const response = await fetch("/api/admin/match-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              Object.fromEntries(new FormData(event.currentTarget)),
            ),
          });
          const result = (await response.json()) as { message?: string };
          setMessage(result.message || "Unable to save link.");
          if (response.ok) event.currentTarget.reset();
          setBusy(false);
        }}
      >
        <label className="text-xs font-bold">
          Season
          <input
            required
            name="season"
            pattern="\\d{4}"
            className="mt-2 block w-full border border-[#071a2b]/20 p-3"
          />
        </label>
        <label className="text-xs font-bold">
          Match date
          <input
            required
            name="matchDate"
            type="date"
            className="mt-2 block w-full border border-[#071a2b]/20 p-3"
          />
        </label>
        <label className="text-xs font-bold">
          Title
          <input
            required
            name="label"
            className="mt-2 block w-full border border-[#071a2b]/20 p-3"
          />
        </label>
        <label className="text-xs font-bold">
          URL
          <input
            required
            name="url"
            type="url"
            className="mt-2 block w-full border border-[#071a2b]/20 p-3"
          />
        </label>
        <label className="text-xs font-bold">
          Type
          <select
            name="linkType"
            className="mt-2 block w-full border border-[#071a2b]/20 p-3"
          >
            {MATCH_LINK_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          Publisher
          <input
            name="publisher"
            className="mt-2 block w-full border border-[#071a2b]/20 p-3"
          />
        </label>
        <button
          disabled={busy}
          className="bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[.12em] text-white sm:col-span-2"
        >
          {busy ? "Publishing…" : "Publish link"}
        </button>
      </form>
    </div>
  );
}
