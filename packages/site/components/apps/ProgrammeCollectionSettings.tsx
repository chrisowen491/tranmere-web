"use client";

import { useState } from "react";
import Link from "next/link";

export function ProgrammeCollectionSettings({
  initialVisible,
  initialPublicId,
}: {
  initialVisible: boolean;
  initialPublicId: string | null;
}) {
  const [visible, setVisible] = useState(initialVisible);
  const [publicId, setPublicId] = useState(initialPublicId);
  const [message, setMessage] = useState("");

  async function save() {
    const response = await fetch("/api/programme-collection/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible }),
    });
    const body = (await response.json()) as {
      publicId?: string;
      message?: string;
    };
    if (response.ok) {
      setPublicId(body.publicId || null);
      setMessage("Sharing preferences updated.");
    } else setMessage(body.message || "Unable to save sharing preferences.");
  }

  return (
    <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
        Privacy and sharing
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
        Public wanted and trade list
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
        Your collection and notes remain private. If enabled, only programmes
        marked wanted or available to trade are shown publicly.
      </p>
      <div className="mt-6 grid gap-4">
        <label className="flex items-start gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={visible}
            onChange={(event) => setVisible(event.target.checked)}
            className="mt-1 h-4 w-4 accent-blue-700"
          />
          Publish my wanted and trade list using an anonymous collector link
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void save()}
          className="bg-[#1557ff] px-5 py-3 text-sm font-bold text-white hover:bg-[#071a2b]"
        >
          Save sharing preferences
        </button>
        {visible && publicId && (
          <a
            href={`/programme-collections/${publicId}`}
            className="text-sm font-bold text-blue-700"
          >
            Open public list →
          </a>
        )}
        <Link
          href="/programme-collections"
          className="text-sm font-bold text-blue-700"
        >
          Browse collectors →
        </Link>
      </div>
      {message && <p className="mt-4 text-sm font-semibold">{message}</p>}
    </section>
  );
}
