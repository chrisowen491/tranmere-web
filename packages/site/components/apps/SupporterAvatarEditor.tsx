"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function SupporterAvatarEditor({
  initialAvatarUrl,
}: {
  initialAvatarUrl: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "");
  const [savedAvatarUrl, setSavedAvatarUrl] = useState(initialAvatarUrl || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      const result = (await response.json()) as {
        avatarUrl?: string | null;
        message?: string;
      };
      if (!response.ok)
        throw new Error(result.message || "Unable to save avatar.");
      const saved = result.avatarUrl || "";
      setAvatarUrl(saved);
      setSavedAvatarUrl(saved);
      setMessage(
        saved ? "Your avatar has been saved." : "Your avatar was removed.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save avatar.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 border border-[#071a2b]/15 bg-[#fffdf8] shadow-[5px_5px_0_rgba(7,26,43,0.08)]">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="flex min-h-56 items-center justify-center border-b border-[#071a2b]/15 bg-[#e8e2d6] p-8 md:border-r md:border-b-0">
          {savedAvatarUrl ? (
            <div className="h-36 w-36 overflow-hidden border border-[#071a2b]/20 bg-white">
              <Image
                src={savedAvatarUrl}
                alt="Your supporter avatar"
                width={320}
                height={320}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <UserCircleIcon className="h-28 w-28 text-blue-700" aria-hidden />
          )}
        </div>
        <form onSubmit={save} className="p-7 sm:p-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
            Supporter identity
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
            Your avatar
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/65">
            Create a Rovers avatar, then paste its finished builder URL here.
            You can change or remove it whenever you like.
          </p>
          <Link
            href="/players/avatar-builder"
            className="mt-5 inline-flex text-sm font-bold text-blue-700 hover:underline"
          >
            Open the Avatar Builder{" "}
            <span className="ml-2" aria-hidden>
              →
            </span>
          </Link>
          <label
            htmlFor="supporter-avatar-url"
            className="mt-7 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/55"
          >
            Finished avatar URL
          </label>
          <input
            id="supporter-avatar-url"
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://www.tranmere-web.com/builder/..."
            className="mt-2 w-full border border-[#071a2b]/25 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
          />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071a2b] disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save avatar"}
            </button>
            {savedAvatarUrl && (
              <button
                type="button"
                disabled={saving}
                onClick={() => setAvatarUrl("")}
                className="border border-[#071a2b]/20 px-5 py-3 text-sm font-bold hover:bg-[#e8e2d6]"
              >
                Clear field
              </button>
            )}
            {message && (
              <p
                className="text-sm font-semibold text-[#071a2b]/70"
                role="status"
              >
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
