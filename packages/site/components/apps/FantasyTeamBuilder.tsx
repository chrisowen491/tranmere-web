"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  CheckIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type FantasyPlayer = {
  name: string;
  picLink: string;
};

type FormationKey = "442" | "433";

type Slot = {
  id: string;
  position: string;
};

const formations: Record<FormationKey, Slot[][]> = {
  "442": [
    [
      { id: "f1", position: "ST" },
      { id: "f2", position: "ST" },
    ],
    [
      { id: "m1", position: "LM" },
      { id: "m2", position: "CM" },
      { id: "m3", position: "CM" },
      { id: "m4", position: "RM" },
    ],
    [
      { id: "d1", position: "LB" },
      { id: "d2", position: "CB" },
      { id: "d3", position: "CB" },
      { id: "d4", position: "RB" },
    ],
    [{ id: "g1", position: "GK" }],
  ],
  "433": [
    [
      { id: "f1", position: "LW" },
      { id: "f2", position: "ST" },
      { id: "f3", position: "RW" },
    ],
    [
      { id: "m1", position: "CM" },
      { id: "m2", position: "CM" },
      { id: "m3", position: "CM" },
    ],
    [
      { id: "d1", position: "LB" },
      { id: "d2", position: "CB" },
      { id: "d3", position: "CB" },
      { id: "d4", position: "RB" },
    ],
    [{ id: "g1", position: "GK" }],
  ],
};

const storageKey = "tranmere-fantasy-xi";

function isFormation(value: string | null): value is FormationKey {
  return value === "442" || value === "433";
}

export function FantasyTeamBuilder({ players }: { players: FantasyPlayer[] }) {
  const [formation, setFormation] = useState<FormationKey>("442");
  const [team, setTeam] = useState<Record<string, FantasyPlayer>>({});
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [query, setQuery] = useState("");
  const [captain, setCaptain] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const assignedNames = useMemo(
    () => new Set(Object.values(team).map((player) => player.name)),
    [team],
  );

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return players
      .filter(
        (player) =>
          !assignedNames.has(player.name) &&
          player.name.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 24);
  }, [assignedNames, players, query]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedFormation = params.get("formation");
    const sharedTeam = params.get("team");
    const sharedCaptain = params.get("captain");

    if (isFormation(sharedFormation)) {
      setFormation(sharedFormation);
    }

    if (sharedTeam) {
      try {
        const names = JSON.parse(decodeURIComponent(sharedTeam)) as Record<
          string,
          string
        >;
        const restoredTeam = Object.fromEntries(
          Object.entries(names).flatMap(([slotId, name]) => {
            const player = players.find((candidate) => candidate.name === name);
            return player ? [[slotId, player]] : [];
          }),
        );
        setTeam(restoredTeam);
        setCaptain(sharedCaptain ?? "");
        setHasLoaded(true);
        return;
      } catch {
        // Fall through to the locally saved team.
      }
    }

    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          formation?: string;
          team?: Record<string, FantasyPlayer>;
          captain?: string;
        };
        const savedFormation = parsed.formation ?? null;
        if (isFormation(savedFormation)) {
          setFormation(savedFormation);
        }
        if (parsed.team) setTeam(parsed.team);
        if (parsed.captain) setCaptain(parsed.captain);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setHasLoaded(true);
  }, [players]);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ formation, team, captain }),
    );
  }, [captain, formation, hasLoaded, team]);

  function chooseFormation(nextFormation: FormationKey) {
    setFormation(nextFormation);
    setTeam({});
    setCaptain("");
    setSelectedSlot(null);
    setShareStatus("");
  }

  function assignPlayer(player: FantasyPlayer) {
    if (!selectedSlot) return;
    setTeam((current) => ({ ...current, [selectedSlot.id]: player }));
    setSelectedSlot(null);
    setQuery("");
    setShareStatus("");
  }

  function removePlayer(slotId: string) {
    const removedPlayer = team[slotId];
    setTeam((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    if (removedPlayer?.name === captain) setCaptain("");
    setShareStatus("");
  }

  function resetTeam() {
    setTeam({});
    setCaptain("");
    setSelectedSlot(null);
    setQuery("");
    setShareStatus("");
  }

  async function shareTeam() {
    const names = Object.fromEntries(
      Object.entries(team).map(([slotId, player]) => [slotId, player.name]),
    );
    const params = new URLSearchParams({
      formation,
      team: encodeURIComponent(JSON.stringify(names)),
    });
    if (captain) params.set("captain", captain);
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", shareUrl);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Link copied");
    } catch {
      setShareStatus("Share link added to the address bar");
    }
  }

  const playerCount = Object.keys(team).length;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-24 sm:px-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:px-12">
      <section aria-label="Fantasy team pitch">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-t border-[#071a2b]/20 pt-6">
          <div>
            <label
              htmlFor="formation"
              className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700"
            >
              Formation
            </label>
            <select
              id="formation"
              value={formation}
              onChange={(event) =>
                chooseFormation(event.target.value as FormationKey)
              }
              className="mt-2 block w-40 border border-[#071a2b]/20 bg-[#fffdf8] px-3 py-2.5 text-sm font-semibold focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="442">4–4–2</option>
              <option value="433">4–3–3</option>
            </select>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-[#071a2b]/45">
              {playerCount} / 11 selected
            </p>
            <div className="mt-2 h-1.5 w-40 overflow-hidden bg-[#071a2b]/10">
              <div
                className="h-full bg-blue-700 transition-all"
                style={{ width: `${(playerCount / 11) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="fantasy-pitch relative min-h-[720px] overflow-hidden border border-[#071a2b]/25 bg-blue-900 px-4 py-7 text-white sm:px-8">
          <div className="pointer-events-none absolute inset-4 border border-white/25" />
          <div className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="relative z-10 flex min-h-[664px] flex-col justify-between">
            {formations[formation].map((line, lineIndex) => (
              <div
                key={`${formation}-${lineIndex}`}
                className="flex min-h-32 items-center justify-around gap-1"
              >
                {line.map((slot) => {
                  const player = team[slot.id];
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <div
                      key={slot.id}
                      className="relative flex w-16 min-w-0 flex-col items-center text-center sm:w-28"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        aria-pressed={isSelected}
                        aria-label={`${slot.position}: ${
                          player ? player.name : "empty position"
                        }`}
                        className={`group relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border transition sm:h-24 sm:w-24 ${
                          isSelected
                            ? "border-blue-200 bg-blue-500 ring-4 ring-blue-200/30"
                            : player
                              ? "border-white/45 bg-[#f4f0e8]"
                              : "border-dashed border-white/40 bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        {player ? (
                          <Image
                            src={player.picLink}
                            alt=""
                            width={112}
                            height={112}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-sm font-bold text-white">
                            {slot.position}
                          </span>
                        )}
                      </button>
                      <span className="mt-2 max-w-full truncate text-xs font-bold">
                        {player?.name ?? "Choose player"}
                      </span>
                      {player && (
                        <button
                          type="button"
                          onClick={() => removePlayer(slot.id)}
                          aria-label={`Remove ${player.name}`}
                          className="absolute -right-1 top-0 grid h-7 w-7 place-items-center rounded-full bg-[#071a2b] text-white ring-1 ring-white/25"
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Player archive
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              {selectedSlot
                ? `Choose ${selectedSlot.position}`
                : "Select a position"}
            </h2>
          </div>
          {selectedSlot && (
            <span className="grid h-9 min-w-9 place-items-center bg-blue-700 px-2 font-mono text-xs font-bold text-white">
              {selectedSlot.position}
            </span>
          )}
        </div>

        <label
          htmlFor="fantasy-player-search"
          className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65"
        >
          Search players
        </label>
        <div className="relative mt-2">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#071a2b]/40" />
          <input
            id="fantasy-player-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Start typing a name"
            className="block w-full border border-[#071a2b]/20 bg-[#f4f0e8] py-3 pl-10 pr-3 text-sm focus:border-blue-700 focus:ring-blue-700"
          />
        </div>

        <div className="mt-4 max-h-80 space-y-1 overflow-y-auto">
          {filteredPlayers.map((player) => (
            <button
              key={player.name}
              type="button"
              onClick={() => assignPlayer(player)}
              disabled={!selectedSlot}
              className="flex w-full items-center gap-3 border-b border-[#071a2b]/10 px-2 py-2.5 text-left transition hover:bg-[#e8e2d6] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Image
                src={player.picLink}
                alt=""
                width={44}
                height={44}
                unoptimized
                className="h-11 w-11 bg-[#e8e2d6] object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {player.name}
              </span>
              {selectedSlot && <CheckIcon className="h-4 w-4 text-blue-700" />}
            </button>
          ))}
          {filteredPlayers.length === 0 && (
            <p className="py-8 text-center text-sm text-[#071a2b]/50">
              No available players match that search.
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-[#071a2b]/15 pt-5">
          <label
            htmlFor="captain"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/65"
          >
            <StarIcon className="h-4 w-4 text-blue-700" />
            Captain
          </label>
          <select
            id="captain"
            value={captain}
            onChange={(event) => setCaptain(event.target.value)}
            disabled={playerCount === 0}
            className="mt-2 block w-full border border-[#071a2b]/20 bg-[#f4f0e8] px-3 py-3 text-sm focus:border-blue-700 focus:ring-blue-700 disabled:opacity-50"
          >
            <option value="">Choose captain</option>
            {Object.values(team).map((player) => (
              <option key={player.name} value={player.name}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={resetTeam}
            disabled={playerCount === 0}
            className="inline-flex items-center justify-center gap-2 border border-[#071a2b]/20 px-3 py-3 text-sm font-bold disabled:opacity-40"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={shareTeam}
            disabled={playerCount === 0}
            className="inline-flex items-center justify-center gap-2 bg-blue-700 px-3 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            <LinkIcon className="h-4 w-4" />
            Share
          </button>
        </div>
        <p
          aria-live="polite"
          className="mt-3 min-h-5 text-center font-mono text-xs text-blue-700"
        >
          {shareStatus}
        </p>
      </aside>
    </div>
  );
}
