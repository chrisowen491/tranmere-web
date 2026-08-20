"use client";
import type { GoalSubmission } from "@/lib/goalSubmissions";
import { editableGoalLabels, type EditableGoal } from "@/lib/goalCorrections";
import Link from "next/link";
import { useState } from "react";

export function GoalSubmissionReview({
  initialSubmissions,
}: {
  initialSubmissions: GoalSubmission[];
}) {
  const [items, setItems] = useState(initialSubmissions);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  async function review(
    item: GoalSubmission,
    status: "approved" | "rejected",
    form: HTMLFormElement,
  ) {
    setBusy(item.id);
    setMessage("");
    const response = await fetch("/api/goal-submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        status,
        reviewNote: new FormData(form).get("reviewNote"),
      }),
    });
    const body = (await response.json()) as { message?: string };
    if (response.ok) {
      setItems((values) => values.filter((value) => value.id !== item.id));
      setMessage(`Goal submission ${status}.`);
    } else setMessage(body.message || "The review could not be saved.");
    setBusy(null);
  }
  if (!items.length) return null;
  return (
    <div className="mb-10 space-y-5">
      <h2 className="font-display text-3xl font-semibold">
        Missing goal submissions
      </h2>
      {message && (
        <p role="status" className="bg-blue-50 p-4 text-sm font-semibold">
          {message}
        </p>
      )}
      {items.map((item) => (
        <article
          key={item.id}
          className="border border-[#071a2b]/15 bg-[#fffdf8]"
        >
          <header className="bg-[#071a2b] p-6 text-white">
            <p className="font-mono text-xs uppercase text-blue-300">
              {item.season} · {item.matchDate} · New goal
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold">
              {item.goal.scorer} v {item.opposition}
            </h3>
            <Link
              href={`/match/${item.season}/${item.matchDate}`}
              className="mt-3 inline-block text-xs font-bold text-blue-200 underline"
            >
              Open match page ↗
            </Link>
          </header>
          <div className="p-6">
            <dl className="grid gap-px border border-[#071a2b]/10 bg-[#071a2b]/10 sm:grid-cols-3">
              {Object.entries(item.goal)
                .filter(([, value]) => value)
                .map(([field, value]) => (
                  <div key={field} className="bg-[#fffdf8] p-4">
                    <dt className="font-mono text-[9px] uppercase text-[#071a2b]/45">
                      {editableGoalLabels[field as keyof EditableGoal]}
                    </dt>
                    <dd className="mt-2 text-sm font-semibold">{value}</dd>
                  </div>
                ))}
            </dl>
            <p className="mt-5 text-sm">
              <strong>Source:</strong> {item.source || "No source supplied."}
            </p>
            {item.explanation && (
              <p className="mt-2 text-sm">
                <strong>Notes:</strong> {item.explanation}
              </p>
            )}
            <form
              className="mt-5 border-t border-[#071a2b]/10 pt-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="font-mono text-[10px] font-bold uppercase text-[#071a2b]/45">
                Moderator note
              </label>
              <textarea
                name="reviewNote"
                rows={2}
                maxLength={1000}
                className="mt-2 block w-full border border-[#071a2b]/20 p-3"
              />
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={busy === item.id}
                  onClick={(event) =>
                    void review(item, "approved", event.currentTarget.form!)
                  }
                  className="bg-emerald-700 px-4 py-2 text-xs font-bold uppercase text-white"
                >
                  Approve &amp; publish
                </button>
                <button
                  type="button"
                  disabled={busy === item.id}
                  onClick={(event) =>
                    void review(item, "rejected", event.currentTarget.form!)
                  }
                  className="border border-red-700 px-4 py-2 text-xs font-bold uppercase text-red-700"
                >
                  Reject
                </button>
              </div>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
