"use client";

import Link from "next/link";
import { useState } from "react";
import type { FantasyTeam } from "@/lib/fantasyTeams";

export function FantasyTeamManager({
  initialTeams,
}: {
  initialTeams: FantasyTeam[];
}) {
  const [teams, setTeams] = useState(initialTeams);
  const [status, setStatus] = useState("");

  async function action(
    team: FantasyTeam,
    action: "share" | "revoke" | "delete",
  ) {
    const response = await fetch(`/api/fantasy-teams/${team.id}`, {
      method: action === "delete" ? "DELETE" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: action === "delete" ? undefined : JSON.stringify({ action }),
    });
    const result = (await response.json()) as {
      message?: string;
      shareId?: string;
    };
    if (!response.ok) {
      setStatus(result.message ?? "Unable to update this XI.");
      return;
    }
    if (action === "delete")
      setTeams((current) => current.filter((item) => item.id !== team.id));
    else
      setTeams((current) =>
        current.map((item) =>
          item.id === team.id
            ? {
                ...item,
                isShared: action === "share",
                shareId: result.shareId ?? item.shareId,
              }
            : item,
        ),
      );
    setStatus(result.message ?? "Updated.");
  }

  return (
    <>
      <p
        aria-live="polite"
        className="mb-4 min-h-5 text-sm font-semibold text-blue-700"
      >
        {status}
      </p>
      {teams.length === 0 ? (
        <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-10 text-center">
          <h2 className="font-display text-3xl font-semibold">
            Your tactics board is empty.
          </h2>
          <Link
            href="/fantasy-team"
            className="mt-6 inline-block bg-blue-700 px-5 py-3 text-sm font-bold text-white"
          >
            Create your first XI
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {teams.map((team) => (
            <article
              key={team.id}
              className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 shadow-[5px_5px_0_rgba(7,26,43,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    {team.formation === "442" ? "4–4–2" : "4–3–3"} · {team.kit}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    {team.name}
                  </h2>
                </div>
                <span
                  className={`px-2 py-1 font-mono text-[10px] font-bold uppercase ${team.isShared ? "bg-emerald-600 text-white" : "bg-[#e8e2d6]"}`}
                >
                  {team.isShared ? "Public" : "Private"}
                </span>
              </div>
              {team.rationale && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#071a2b]/65">
                  {team.rationale}
                </p>
              )}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Link
                  href={`/fantasy-team?edit=${team.id}`}
                  className="border border-[#071a2b]/20 px-3 py-2 text-center text-sm font-bold"
                >
                  Edit
                </Link>
                <Link
                  href={`/fantasy-team?duplicate=${team.id}`}
                  className="border border-[#071a2b]/20 px-3 py-2 text-center text-sm font-bold"
                >
                  Duplicate
                </Link>
              </div>
              {team.isShared && team.shareId && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href={`/fantasy-team/shared/${team.shareId}`}
                    className="bg-blue-700 px-3 py-2 text-center text-sm font-bold text-white"
                  >
                    Open share page
                  </Link>
                  <button
                    onClick={() => action(team, "revoke")}
                    className="border border-red-700 px-3 py-2 text-sm font-bold text-red-700"
                  >
                    Revoke sharing
                  </button>
                </div>
              )}
              {!team.isShared && (
                <button
                  onClick={() => action(team, "share")}
                  className="mt-2 w-full bg-blue-700 px-3 py-2 text-sm font-bold text-white"
                >
                  Create public share link
                </button>
              )}
              <button
                onClick={() => action(team, "delete")}
                className="mt-4 text-xs font-bold text-red-700"
              >
                Delete XI
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
