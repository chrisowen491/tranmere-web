"use client";

import type { GameRow } from "@tranmere-web/lib/src/d1-types";
import { AVATAR_KIT_OPTIONS } from "@tranmere-web/lib/src/avatar-kit-constants";
import { MATCH_COMPETITIONS } from "@tranmere-web/lib/src/competition-constants";
import { MANAGER_FORMATIONS } from "@tranmere-web/lib/src/manager-constants";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";

type GameForm = {
  [K in keyof GameRow]: GameRow[K];
};

const blankGame = (season: number): GameForm => ({
  id: "",
  season,
  match_date: "",
  competition: "League",
  round: null,
  home_team: "Tranmere Rovers",
  away_team: "",
  opposition: "",
  venue: "Prenton Park",
  attendance: null,
  full_time_score: "",
  home_goals: null,
  away_goals: null,
  division: null,
  tier: null,
  leg: null,
  tie: null,
  neutral: null,
  after_extra_time: null,
  penalties: null,
  programme_path: null,
  formation: null,
  kit: null,
  referee: null,
  ticket: null,
});

const optionalFields: Array<{ key: keyof GameForm; label: string }> = [
  { key: "home_goals", label: "Home scorers" },
  { key: "away_goals", label: "Away scorers" },
  { key: "division", label: "Division" },
  { key: "tier", label: "Tier" },
  { key: "leg", label: "Leg" },
  { key: "tie", label: "Tie" },
  { key: "neutral", label: "Neutral venue" },
  { key: "after_extra_time", label: "After extra time" },
  { key: "penalties", label: "Penalties" },
  { key: "programme_path", label: "Programme path" },
  { key: "referee", label: "Referee" },
  { key: "ticket", label: "Ticket" },
];

function payload(game: GameForm) {
  return {
    id: game.id || undefined,
    season: game.season,
    matchDate: game.match_date,
    competition: game.competition,
    round: game.round,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    opposition: game.opposition,
    venue: game.venue,
    attendance: game.attendance,
    fullTimeScore: game.full_time_score,
    homeGoals: game.home_goals,
    awayGoals: game.away_goals,
    division: game.division,
    tier: game.tier,
    leg: game.leg,
    tie: game.tie,
    neutral: game.neutral,
    afterExtraTime: game.after_extra_time,
    penalties: game.penalties,
    programmePath: game.programme_path,
    formation: game.formation,
    kit: game.kit,
    referee: game.referee,
    ticket: game.ticket,
  };
}

export function GameAdmin({
  games: initialGames,
  seasons,
  selectedSeason,
}: {
  games: GameRow[];
  seasons: number[];
  selectedSeason: number;
}) {
  const router = useRouter();
  const [games, setGames] = useState(initialGames);
  const [editing, setEditing] = useState<GameForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function changeField(key: keyof GameForm, value: string) {
    setEditing((game) => {
      if (!game) return game;
      if (key === "season") return { ...game, season: Number(value) };
      if (key === "attendance") {
        return { ...game, attendance: value === "" ? null : Number(value) };
      }
      return { ...game, [key]: value || null } as GameForm;
    });
  }

  function closeEditor() {
    setEditing(null);
    setMessage(null);
    setIsError(false);
  }

  async function saveGame() {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const isNew = !editing.id;

    try {
      const response = await fetch("/api/admin/games", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(editing)),
      });
      const result = (await response.json()) as {
        message?: string;
        id?: string;
      };
      if (!response.ok || !result.id) {
        throw new Error(result.message || "The match could not be saved.");
      }

      const saved = { ...editing, id: result.id };
      setGames((records) =>
        isNew
          ? [...records, saved].sort((a, b) =>
              a.match_date.localeCompare(b.match_date),
            )
          : records.map((record) => (record.id === saved.id ? saved : record)),
      );
      setEditing(saved);
      setMessage(isNew ? "Match added to this season." : "Match updated.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The match could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <form
          action="/admin/games"
          className="border-b border-[#071a2b]/15 pb-6"
        >
          <label htmlFor="game-season" className={labelClass}>
            Season
          </label>
          <select
            id="game-season"
            name="season"
            value={selectedSeason}
            onChange={(event) =>
              router.push(`/admin/games?season=${event.target.value}`)
            }
            className={inputClass}
          >
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}/{String(season + 1).slice(-2)}
              </option>
            ))}
          </select>
          <p className="mt-3 text-sm leading-6 text-[#071a2b]/55">
            Showing all {games.length} records for this campaign.
          </p>
        </form>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(blankGame(selectedSeason))}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800"
          >
            <PlusIcon className="h-4 w-4" />
            Add match
          </button>
        ) : (
          <div className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  {editing.id ? "Edit match" : "New match"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  {editing.home_team || "Home team"} v{" "}
                  {editing.away_team || "Away team"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="text-xs font-bold text-blue-700 underline underline-offset-4"
              >
                Close
              </button>
            </div>

            {message && (
              <p
                className={`mt-4 text-sm font-semibold ${isError ? "text-red-700" : "text-emerald-700"}`}
              >
                {message}
              </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Season">
                <select
                  value={editing.season}
                  onChange={(event) =>
                    changeField("season", event.target.value)
                  }
                  className={inputClass}
                >
                  {seasons.map((season) => (
                    <option key={season} value={season}>
                      {season}/{String(season + 1).slice(-2)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={editing.match_date}
                  onChange={(event) =>
                    changeField("match_date", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Competition">
                <select
                  value={editing.competition}
                  onChange={(event) =>
                    changeField("competition", event.target.value)
                  }
                  className={inputClass}
                >
                  {MATCH_COMPETITIONS.map((competition) => (
                    <option key={competition} value={competition}>
                      {competition}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Round">
                <input
                  value={editing.round ?? ""}
                  onChange={(event) => changeField("round", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Home team">
                <input
                  value={editing.home_team}
                  onChange={(event) =>
                    changeField("home_team", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Away team">
                <input
                  value={editing.away_team}
                  onChange={(event) =>
                    changeField("away_team", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Opposition">
                <input
                  value={editing.opposition}
                  onChange={(event) =>
                    changeField("opposition", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Venue">
                <input
                  value={editing.venue}
                  onChange={(event) => changeField("venue", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Full-time score">
                <input
                  value={editing.full_time_score}
                  onChange={(event) =>
                    changeField("full_time_score", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Attendance">
                <input
                  type="number"
                  min="0"
                  value={editing.attendance ?? ""}
                  onChange={(event) =>
                    changeField("attendance", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Formation">
                <select
                  value={editing.formation ?? ""}
                  onChange={(event) =>
                    changeField("formation", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Not recorded</option>
                  {MANAGER_FORMATIONS.map((formation) => (
                    <option key={formation} value={formation}>
                      {formation}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Kit">
                <select
                  value={editing.kit ?? ""}
                  onChange={(event) => changeField("kit", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Not recorded</option>
                  {AVATAR_KIT_OPTIONS.map((kit) => (
                    <option key={kit.value} value={kit.value}>
                      {kit.label}
                    </option>
                  ))}
                </select>
              </Field>
              {optionalFields.map(({ key, label }) => (
                <Field key={key} label={label}>
                  <input
                    value={(editing[key] as string | null) ?? ""}
                    onChange={(event) => changeField(key, event.target.value)}
                    className={inputClass}
                  />
                </Field>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void saveGame()}
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {editing.id ? (
                <PencilSquareIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              {saving ? "Saving…" : editing.id ? "Save match" : "Add match"}
            </button>
          </div>
        )}
      </aside>

      <section className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Published fixtures
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {selectedSeason}/{String(selectedSeason + 1).slice(-2)} match list
        </h2>
        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-3 py-4">Opposition</th>
                <th className="px-4 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-[#f4f0e8]">
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">
                    {game.match_date}
                  </td>
                  <td className="px-3 py-4 font-semibold">
                    {game.opposition}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(game);
                        setMessage(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-blue-700 underline underline-offset-4"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={labelClass}>
      {label}
      {children}
    </label>
  );
}
