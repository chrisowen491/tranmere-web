"use client";

import { AVATAR_KIT_OPTIONS } from "@tranmere-web/lib/src/avatar-kit-constants";
import { useUser } from "@auth0/nextjs-auth0";
import Image from "next/image";
import { useState } from "react";

export function KitCorrectionForm({
  season,
  matchDate,
  currentKit,
}: {
  season: string;
  matchDate: string;
  currentKit?: string;
}) {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [kit, setKit] = useState(currentKit ?? "");
  const kitPreviewUrl = kit
    ? `/builder/${kit}/simple/ffd3b3/none/000000/fcb98b/transparent/000000`
    : null;

  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMessage(null);
    const data = new FormData(form);
    try {
      const response = await fetch("/api/kit-corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season,
          matchDate,
          proposedKit: data.get("kit"),
          explanation: data.get("explanation"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "Suggestion could not be sent.");
      setMessage("Thanks — your kit suggestion is awaiting review.");
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
  if (!user)
    return (
      <a
        href={`/auth/login?returnTo=${encodeURIComponent(`/match/${season}/${matchDate}`)}`}
        className="mt-2 block text-xs font-bold text-blue-700 underline underline-offset-4"
      >
        Log in to suggest a kit
      </a>
    );

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
        {open ? "Cancel suggestion" : "Suggest a kit"}
      </button>
      {open && (
        <form
          className="mt-3 space-y-3 border-t border-[#071a2b]/15 pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(event.currentTarget);
          }}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-end gap-3">
            <div>
              <label
                className="block text-xs font-bold"
                htmlFor="suggested-kit"
              >
                Kit worn by Rovers
              </label>
              <select
                id="suggested-kit"
                name="kit"
                value={kit}
                onChange={(event) => setKit(event.target.value)}
                required
                className="mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              >
                <option value="" disabled>
                  Choose kit
                </option>
                {AVATAR_KIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6]">
              {kitPreviewUrl ? (
                <Image
                  src={kitPreviewUrl}
                  alt={`Preview of the selected ${AVATAR_KIT_OPTIONS.find((option) => option.value === kit)?.label ?? "Rovers"} kit`}
                  width={160}
                  height={160}
                  unoptimized
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="grid aspect-square place-items-center px-2 text-center font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/45">
                  Choose kit
                </div>
              )}
            </div>
          </div>
          <textarea
            name="explanation"
            rows={2}
            maxLength={1000}
            placeholder="Source or reason for the suggestion (optional)"
            className="block w-full border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
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
