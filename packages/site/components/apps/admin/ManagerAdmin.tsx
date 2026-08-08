"use client";

import {
  CalendarDaysIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import type { ManagerRecord } from "@/lib/managers";
import { MANAGER_FORMATIONS } from "@tranmere-web/lib/src/manager-constants";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";

function sortManagers(managers: ManagerRecord[]) {
  return [...managers].sort(
    (a, b) =>
      b.dateJoined.localeCompare(a.dateJoined) ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id),
  );
}

export function ManagerAdmin({
  initialManagers,
}: {
  initialManagers: ManagerRecord[];
}) {
  const [managers, setManagers] = useState(sortManagers(initialManagers));
  const [editing, setEditing] = useState<ManagerRecord | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const filteredManagers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return managers;
    return managers.filter((manager) =>
      [
        manager.name,
        manager.dateJoined,
        manager.dateLeft,
        manager.favouriteFormation,
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [managers, search]);

  function resetForm() {
    setEditing(null);
    setFormKey((key) => key + 1);
  }

  async function saveManager(form: HTMLFormElement) {
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/managers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          name: formData.get("name"),
          dateJoined: formData.get("dateJoined"),
          dateLeft: formData.get("dateLeft"),
          imagePath: formData.get("imagePath"),
          favouriteFormation: formData.get("favouriteFormation"),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        manager?: ManagerRecord;
      };
      if (!response.ok || !result.manager) {
        throw new Error(result.message || "The manager could not be saved.");
      }

      setManagers((records) =>
        sortManagers(
          editing
            ? records.map((record) =>
                record.id === result.manager!.id ? result.manager! : record,
              )
            : [result.manager!, ...records],
        ),
      );
      setMessage(
        editing
          ? `${result.manager.name} was updated.`
          : `${result.manager.name} was added.`,
      );
      resetForm();
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The manager could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
      <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {editing ? "Edit record" : "New record"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {editing ? editing.name : "Add a manager"}
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
            void saveManager(event.currentTarget);
          }}
        >
          <div>
            <label htmlFor="manager-name" className={labelClass}>
              Name
            </label>
            <input
              id="manager-name"
              name="name"
              required
              maxLength={200}
              defaultValue={editing?.name}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="manager-joined" className={labelClass}>
              Date appointed
            </label>
            <input
              id="manager-joined"
              name="dateJoined"
              type="date"
              required
              defaultValue={editing?.dateJoined}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="manager-left" className={labelClass}>
              Date departed
            </label>
            <input
              id="manager-left"
              name="dateLeft"
              required
              defaultValue={
                editing?.dateLeft.toLowerCase().startsWith("now")
                  ? "Present"
                  : editing?.dateLeft
              }
              placeholder="YYYY-MM-DD or Present"
              className={inputClass}
            />
            <p className="mt-2 text-xs leading-5 text-[#071a2b]/45">
              Enter “Present” for the current manager.
            </p>
          </div>
          <div>
            <label htmlFor="manager-formation" className={labelClass}>
              Favourite formation
            </label>
            <select
              id="manager-formation"
              name="favouriteFormation"
              defaultValue={editing?.favouriteFormation || ""}
              className={inputClass}
            >
              <option value="">Not recorded</option>
              {MANAGER_FORMATIONS.map((formation) => (
                <option key={formation} value={formation}>
                  {formation}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="manager-image" className={labelClass}>
              Manager image path
            </label>
            <input
              id="manager-image"
              name="imagePath"
              maxLength={500}
              defaultValue={editing?.imagePath}
              placeholder="For example: managers/john-king.jpg"
              className={inputClass}
            />
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
            {saving ? "Saving…" : editing ? "Save manager" : "Add manager"}
          </button>
        </form>
      </section>

      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Managerial archive
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {filteredManagers.length} records
            </h2>
          </div>
          <div className="w-full sm:w-80">
            <label htmlFor="manager-search" className="sr-only">
              Search managers
            </label>
            <input
              id="manager-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or date"
              className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Manager</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {filteredManagers.map((manager) => (
                <tr key={manager.id} className="hover:bg-[#f4f0e8]">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold">
                    {manager.name}
                    {manager.imagePath && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                        Portrait
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(manager);
                        setMessage(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 underline underline-offset-4"
                    >
                      <CalendarDaysIcon className="h-4 w-4" />
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
