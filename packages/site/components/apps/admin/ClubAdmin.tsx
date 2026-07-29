"use client";

import type { ClubRecord } from "@/lib/clubs";
import {
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";

function sortClubs(clubs: ClubRecord[]) {
  return [...clubs].sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

export function ClubAdmin({ initialClubs }: { initialClubs: ClubRecord[] }) {
  const [clubs, setClubs] = useState(sortClubs(initialClubs));
  const [editing, setEditing] = useState<ClubRecord | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const filteredClubs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clubs;
    return clubs.filter((club) =>
      [club.name, club.shortName, club.threeLetterName, club.nicknames].some(
        (value) => value.toLowerCase().includes(query),
      ),
    );
  }, [clubs, search]);

  function resetForm() {
    setEditing(null);
    setFormKey((key) => key + 1);
  }

  async function saveClub(form: HTMLFormElement) {
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/clubs", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          name: formData.get("name"),
          shortName: formData.get("shortName"),
          threeLetterName: formData.get("threeLetterName"),
          nicknames: formData.get("nicknames"),
          primaryColour: formData.get("primaryColour"),
          secondaryColour: formData.get("secondaryColour"),
          highestDivision: formData.get("highestDivision"),
          latitude: formData.get("latitude"),
          longitude: formData.get("longitude"),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        club?: ClubRecord;
      };
      if (!response.ok || !result.club) {
        throw new Error(result.message || "The club could not be saved.");
      }

      setClubs((records) =>
        sortClubs(
          editing
            ? records.map((record) =>
                record.id === result.club!.id ? result.club! : record,
              )
            : [...records, result.club!],
        ),
      );
      setMessage(
        editing
          ? `${result.club.name} was updated.`
          : `${result.club.name} was added.`,
      );
      resetForm();
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "The club could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
      <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {editing ? "Edit record" : "New record"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {editing ? editing.name : "Add a club"}
            </h2>
          </div>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-blue-700 underline underline-offset-4"
            >
              Cancel
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

        <form
          key={`${editing?.id || "new"}-${formKey}`}
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void saveClub(event.currentTarget);
          }}
        >
          <div>
            <label htmlFor="club-name" className={labelClass}>
              Club name
            </label>
            <input
              id="club-name"
              name="name"
              required
              maxLength={200}
              defaultValue={editing?.name}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="club-short-name" className={labelClass}>
                Short name
              </label>
              <input
                id="club-short-name"
                name="shortName"
                maxLength={100}
                defaultValue={editing?.shortName}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="club-code" className={labelClass}>
                Three-letter code
              </label>
              <input
                id="club-code"
                name="threeLetterName"
                maxLength={10}
                defaultValue={editing?.threeLetterName}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="club-nicknames" className={labelClass}>
              Nicknames
            </label>
            <input
              id="club-nicknames"
              name="nicknames"
              maxLength={500}
              defaultValue={editing?.nicknames}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="club-primary" className={labelClass}>
                Primary colour
              </label>
              <input
                id="club-primary"
                name="primaryColour"
                maxLength={100}
                defaultValue={editing?.primaryColour}
                placeholder="#132c82"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="club-secondary" className={labelClass}>
                Secondary colour
              </label>
              <input
                id="club-secondary"
                name="secondaryColour"
                maxLength={100}
                defaultValue={editing?.secondaryColour}
                placeholder="#ffffff"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="club-division" className={labelClass}>
              Highest division
            </label>
            <input
              id="club-division"
              name="highestDivision"
              type="number"
              min={1}
              max={20}
              defaultValue={editing?.highestDivision ?? ""}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="club-latitude" className={labelClass}>
                Latitude
              </label>
              <input
                id="club-latitude"
                name="latitude"
                type="number"
                min={-90}
                max={90}
                step="any"
                defaultValue={editing?.latitude ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="club-longitude" className={labelClass}>
                Longitude
              </label>
              <input
                id="club-longitude"
                name="longitude"
                type="number"
                min={-180}
                max={180}
                step="any"
                defaultValue={editing?.longitude ?? ""}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {editing ? (
              <PencilSquareIcon className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            {saving ? "Saving…" : editing ? "Save club" : "Add club"}
          </button>
        </form>
      </section>

      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Club archive
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {filteredClubs.length} records
            </h2>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, code or nickname"
            aria-label="Search clubs"
            className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none sm:w-80"
          />
        </div>

        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Club</th>
                <th className="px-4 py-4">Code</th>
                <th className="px-4 py-4">Location</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {filteredClubs.map((club) => (
                <tr key={club.id} className="hover:bg-blue-50/60">
                  <td className="px-5 py-4">
                    <span className="block font-bold">{club.name}</span>
                    {club.shortName && club.shortName !== club.name && (
                      <span className="mt-1 block text-xs text-[#071a2b]/45">
                        {club.shortName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs">
                    {club.threeLetterName || "—"}
                  </td>
                  <td className="px-4 py-4 text-xs text-[#071a2b]/55">
                    {club.latitude !== null && club.longitude !== null ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {club.latitude}, {club.longitude}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(club);
                        setMessage(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-blue-700 hover:underline"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
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
