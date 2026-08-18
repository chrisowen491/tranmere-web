"use client";

import Link from "next/link";
import { useState } from "react";

export function MatchAttendanceControl({
  gameId,
  initialAttended,
}: {
  gameId: string;
  initialAttended: boolean;
}) {
  const [attended, setAttended] = useState(initialAttended);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function update() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/match-attendance", {
      method: attended ? "DELETE" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    const body = (await response.json()) as { message?: string };
    if (response.ok) {
      setAttended(!attended);
      setMessage(
        attended
          ? "Removed from your Rovers passport."
          : "Added to your Rovers passport.",
      );
    } else {
      setMessage(body.message || "Unable to update your Rovers passport.");
    }
    setSaving(false);
  }

  return (
    <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 shadow-[5px_5px_0_rgba(7,26,43,0.08)] sm:p-8">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
        Your Rovers passport
      </p>
      <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.04em]">
            {attended ? "You were there" : "Did you attend this match?"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
            Your attendance history is private and is only visible in your
            supporter passport.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void update()}
          disabled={saving}
          className={`px-5 py-3 text-sm font-bold transition disabled:opacity-50 ${
            attended
              ? "border border-[#071a2b]/20 hover:bg-[#e8e2d6]"
              : "bg-[#1557ff] text-white hover:bg-[#071a2b]"
          }`}
        >
          {saving
            ? "Saving…"
            : attended
              ? "Remove from passport"
              : "Mark as attended"}
        </button>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link
          href="/profile/passport"
          className="text-sm font-bold text-blue-700"
        >
          Open your Rovers passport →
        </Link>
        {message && <p className="text-sm font-semibold">{message}</p>}
      </div>
    </section>
  );
}
