"use client";

import type { PlayerRecord } from "@/lib/players";
import {
  CheckCircleIcon,
  IdentificationIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PLAYER_POSITIONS } from "@tranmere-web/lib/src/player-constants";
import Image from "next/image";
import { useMemo, useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";
function newPlayer(): PlayerRecord {
  return {
    id: "",
    name: "",
    dateOfBirth: null,
    biographyMarkdown: null,
    picLink: null,
    foot: null,
    height: null,
    placeOfBirth: null,
    position: null,
    secondaryPosition: null,
    links: [],
  };
}

function completeness(player: PlayerRecord) {
  return [
    player.dateOfBirth,
    player.biographyMarkdown,
    player.picLink,
    player.foot,
    player.height,
    player.placeOfBirth,
    player.position,
  ].filter(Boolean).length;
}

export function PlayerAdmin({
  initialPlayers,
}: {
  initialPlayers: PlayerRecord[];
}) {
  const [players, setPlayers] = useState(initialPlayers);
  const [editing, setEditing] = useState<PlayerRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const nameCounts = useMemo(() => {
    const counts = new Map<string, number>();
    players.forEach((player) =>
      counts.set(player.name, (counts.get(player.name) || 0) + 1),
    );
    return counts;
  }, [players]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return players.filter(
      (player) =>
        (positionFilter === "all" ||
          player.position === positionFilter ||
          player.secondaryPosition === positionFilter) &&
        (!query ||
          [
            player.name,
            player.placeOfBirth || "",
            player.dateOfBirth || "",
            player.id,
          ].some((value) => value.toLowerCase().includes(query))),
    );
  }, [players, positionFilter, search]);

  async function savePlayer(form: HTMLFormElement) {
    if (!editing) return;
    setSaving(true);
    setMessage("");
    setIsError(false);
    const data = new FormData(form);

    try {
      const response = await fetch("/api/admin/players", {
        method: isCreating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(!isCreating && { id: editing.id }),
          name: data.get("name"),
          dateOfBirth: data.get("dateOfBirth"),
          biographyMarkdown: data.get("biographyMarkdown"),
          picLink: data.get("picLink"),
          foot: data.get("foot"),
          height: data.get("height"),
          placeOfBirth: data.get("placeOfBirth"),
          position: data.get("position"),
          secondaryPosition: data.get("secondaryPosition"),
          links: String(data.get("links") || "")
            .split(/\r?\n/)
            .map((link) => link.trim())
            .filter(Boolean),
        }),
      });
      const result = (await response.json()) as {
        player?: PlayerRecord;
        message?: string;
      };
      if (!response.ok || !result.player) {
        throw new Error(result.message || "The player could not be saved.");
      }
      setPlayers((records) => {
        const next = isCreating
          ? [...records, result.player!]
          : records.map((record) =>
              record.id === result.player!.id ? result.player! : record,
            );
        return next.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        );
      });
      setEditing(result.player);
      setIsCreating(false);
      setMessage(
        `${result.player.name} was ${isCreating ? "created" : "updated"} in D1.`,
      );
    } catch (reason) {
      setIsError(true);
      setMessage(
        reason instanceof Error
          ? reason.message
          : "The player could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[430px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {isCreating
                ? "Create player"
                : editing
                  ? "Edit player"
                  : "Select a player"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {isCreating ? "New player" : editing?.name || "Player profile"}
            </h2>
          </div>
          {!isCreating && (
            <button
              type="button"
              onClick={() => {
                setEditing(newPlayer());
                setIsCreating(true);
                setMessage("");
              }}
              className="inline-flex shrink-0 items-center gap-1.5 bg-blue-700 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white hover:bg-blue-800"
            >
              <PlusIcon className="h-4 w-4" />
              New player
            </button>
          )}
        </div>

        {message && (
          <p
            role="status"
            className={`mt-5 text-sm font-semibold ${
              isError ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {message}
          </p>
        )}

        {editing ? (
          <form
            key={isCreating ? "new-player" : editing.id}
            className="mt-6 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void savePlayer(event.currentTarget);
            }}
          >
            <div className="flex items-end gap-4 border-y border-[#071a2b]/10 py-4">
              <div className="h-24 w-20 overflow-hidden bg-[#e8e2d6]">
                {editing.picLink ? (
                  <Image
                    src={editing.picLink}
                    alt=""
                    width={160}
                    height={192}
                    unoptimized
                    className="h-full w-full object-contain object-bottom"
                  />
                ) : (
                  <IdentificationIcon className="h-full w-full p-5 text-blue-700/30" />
                )}
              </div>
              <div className="min-w-0 text-xs text-[#071a2b]/45">
                <p className="font-bold text-[#071a2b]">
                  {completeness(editing)}/7 fields complete
                </p>
                <p className="mt-1 truncate font-mono">
                  {isCreating ? "ID generated when saved" : editing.id}
                </p>
                {!isCreating && nameCounts.get(editing.name)! > 1 && (
                  <p className="mt-2 font-bold uppercase tracking-[0.1em] text-amber-700">
                    Duplicate name
                  </p>
                )}
              </div>
            </div>

            <label className={labelClass}>
              Name
              <input
                name="name"
                required
                maxLength={200}
                defaultValue={editing.name}
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={labelClass}>
                Date of birth
                <input
                  name="dateOfBirth"
                  type="date"
                  defaultValue={editing.dateOfBirth || ""}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Foot
                <select
                  name="foot"
                  defaultValue={editing.foot || ""}
                  className={inputClass}
                >
                  <option value="">Unknown</option>
                  <option value="Left">Left</option>
                  <option value="Right">Right</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className={labelClass}>
                Primary position
                <select
                  name="position"
                  defaultValue={editing.position || ""}
                  className={inputClass}
                >
                  <option value="">Unknown</option>
                  {PLAYER_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Secondary position
                <select
                  name="secondaryPosition"
                  defaultValue={editing.secondaryPosition || ""}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {PLAYER_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className={labelClass}>
                Height
                <input
                  name="height"
                  maxLength={100}
                  defaultValue={editing.height || ""}
                  placeholder="For example: 1.85m"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Place of birth
                <input
                  name="placeOfBirth"
                  maxLength={300}
                  defaultValue={editing.placeOfBirth || ""}
                  className={inputClass}
                />
              </label>
            </div>
            <label className={labelClass}>
              Picture link
              <input
                name="picLink"
                type="url"
                maxLength={2000}
                defaultValue={editing.picLink || ""}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Biography Markdown
              <textarea
                name="biographyMarkdown"
                rows={12}
                maxLength={50000}
                defaultValue={editing.biographyMarkdown || ""}
                className={`${inputClass} font-mono text-xs leading-5`}
              />
            </label>
            <label className={labelClass}>
              External links
              <textarea
                name="links"
                rows={3}
                defaultValue={editing.links.join("\n")}
                placeholder="One URL per line"
                className={`${inputClass} font-mono text-xs`}
              />
            </label>
            <div className="flex gap-3">
              {isCreating && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditing(null);
                    setIsCreating(false);
                    setMessage("");
                  }}
                  className="inline-flex items-center justify-center gap-2 border border-[#071a2b]/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] hover:bg-[#f4f0e8] disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {isCreating ? (
                  <PlusIcon className="h-4 w-4" />
                ) : (
                  <PencilSquareIcon className="h-4 w-4" />
                )}
                {saving
                  ? "Saving…"
                  : isCreating
                    ? "Create player"
                    : "Save player"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-sm leading-6 text-[#071a2b]/55">
            <IdentificationIcon className="h-8 w-8 text-blue-700" />
            <p className="mt-4">
              Search the imported player archive and select a record to inspect
              or edit its local D1 profile.
            </p>
          </div>
        )}
      </aside>

      <section className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <label>
            <span className="sr-only">Search players</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, birthplace, date or ID"
              className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none"
            />
          </label>
          <label>
            <span className="sr-only">Filter by position</span>
            <select
              value={positionFilter}
              onChange={(event) => setPositionFilter(event.target.value)}
              className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none"
            >
              <option value="all">All positions</option>
              {PLAYER_POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Player</th>
                <th className="px-4 py-4">Position</th>
                <th className="px-4 py-4">Profile</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {filteredPlayers.map((player) => (
                <tr
                  key={player.id}
                  className={
                    editing?.id === player.id
                      ? "bg-blue-50"
                      : "hover:bg-[#f4f0e8]"
                  }
                >
                  <td className="px-5 py-4">
                    <span className="font-semibold">{player.name}</span>
                    <span className="mt-1 block font-mono text-[9px] text-[#071a2b]/35">
                      {player.id}
                    </span>
                    {nameCounts.get(player.name)! > 1 && (
                      <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.1em] text-amber-700">
                        Duplicate name
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs">
                    <span className="block">
                      {player.position || "Unknown"}
                    </span>
                    {player.secondaryPosition && (
                      <span className="mt-1 block text-[#071a2b]/45">
                        {player.secondaryPosition}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                      {completeness(player)}/7
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(player);
                        setIsCreating(false);
                        setMessage("");
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
        {filteredPlayers.length === 0 && (
          <p className="border-x border-b border-[#071a2b]/15 bg-[#fffdf8] px-6 py-12 text-center text-sm text-[#071a2b]/55">
            No player records match those filters.
          </p>
        )}
      </section>
    </div>
  );
}
