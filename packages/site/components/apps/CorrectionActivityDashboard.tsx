"use client";

import type { CorrectionActivity } from "@/lib/correctionActivity";
import Link from "next/link";
import { useState } from "react";

const statusClass = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

function display(value: unknown) {
  if (value === null || value === undefined || value === "")
    return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function CorrectionActivityDashboard({
  initialActivity,
  initialRecognitionVisible,
}: {
  initialActivity: CorrectionActivity[];
  initialRecognitionVisible: boolean;
}) {
  const [activity, setActivity] = useState(initialActivity);
  const [recognitionVisible, setRecognitionVisible] = useState(
    initialRecognitionVisible,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function withdraw(item: CorrectionActivity) {
    if (!window.confirm("Withdraw this pending correction?")) return;
    setBusyId(item.id);
    setMessage("");
    const response = await fetch("/api/correction-activity", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, kind: item.kind }),
    });
    const body = (await response.json()) as { message?: string };
    if (response.ok) {
      setActivity((items) => items.filter((entry) => entry.id !== item.id));
      setMessage("Correction withdrawn.");
    } else setMessage(body.message || "The correction could not be withdrawn.");
    setBusyId(null);
  }

  async function saveRecognition() {
    setMessage("");
    const response = await fetch("/api/correction-activity", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: recognitionVisible }),
    });
    const body = (await response.json()) as { message?: string };
    setMessage(
      response.ok
        ? "Recognition preference updated."
        : body.message || "The preference could not be saved.",
    );
  }

  return (
    <>
      {message && (
        <p
          role="status"
          className="border border-blue-700/20 bg-blue-50 px-4 py-3 text-sm font-semibold"
        >
          {message}
        </p>
      )}

      <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
          Privacy and recognition
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
          Credit your approved contributions
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
          Recognition is optional. When enabled, your supporter name and
          approved total can appear publicly. Proposal details, pending changes,
          rejections and moderator feedback always remain private.
        </p>
        <label className="mt-6 flex items-start gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={recognitionVisible}
            onChange={(event) => setRecognitionVisible(event.target.checked)}
            className="mt-1 h-4 w-4 accent-blue-700"
          />
          Include me in public contributor recognition
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => void saveRecognition()}
            className="bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-[#071a2b]"
          >
            Save recognition preference
          </button>
          <Link
            href="/contributors"
            className="text-sm font-bold text-blue-700"
          >
            View contributors →
          </Link>
        </div>
      </section>

      <section className="border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="border-b border-[#071a2b]/15 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Your submissions
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
            Correction history
          </h2>
        </div>
        {activity.length ? (
          <div className="divide-y divide-[#071a2b]/10">
            {activity.map((item) => (
              <article key={`${item.kind}-${item.id}`} className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                      {item.label} ·{" "}
                      {new Date(item.submittedAt).toLocaleDateString("en-GB")}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">
                      {item.subject}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] ${statusClass[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
                <dl className="mt-5 grid gap-px border border-[#071a2b]/10 bg-[#071a2b]/10 sm:grid-cols-2">
                  {Object.entries(item.changes).map(([field, value]) => (
                    <div key={field} className="bg-[#fffdf8] p-4">
                      <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                        {field.replace(/([A-Z])/g, " $1")}
                      </dt>
                      <dd className="mt-2 text-sm">
                        <span className="text-[#071a2b]/45">
                          {display(item.current[field])} →{" "}
                        </span>
                        <strong>{display(value)}</strong>
                      </dd>
                    </div>
                  ))}
                </dl>
                {(item.source || item.explanation) && (
                  <div className="mt-5 text-sm leading-6 text-[#071a2b]/65">
                    {item.source && (
                      <p>
                        <strong>Source:</strong> {item.source}
                      </p>
                    )}
                    {item.explanation && (
                      <p className={item.source ? "mt-2" : ""}>
                        <strong>Notes:</strong> {item.explanation}
                      </p>
                    )}
                  </div>
                )}
                {item.reviewNote && (
                  <div className="mt-5 border-l-4 border-blue-700 bg-blue-50 p-4">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">
                      Moderator feedback
                    </p>
                    <p className="mt-2 text-sm leading-6">{item.reviewNote}</p>
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  {item.publicPath && (
                    <Link
                      href={item.publicPath}
                      className="text-sm font-bold text-blue-700"
                    >
                      View updated record →
                    </Link>
                  )}
                  {item.status === "pending" && (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void withdraw(item)}
                      className="border border-red-700 px-4 py-2 text-xs font-bold uppercase text-red-700 disabled:opacity-50"
                    >
                      {busyId === item.id
                        ? "Withdrawing…"
                        : "Withdraw submission"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12">
            <h3 className="font-display text-3xl font-semibold">
              No corrections submitted yet
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#071a2b]/60">
              When you suggest an archive correction, its review status and any
              moderator feedback will appear here.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
