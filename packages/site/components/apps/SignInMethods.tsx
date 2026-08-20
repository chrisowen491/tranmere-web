"use client";

import type { LinkedIdentity } from "@/lib/accountLinking";
import { useState } from "react";

interface LinkConnection {
  connection: string;
  label: string;
}

const providerLabels: Record<string, string> = {
  auth0: "Email and password",
  "google-oauth2": "Google",
  facebook: "Facebook",
  github: "GitHub",
  apple: "Apple",
};

export function SignInMethods({
  identities,
  connections,
  result,
}: {
  identities: LinkedIdentity[];
  connections: LinkConnection[];
  result?: string;
}) {
  const [message, setMessage] = useState(
    result === "success"
      ? "The sign-in method was linked successfully."
      : result === "mismatch"
        ? "Both accounts must use the same verified email address."
        : result === "expired"
          ? "Your original session expired. Please sign in and try again."
          : result === "failed"
            ? "The sign-in method could not be linked."
            : "",
  );
  const [removing, setRemoving] = useState<string | null>(null);

  async function remove(providerSub: string) {
    setRemoving(providerSub);
    const response = await fetch("/api/account-identities", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ providerSub }),
    });
    const body = (await response.json()) as { message?: string };
    setMessage(body.message || "Unable to update sign-in methods.");
    if (response.ok) window.location.reload();
    setRemoving(null);
  }

  return (
    <section className="mt-8 border border-[#071a2b]/15 bg-[#fffdf8] p-6 shadow-[5px_5px_0_rgba(7,26,43,0.08)] sm:p-8">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
        Account security
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em]">
        Sign-in methods
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/65">
        Link another login using the same verified email. You will be asked to
        authenticate with that account before it is connected.
      </p>
      {message && (
        <p className="mt-5 border border-blue-700/20 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
          {message}
        </p>
      )}
      <div className="mt-6 divide-y divide-[#071a2b]/10 border-y border-[#071a2b]/10">
        {identities.map((identity) => (
          <div
            key={identity.providerSub}
            className="flex flex-wrap items-center justify-between gap-4 py-4"
          >
            <div>
              <p className="text-sm font-bold">
                {providerLabels[identity.provider] || identity.provider}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                {identity.isPrimary ? "Primary method" : "Linked method"}
              </p>
            </div>
            {!identity.isPrimary && identities.length > 1 && (
              <button
                type="button"
                disabled={removing === identity.providerSub}
                onClick={() => remove(identity.providerSub)}
                className="border border-rose-700 px-4 py-2 text-xs font-bold text-rose-700 disabled:opacity-50"
              >
                {removing === identity.providerSub ? "Removing…" : "Remove"}
              </button>
            )}
          </div>
        ))}
      </div>
      {connections.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {connections.map((connection) => (
            <a
              key={connection.connection}
              href={`/auth/link/login?connection=${encodeURIComponent(connection.connection)}&returnTo=%2Fprofile`}
              className="bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Link {connection.label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
