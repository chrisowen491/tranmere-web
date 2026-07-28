"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";

interface AttendanceCorrectionFormProps {
  season: string;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  currentAttendance: number | null;
}

export function AttendanceCorrectionForm({
  season,
  matchDate,
  homeTeam,
  awayTeam,
  currentAttendance,
}: AttendanceCorrectionFormProps) {
  const { user, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function submitCorrection(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch("/api/attendance-corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season,
          matchDate,
          homeTeam,
          awayTeam,
          currentAttendance,
          proposedAttendance: Number(formData.get("proposedAttendance")),
          source: formData.get("source"),
          explanation: formData.get("explanation"),
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "The correction could not be sent.");
      }

      setMessage("Thanks — your correction is now awaiting review.");
      setIsOpen(false);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The correction could not be sent.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <span className="mt-2 block text-xs text-[#071a2b]/45">Loading…</span>
    );
  }

  return (
    <div className="mt-3">
      {message && (
        <p
          role="status"
          className={`mb-3 text-xs font-semibold ${
            isError ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      )}

      {!user ? (
        <a
          href="/auth/login"
          className="text-xs font-bold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
        >
          Log in to suggest a correction
        </a>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="text-left text-xs font-bold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
          >
            {isOpen ? "Cancel correction" : "Suggest a correction"}
          </button>

          {isOpen && (
            <form
              className="mt-4 space-y-4 border-t border-[#071a2b]/15 pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submitCorrection(new FormData(event.currentTarget));
              }}
            >
              <div>
                <label
                  htmlFor="proposedAttendance"
                  className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55"
                >
                  Correct attendance
                </label>
                <input
                  id="proposedAttendance"
                  name="proposedAttendance"
                  type="number"
                  min="1"
                  max="200000"
                  required
                  inputMode="numeric"
                  className="mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2 font-mono text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="source"
                  className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55"
                >
                  Source
                </label>
                <textarea
                  id="source"
                  name="source"
                  required
                  minLength={3}
                  maxLength={1000}
                  rows={3}
                  placeholder="For example: match programme, page 12; newspaper report; or a web link"
                  className="mt-2 block w-full resize-y border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="explanation"
                  className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55"
                >
                  Notes <span className="font-normal">(optional)</span>
                </label>
                <textarea
                  id="explanation"
                  name="explanation"
                  rows={3}
                  maxLength={1000}
                  className="mt-2 block w-full resize-y border border-[#071a2b]/20 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Submit for review"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
