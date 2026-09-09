"use client";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import type { AwardDefinition, PlayerAwardRecord } from "@/lib/awards";

const input =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const label =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";
export function AwardsAdmin({
  initialAwards,
  initialAssignments,
}: {
  initialAwards: AwardDefinition[];
  initialAssignments: PlayerAwardRecord[];
}) {
  const [awards, setAwards] = useState(initialAwards);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [editAward, setEditAward] = useState<AwardDefinition | null>(null);
  const [editAssignment, setEditAssignment] =
    useState<PlayerAwardRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(
    resource: "award" | "assignment",
    form: HTMLFormElement,
  ) {
    const editing = resource === "award" ? editAward : editAssignment;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/admin/awards", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource,
        id: editing?.id,
        ...data,
        season: Number(data.season),
        sortOrder: Number(data.sortOrder),
      }),
    });
    const result = (await response.json()) as {
      award?: AwardDefinition;
      assignment?: PlayerAwardRecord;
      message?: string;
    };
    if (!response.ok) {
      setMessage(result.message || "The record could not be saved.");
      return;
    }
    if (result.award) {
      setAwards((rows) =>
        [
          ...rows.filter((row) => row.id !== result.award!.id),
          result.award!,
        ].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        ),
      );
      setAssignments((rows) =>
        rows.map((row) =>
          row.awardId === result.award!.id
            ? {
                ...row,
                awardName: result.award!.name,
                awardDescription: result.award!.description,
              }
            : row,
        ),
      );
      setEditAward(null);
    }
    if (result.assignment) {
      setAssignments((rows) =>
        [
          ...rows.filter((row) => row.id !== result.assignment!.id),
          result.assignment!,
        ].sort(
          (a, b) =>
            b.season - a.season || a.awardName.localeCompare(b.awardName),
        ),
      );
      setEditAssignment(null);
    }
    setMessage("Record saved.");
    form.reset();
  }
  async function remove(
    resource: "award" | "assignment",
    record: AwardDefinition | PlayerAwardRecord,
  ) {
    if (
      !window.confirm(
        resource === "award"
          ? "Delete this award and all its recipients?"
          : "Delete this award assignment?",
      )
    )
      return;
    const response = await fetch(
      `/api/admin/awards?resource=${resource}&id=${encodeURIComponent(record.id)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setMessage("The record could not be deleted.");
      return;
    }
    if (resource === "award") {
      setAwards((rows) => rows.filter((row) => row.id !== record.id));
      setAssignments((rows) => rows.filter((row) => row.awardId !== record.id));
    } else setAssignments((rows) => rows.filter((row) => row.id !== record.id));
    setMessage("Record deleted.");
  }
  return (
    <div className="space-y-12">
      {message && (
        <p
          role="status"
          className="border border-blue-700/20 bg-blue-50 px-4 py-3 text-sm font-semibold"
        >
          {message}
        </p>
      )}
      <section className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form
          key={editAward?.id || "new-award"}
          onSubmit={(e) => {
            e.preventDefault();
            void submit("award", e.currentTarget);
          }}
          className="space-y-5 border border-[#071a2b]/15 bg-[#fffdf8] p-6"
        >
          <h2 className="font-display text-3xl font-semibold">
            {editAward ? "Edit award" : "Create an award"}
          </h2>
          <label className={label}>
            Name
            <input
              name="name"
              required
              maxLength={200}
              defaultValue={editAward?.name}
              className={input}
            />
          </label>
          <label className={label}>
            Description
            <textarea
              name="description"
              maxLength={1000}
              rows={3}
              defaultValue={editAward?.description || ""}
              className={input}
            />
          </label>
          <label className={label}>
            Display order
            <input
              name="sortOrder"
              type="number"
              defaultValue={editAward?.sortOrder ?? 0}
              className={input}
            />
          </label>
          <button className="flex w-full items-center justify-center gap-2 bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white">
            <PlusIcon className="h-4 w-4" />
            Save award
          </button>
          {editAward && (
            <button
              type="button"
              onClick={() => setEditAward(null)}
              className="text-xs font-bold text-blue-700 underline"
            >
              Cancel editing
            </button>
          )}
        </form>
        <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#071a2b] text-white">
              <tr>
                <th className="px-5 py-4">Award</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {awards.map((award) => (
                <tr key={award.id}>
                  <td className="px-5 py-4 font-bold">{award.name}</td>
                  <td className="px-5 py-4 text-[#071a2b]/60">
                    {award.description || "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      onClick={() => setEditAward(award)}
                      className="mr-4 text-blue-700"
                    >
                      <PencilSquareIcon className="inline h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => void remove("award", award)}
                      className="text-red-700"
                    >
                      <TrashIcon className="inline h-4 w-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form
          key={editAssignment?.id || "new-assignment"}
          onSubmit={(e) => {
            e.preventDefault();
            void submit("assignment", e.currentTarget);
          }}
          className="space-y-5 border border-[#071a2b]/15 bg-[#fffdf8] p-6"
        >
          <h2 className="font-display text-3xl font-semibold">
            {editAssignment ? "Edit recipient" : "Award a player"}
          </h2>
          <label className={label}>
            Award
            <select
              name="awardId"
              required
              defaultValue={editAssignment?.awardId || ""}
              className={input}
            >
              <option value="">Choose award</option>
              {awards.map((award) => (
                <option key={award.id} value={award.id}>
                  {award.name}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Season
            <input
              name="season"
              type="number"
              min="1800"
              max="2200"
              required
              defaultValue={editAssignment?.season ?? new Date().getFullYear()}
              className={input}
            />
          </label>
          <label className={label}>
            Player name
            <input
              name="playerName"
              required
              maxLength={200}
              defaultValue={editAssignment?.playerName}
              className={input}
            />
          </label>
          <label className={label}>
            Note
            <textarea
              name="notes"
              maxLength={500}
              rows={3}
              defaultValue={editAssignment?.notes || ""}
              className={input}
            />
          </label>
          <button
            disabled={!awards.length}
            className="flex w-full items-center justify-center gap-2 bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-40"
          >
            <PlusIcon className="h-4 w-4" />
            Save recipient
          </button>
          {editAssignment && (
            <button
              type="button"
              onClick={() => setEditAssignment(null)}
              className="text-xs font-bold text-blue-700 underline"
            >
              Cancel editing
            </button>
          )}
        </form>
        <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#071a2b] text-white">
              <tr>
                <th className="px-5 py-4">Season</th>
                <th className="px-5 py-4">Award</th>
                <th className="px-5 py-4">Player</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {assignments.map((record) => (
                <tr key={record.id}>
                  <td className="px-5 py-4 font-mono font-bold">
                    {record.season}/{String(record.season + 1).slice(-2)}
                  </td>
                  <td className="px-5 py-4">{record.awardName}</td>
                  <td className="px-5 py-4 font-bold">{record.playerName}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      onClick={() => setEditAssignment(record)}
                      className="mr-4 text-blue-700"
                    >
                      <PencilSquareIcon className="inline h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => void remove("assignment", record)}
                      className="text-red-700"
                    >
                      <TrashIcon className="inline h-4 w-4" /> Delete
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
