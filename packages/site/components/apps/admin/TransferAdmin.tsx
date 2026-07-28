"use client";

import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import type { Team, Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { useMemo, useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";

function sortTransfers(transfers: Transfer[]) {
  return [...transfers].sort(
    (a, b) =>
      b.season - a.season ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id),
  );
}

export function TransferAdmin({
  initialTransfers,
  teams,
}: {
  initialTransfers: Transfer[];
  teams: Team[];
}) {
  const [transfers, setTransfers] = useState(sortTransfers(initialTransfers));
  const [editing, setEditing] = useState<Transfer | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const filteredTransfers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return transfers;
    return transfers.filter((transfer) =>
      [
        transfer.name,
        transfer.from,
        transfer.to,
        transfer.value,
        transfer.season.toString(),
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, transfers]);

  function resetForm() {
    setEditing(null);
    setFormKey((key) => key + 1);
  }

  async function saveTransfer(form: HTMLFormElement) {
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/transfers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          playerName: formData.get("playerName"),
          season: Number(formData.get("season")),
          fromClub: formData.get("fromClub"),
          toClub: formData.get("toClub"),
          feeDescription: formData.get("feeDescription"),
          cost: Number(formData.get("cost")),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        transfer?: Transfer;
      };
      if (!response.ok || !result.transfer) {
        throw new Error(result.message || "The transfer could not be saved.");
      }

      setTransfers((records) =>
        sortTransfers(
          editing
            ? records.map((record) =>
                record.id === result.transfer!.id ? result.transfer! : record,
              )
            : [result.transfer!, ...records],
        ),
      );
      setMessage(
        editing
          ? `${result.transfer.name}'s transfer was updated.`
          : `${result.transfer.name}'s transfer was added.`,
      );
      resetForm();
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The transfer could not be saved.",
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
              {editing ? editing.name : "Add a transfer"}
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
            void saveTransfer(event.currentTarget);
          }}
        >
          <div>
            <label htmlFor="transfer-player" className={labelClass}>
              Player
            </label>
            <input
              id="transfer-player"
              name="playerName"
              required
              maxLength={200}
              defaultValue={editing?.name}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="transfer-season" className={labelClass}>
              Season
            </label>
            <input
              id="transfer-season"
              name="season"
              type="number"
              required
              min="1800"
              max="2200"
              defaultValue={editing?.season ?? new Date().getFullYear()}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="transfer-from" className={labelClass}>
              From
            </label>
            <input
              id="transfer-from"
              name="fromClub"
              required
              maxLength={200}
              list="transfer-clubs"
              defaultValue={editing?.from}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="transfer-to" className={labelClass}>
              To
            </label>
            <input
              id="transfer-to"
              name="toClub"
              required
              maxLength={200}
              list="transfer-clubs"
              defaultValue={editing?.to ?? "Tranmere Rovers"}
              className={inputClass}
            />
          </div>
          <datalist id="transfer-clubs">
            {teams.map((team) => (
              <option key={team.name} value={team.name} />
            ))}
          </datalist>
          <div>
            <label htmlFor="transfer-fee" className={labelClass}>
              Fee description
            </label>
            <input
              id="transfer-fee"
              name="feeDescription"
              maxLength={200}
              list="transfer-fees"
              defaultValue={editing?.value}
              placeholder="For example: Free Transfer"
              className={inputClass}
            />
            <datalist id="transfer-fees">
              <option value="Free Transfer" />
              <option value="Loan" />
              <option value="Undisclosed" />
              <option value="Trainee" />
            </datalist>
          </div>
          <div>
            <label htmlFor="transfer-cost" className={labelClass}>
              Numeric cost
            </label>
            <input
              id="transfer-cost"
              name="cost"
              type="number"
              required
              min="0"
              step="1"
              defaultValue={editing?.cost ?? 0}
              className={inputClass}
            />
            <p className="mt-2 text-xs leading-5 text-[#071a2b]/45">
              Used for sorting record fees. Enter zero for free, loan or
              undisclosed transfers.
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
            {saving ? "Saving…" : editing ? "Save transfer" : "Add transfer"}
          </button>
        </form>
      </section>

      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Transfer archive
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {filteredTransfers.length.toLocaleString()} records
            </h2>
          </div>
          <div className="w-full sm:w-80">
            <label htmlFor="transfer-search" className="sr-only">
              Search transfers
            </label>
            <input
              id="transfer-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search player, club, season or fee"
              className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#071a2b]/15 bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Player</th>
                <th className="px-4 py-4">Season</th>
                <th className="px-4 py-4">Move</th>
                <th className="px-4 py-4">Fee</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {filteredTransfers.slice(0, 100).map((transfer) => {
                const departure = transfer.from === "Tranmere Rovers";
                return (
                  <tr key={transfer.id} className="hover:bg-[#f4f0e8]">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold">
                      {transfer.name}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {transfer.season}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold">
                        {departure ? (
                          <ArrowUpRightIcon className="h-4 w-4 text-[#071a2b]/45" />
                        ) : (
                          <ArrowDownLeftIcon className="h-4 w-4 text-blue-700" />
                        )}
                        {departure ? transfer.to : transfer.from}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs">
                      {transfer.value || "Undisclosed"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(transfer);
                          setMessage(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-blue-700 underline underline-offset-4"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredTransfers.length > 100 && (
          <p className="mt-3 text-xs text-[#071a2b]/45">
            Showing the first 100 results. Search to narrow the archive.
          </p>
        )}
      </section>
    </div>
  );
}
