"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSupporterDataControl() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function remove() {
    setDeleting(true);
    const response = await fetch("/api/profile", { method: "DELETE" });
    if (response.ok) {
      router.push("/auth/logout");
      return;
    }
    const body = (await response.json()) as { message?: string };
    setMessage(body.message || "Unable to remove your supporter data.");
    setDeleting(false);
  }

  return (
    <section className="mt-12 border-t border-[#071a2b]/15 pt-8">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
        Remove supporter data
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
        This permanently deletes your Rovers passport, programme collection and
        Tranmere-Web profile data. Your external Auth0 login may still exist.
      </p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-5 border border-rose-700 px-5 py-3 text-sm font-bold text-rose-700"
        >
          Remove my supporter data
        </button>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={() => void remove()}
            className="bg-rose-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {deleting ? "Removing…" : "Yes, permanently remove it"}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => setConfirming(false)}
            className="px-5 py-3 text-sm font-bold"
          >
            Cancel
          </button>
        </div>
      )}
      {message && (
        <p className="mt-3 text-sm font-semibold text-rose-700">{message}</p>
      )}
    </section>
  );
}
