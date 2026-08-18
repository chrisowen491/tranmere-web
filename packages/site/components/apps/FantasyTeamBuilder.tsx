"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowPathIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AVATAR_KIT_OPTIONS } from "@tranmere-web/lib/src/avatar-kit-constants";
import { replaceSeasonsKit } from "@tranmere-web/lib/src/apiFunctions";
import {
  FANTASY_FORMATIONS,
  type FantasyFormation,
  type FantasyTeam,
} from "@/lib/fantasyTeams";

export type FantasyPlayer = {
  id: string;
  name: string;
  picLink: string;
  missing?: boolean;
};
type Slot = { id: string; position: string };

type Props = {
  players: FantasyPlayer[];
  canSave?: boolean;
  initialTeam?: FantasyTeam | null;
  duplicate?: boolean;
};

export function FantasyTeamBuilder({
  players,
  canSave = false,
  initialTeam,
  duplicate = false,
}: Props) {
  const initialPlayers = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );
  const [formation, setFormation] = useState<FantasyFormation>(
    initialTeam?.formation ?? "442",
  );
  const [team, setTeam] = useState<Record<string, FantasyPlayer>>(() =>
    Object.fromEntries(
      (initialTeam?.assignments ?? []).map((assignment) => [
        assignment.slotId,
        initialPlayers.get(assignment.playerId) ?? {
          id: assignment.playerId,
          name: assignment.playerName,
          picLink: "/assets/images/square_v1.png",
          missing: true,
        },
      ]),
    ),
  );
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [query, setQuery] = useState("");
  const [captain, setCaptain] = useState(initialTeam?.captainPlayerId ?? "");
  const [kit, setKit] = useState(initialTeam?.kit ?? "2026");
  const [teamName, setTeamName] = useState(
    duplicate && initialTeam
      ? `Copy of ${initialTeam.name}`
      : (initialTeam?.name ?? ""),
  );
  const [rationale, setRationale] = useState(initialTeam?.rationale ?? "");
  const [editingId, setEditingId] = useState(
    duplicate ? null : (initialTeam?.id ?? null),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const assignedIds = useMemo(
    () => new Set(Object.values(team).map((player) => player.id)),
    [team],
  );
  const filteredPlayers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return players
      .filter(
        (player) =>
          !assignedIds.has(player.id) &&
          player.name.toLowerCase().includes(needle),
      )
      .slice(0, 30);
  }, [assignedIds, players, query]);

  function chooseFormation(next: FantasyFormation) {
    setFormation(next);
    setTeam({});
    setCaptain("");
    setSelectedSlot(null);
    setStatus("");
  }
  function assignPlayer(player: FantasyPlayer) {
    if (!selectedSlot) return;
    setTeam((current) => ({ ...current, [selectedSlot.id]: player }));
    setSelectedSlot(null);
    setQuery("");
    setStatus("");
  }
  function removePlayer(slotId: string) {
    const player = team[slotId];
    setTeam((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    if (player?.id === captain) setCaptain("");
  }
  function resetTeam() {
    setTeam({});
    setCaptain("");
    setSelectedSlot(null);
    setStatus("");
  }

  async function saveTeam() {
    setSaving(true);
    setStatus("");
    const slots = new Map(
      FANTASY_FORMATIONS[formation]
        .flat()
        .map((slot) => [slot.id, slot.position]),
    );
    const assignments = Object.entries(team).map(([slotId, player]) => ({
      slotId,
      position: slots.get(slotId) ?? "",
      playerId: player.id,
      playerName: player.name,
    }));
    try {
      const response = await fetch(
        editingId ? `/api/fantasy-teams/${editingId}` : "/api/fantasy-teams",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: teamName,
            rationale,
            formation,
            kit,
            captainPlayerId: captain || null,
            assignments,
          }),
        },
      );
      const result = (await response.json()) as {
        id?: string;
        message?: string;
      };
      if (!response.ok)
        throw new Error(result.message ?? "Unable to save this XI.");
      if (result.id) setEditingId(result.id);
      setStatus(result.message ?? "Fantasy XI saved.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to save this XI.",
      );
    } finally {
      setSaving(false);
    }
  }

  const playerCount = Object.keys(team).length;
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-24 sm:px-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:px-12">
      <section aria-label="Fantasy team pitch">
        <div className="mb-5 grid gap-4 border-t border-[#071a2b]/20 pt-6 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Formation
            <select
              value={formation}
              onChange={(event) =>
                chooseFormation(event.target.value as FantasyFormation)
              }
              className="mt-2 block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-3 py-2.5 text-sm font-semibold"
            >
              <option value="442">4–4–2</option>
              <option value="433">4–3–3</option>
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Kit
            <select
              value={kit}
              onChange={(event) => setKit(event.target.value)}
              className="mt-2 block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-3 py-2.5 text-sm font-semibold"
            >
              {AVATAR_KIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="fantasy-pitch relative min-h-[720px] overflow-hidden border border-[#071a2b]/25 bg-blue-900 px-4 py-7 text-white sm:px-8">
          <div className="pointer-events-none absolute inset-4 border border-white/25" />
          <div className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="relative z-10 flex min-h-[664px] flex-col justify-between">
            {FANTASY_FORMATIONS[formation].map((line, index) => (
              <div
                key={index}
                className="flex min-h-32 items-center justify-around gap-1"
              >
                {line.map((slot) => {
                  const player = team[slot.id];
                  return (
                    <div
                      key={slot.id}
                      className="relative flex w-16 min-w-0 flex-col items-center text-center sm:w-28"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`grid h-16 w-16 place-items-center overflow-hidden rounded-full border sm:h-24 sm:w-24 ${selectedSlot?.id === slot.id ? "border-blue-200 bg-blue-500 ring-4 ring-blue-200/30" : player ? "border-white/45 bg-[#f4f0e8]" : "border-dashed border-white/40 bg-white/10"}`}
                      >
                        {player ? (
                          <Image
                            src={replaceSeasonsKit(player.picLink, kit)}
                            alt=""
                            width={112}
                            height={112}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-sm font-bold">
                            {slot.position}
                          </span>
                        )}
                      </button>
                      <span className="mt-2 max-w-full truncate text-xs font-bold">
                        {player?.name ?? "Choose player"}
                      </span>
                      {player?.missing && (
                        <span className="mt-1 bg-amber-300 px-1 font-mono text-[9px] text-[#071a2b]">
                          Archive record missing
                        </span>
                      )}
                      {player && (
                        <button
                          type="button"
                          onClick={() => removePlayer(slot.id)}
                          aria-label={`Remove ${player.name}`}
                          className="absolute -right-1 top-0 grid h-7 w-7 place-items-center rounded-full bg-[#071a2b] text-white"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-5 lg:sticky lg:top-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Player archive
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">
          {selectedSlot
            ? `Choose ${selectedSlot.position}`
            : "Select a position"}
        </h2>
        <div className="relative mt-5">
          <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-4 w-4 text-[#071a2b]/40" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search players"
            className="block w-full border border-[#071a2b]/20 bg-[#f4f0e8] py-3 pl-10 pr-3 text-sm"
          />
        </div>
        <div className="mt-4 max-h-72 overflow-y-auto">
          {filteredPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => assignPlayer(player)}
              disabled={!selectedSlot}
              className="flex w-full items-center gap-3 border-b border-[#071a2b]/10 px-2 py-2 text-left disabled:opacity-40"
            >
              <Image
                src={replaceSeasonsKit(player.picLink, kit)}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {player.name}
              </span>
              {selectedSlot && <CheckIcon className="h-4 w-4 text-blue-700" />}
            </button>
          ))}
        </div>
        <label className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65">
          <StarIcon className="h-4 w-4" />
          Captain
        </label>
        <select
          value={captain}
          onChange={(event) => setCaptain(event.target.value)}
          className="mt-2 block w-full border border-[#071a2b]/20 bg-[#f4f0e8] px-3 py-3 text-sm"
        >
          <option value="">Choose captain</option>
          {Object.values(team).map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        {canSave ? (
          <div className="mt-6 border-t border-[#071a2b]/15 pt-5">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65">
              XI name
              <input
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                maxLength={80}
                placeholder="Promotion heroes"
                className="mt-2 block w-full border border-[#071a2b]/20 bg-[#f4f0e8] px-3 py-3 text-sm normal-case"
              />
            </label>
            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65">
              Why this XI?
              <textarea
                value={rationale}
                onChange={(event) => setRationale(event.target.value)}
                maxLength={600}
                rows={4}
                className="mt-2 block w-full border border-[#071a2b]/20 bg-[#f4f0e8] px-3 py-3 text-sm font-normal normal-case"
              />
            </label>
            <button
              type="button"
              onClick={saveTeam}
              disabled={saving || playerCount !== 11}
              className="mt-4 w-full bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {saving
                ? "Saving…"
                : editingId
                  ? "Update saved XI"
                  : "Save this XI"}
            </button>
            <Link
              href="/profile/fantasy-teams"
              className="mt-3 block text-center text-sm font-bold text-blue-700"
            >
              Manage saved XIs →
            </Link>
          </div>
        ) : (
          <p className="mt-6 border-t border-[#071a2b]/15 pt-5 text-sm leading-6 text-[#071a2b]/60">
            <Link
              href="/auth/login?returnTo=%2Ffantasy-team"
              className="font-bold text-blue-700"
            >
              Log in
            </Link>{" "}
            to name, save and share multiple XIs.
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={resetTeam}
            className="inline-flex items-center justify-center gap-2 border border-[#071a2b]/20 px-3 py-3 text-sm font-bold"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Reset
          </button>
          <div className="grid place-items-center bg-[#071a2b] px-2 font-mono text-xs text-white">
            {playerCount} / 11
          </div>
        </div>
        <p
          aria-live="polite"
          className="mt-3 min-h-5 text-center text-xs font-semibold text-blue-700"
        >
          {status}
        </p>
      </aside>
    </div>
  );
}
