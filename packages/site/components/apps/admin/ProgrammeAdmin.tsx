"use client";

import type { ProgrammeRecord } from "@/lib/programmes";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";

function sortProgrammes(programmes: ProgrammeRecord[]) {
  return [...programmes].sort(
    (a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name),
  );
}

export function ProgrammeAdmin({
  initialProgrammes,
}: {
  initialProgrammes: ProgrammeRecord[];
}) {
  const [programmes, setProgrammes] = useState(sortProgrammes(initialProgrammes));
  const [editing, setEditing] = useState<ProgrammeRecord | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const filteredProgrammes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return programmes;
    return programmes.filter((programme) =>
      [programme.name, programme.date, programme.url, programme.pages.toString()].some(
        (value) => value.toLowerCase().includes(query),
      ),
    );
  }, [programmes, search]);

  function resetForm() {
    setEditing(null);
    setFormKey((key) => key + 1);
  }

  async function saveProgramme(form: HTMLFormElement) {
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/programmes", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: editing?.url,
          url: formData.get("url"),
          name: formData.get("name"),
          date: formData.get("date"),
          pages: Number(formData.get("pages")),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        programme?: ProgrammeRecord;
      };
      if (!response.ok || !result.programme) {
        throw new Error(result.message || "The programme could not be saved.");
      }

      setProgrammes((records) =>
        sortProgrammes(
          editing
            ? records.map((record) =>
                record.url === editing.url ? result.programme! : record,
              )
            : [result.programme!, ...records],
        ),
      );
      setMessage(
        editing ? "Programme updated." : "Programme added to the archive.",
      );
      resetForm();
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "The programme could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeProgramme(programme: ProgrammeRecord) {
    if (!window.confirm(`Delete ${programme.name} from the archive?`)) return;

    setSaving(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await fetch("/api/admin/programmes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: programme.url }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "The programme could not be deleted.");
      }

      setProgrammes((records) =>
        records.filter((record) => record.url !== programme.url),
      );
      if (editing?.url === programme.url) resetForm();
      setMessage("Programme removed from the archive.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "The programme could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {editing ? "Edit record" : "New record"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {editing ? editing.name : "Add a programme"}
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
          key={`${editing?.url || "new"}-${formKey}`}
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void saveProgramme(event.currentTarget);
          }}
        >
          <div>
            <label htmlFor="programme-name" className={labelClass}>
              Match name
            </label>
            <input
              id="programme-name"
              name="name"
              required
              maxLength={200}
              placeholder="Tranmere Rovers v Newport County"
              defaultValue={editing?.name}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="programme-date" className={labelClass}>
              Match date
            </label>
            <input
              id="programme-date"
              name="date"
              type="date"
              required
              defaultValue={editing?.date}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="programme-pages" className={labelClass}>
              Number of pages
            </label>
            <input
              id="programme-pages"
              name="pages"
              type="number"
              required
              min="1"
              step="1"
              defaultValue={editing?.pages ?? 56}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="programme-url" className={labelClass}>
              PDF URL
            </label>
            <input
              id="programme-url"
              name="url"
              required
              maxLength={500}
              placeholder="/pdfs/programme.pdf"
              defaultValue={editing?.url}
              className={inputClass}
            />
            <p className="mt-2 text-xs leading-5 text-[#071a2b]/45">
              Use a site-relative path or a full HTTPS URL.
            </p>
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
            {saving ? "Saving…" : editing ? "Save programme" : "Add programme"}
          </button>
        </form>
      </section>

      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Programme archive
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {filteredProgrammes.length.toLocaleString()} records
            </h2>
          </div>
          <div className="w-full sm:w-80">
            <label htmlFor="programme-search" className="sr-only">
              Search programmes
            </label>
            <input
              id="programme-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search match, date or PDF URL"
              className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="w-full min-w-[680px] table-fixed text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="w-[30%] px-5 py-4">Match</th>
                <th className="w-[15%] px-3 py-4">Date</th>
                <th className="w-[12%] px-3 py-4">Pages</th>
                <th className="w-[31%] px-3 py-4">PDF</th>
                <th className="w-[12%] px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {filteredProgrammes.map((programme) => (
                <tr key={programme.url} className="hover:bg-[#f4f0e8]">
                  <td className="break-words px-5 py-4 font-semibold leading-5">
                    {programme.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 font-mono text-xs">
                    {programme.date}
                  </td>
                  <td className="px-3 py-4 font-mono text-xs">{programme.pages}</td>
                  <td className="break-all px-3 py-4 text-xs leading-5 text-[#071a2b]/60">
                    {programme.url}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(programme);
                          setMessage(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-blue-700 underline underline-offset-4"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeProgramme(programme)}
                        disabled={saving}
                        className="text-xs font-bold text-red-700 underline underline-offset-4 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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
