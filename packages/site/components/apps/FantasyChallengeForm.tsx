"use client";
import type { FantasyTeam } from "@/lib/fantasyTeams";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FantasyChallengeForm({
  teams,
  opponentName,
  opponentShareId,
}: {
  teams: FantasyTeam[];
  opponentName: string;
  opponentShareId: string;
}) {
  const router = useRouter();
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("Selecting five archive matches…");
    const response = await fetch("/api/fantasy-challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengerTeamId: teamId, opponentShareId }),
    });
    const result = (await response.json()) as {
      href?: string;
      message?: string;
    };
    if (response.ok && result.href) router.push(result.href);
    else {
      setStatus(result.message ?? "The challenge could not be created.");
      setLoading(false);
    }
  }
  if (!teams.length)
    return (
      <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-8">
        <h2 className="font-display text-3xl font-semibold">
          Build your XI first
        </h2>
        <p className="mt-3 text-[#071a2b]/60">
          You need a saved, complete Fantasy XI before challenging{" "}
          {opponentName}.
        </p>
        <a
          href="/fantasy-team"
          className="mt-6 inline-block bg-blue-700 px-5 py-3 text-sm font-bold text-white"
        >
          Build a Fantasy XI
        </a>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8"
    >
      <label className="block text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
        Your challenger
        <select
          value={teamId}
          onChange={(event) => setTeamId(event.target.value)}
          className="mt-3 block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-base font-semibold"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} · {team.formation === "442" ? "4–4–2" : "4–3–3"}
            </option>
          ))}
        </select>
      </label>
      <div className="my-7 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <p className="font-display text-2xl font-semibold">
          {teams.find((team) => team.id === teamId)?.name}
        </p>
        <span className="font-mono text-xs font-bold text-blue-700">V</span>
        <p className="text-right font-display text-2xl font-semibold">
          {opponentName}
        </p>
      </div>
      <button
        disabled={loading}
        className="w-full bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? "Drawing the fixtures…" : "Play the challenge"}
      </button>
      <p aria-live="polite" className="mt-4 min-h-5 text-sm text-[#071a2b]/60">
        {status}
      </p>
    </form>
  );
}
