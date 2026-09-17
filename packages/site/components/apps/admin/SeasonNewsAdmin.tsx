"use client";

import type { SeasonNewsSnippet } from "@/lib/seasonNews";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";
const sort = (items: SeasonNewsSnippet[]) =>
  [...items].sort(
    (a, b) => b.season - a.season || a.news_date.localeCompare(b.news_date),
  );

export function SeasonNewsAdmin({
  initialSnippets,
}: {
  initialSnippets: SeasonNewsSnippet[];
}) {
  const [snippets, setSnippets] = useState(sort(initialSnippets));
  const [editing, setEditing] = useState<SeasonNewsSnippet | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(form: HTMLFormElement) {
    setSaving(true);
    const data = new FormData(form);
    const response = await fetch("/api/admin/season-news", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing?.id,
        season: Number(data.get("season")),
        date: data.get("date"),
        placement: data.get("placement"),
        title: data.get("title"),
        body: data.get("body"),
        tags: String(data.get("tags") ?? "").split(/[,\n]/),
      }),
    });
    const result = (await response.json()) as {
      snippet?: SeasonNewsSnippet;
      message?: string;
    };
    if (!response.ok || !result.snippet) {
      setMessage(result.message || "The news snippet could not be saved.");
    } else {
      setSnippets((items) =>
        sort([
          ...items.filter((item) => item.id !== result.snippet!.id),
          result.snippet!,
        ]),
      );
      setEditing(null);
      form.reset();
      setMessage("News snippet saved.");
    }
    setSaving(false);
  }

  async function remove(snippet: SeasonNewsSnippet) {
    if (!window.confirm("Delete this season news snippet?")) return;
    const response = await fetch(
      `/api/admin/season-news?id=${encodeURIComponent(snippet.id)}`,
      { method: "DELETE" },
    );
    if (response.ok) {
      setSnippets((items) => items.filter((item) => item.id !== snippet.id));
      if (editing?.id === snippet.id) setEditing(null);
      setMessage("News snippet deleted.");
    } else setMessage("The news snippet could not be deleted.");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[390px_minmax(0,1fr)] lg:items-start">
      <form
        key={editing?.id || "new"}
        onSubmit={(event) => {
          event.preventDefault();
          void save(event.currentTarget);
        }}
        className="space-y-5 border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          {editing ? "Edit snippet" : "New snippet"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {editing?.title || "Season news"}
        </h2>
        {message && (
          <p role="status" className="text-sm font-semibold text-blue-700">
            {message}
          </p>
        )}
        <label className={labelClass}>
          Season
          <input
            name="season"
            type="number"
            min="1800"
            max="2200"
            required
            defaultValue={editing?.season ?? new Date().getFullYear()}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Date
          <input
            name="date"
            type="date"
            required
            defaultValue={editing?.news_date}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Placement
          <select
            name="placement"
            defaultValue={editing?.placement ?? "timeline"}
            className={inputClass}
          >
            <option value="timeline">Month-by-month timeline</option>
            <option value="pre-season">Pre-season section</option>
          </select>
        </label>
        <label className={labelClass}>
          Heading{" "}
          <span className="normal-case tracking-normal">(optional)</span>
          <input
            name="title"
            maxLength={200}
            defaultValue={editing?.title ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Snippet
          <textarea
            name="body"
            required
            maxLength={4000}
            rows={7}
            defaultValue={editing?.body}
            className={inputClass}
            placeholder="One or two paragraphs of archive news"
          />
        </label>
        <label className={labelClass}>
          Tags
          <input
            name="tags"
            defaultValue={editing?.tags.join(", ") ?? ""}
            className={inputClass}
            placeholder="Player or manager names, comma separated (optional)"
          />
        </label>
        <p className="-mt-3 text-xs leading-5 text-[#071a2b]/55">
          Optional. Use exact player or manager names to show this note on their
          archive pages.
        </p>
        <button
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          {saving ? "Saving…" : editing ? "Save snippet" : "Add snippet"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="text-xs font-bold text-blue-700 underline"
          >
            Cancel editing
          </button>
        )}
      </form>
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Published archive notes
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {snippets.length} snippets
        </h2>
        <div className="mt-6 divide-y divide-[#071a2b]/10 border border-[#071a2b]/15 bg-[#fffdf8]">
          {snippets.map((snippet) => (
            <article key={snippet.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-bold text-blue-700">
                    {snippet.season}/{String(snippet.season + 1).slice(-2)} ·{" "}
                    {snippet.news_date} ·{" "}
                    {snippet.placement === "pre-season"
                      ? "Pre-season"
                      : "Timeline"}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">
                    {snippet.title || "Archive note"}
                  </h3>
                </div>
                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => setEditing(snippet)}
                    className="text-blue-700"
                  >
                    <PencilSquareIcon className="inline h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => void remove(snippet)}
                    className="text-red-700"
                  >
                    <TrashIcon className="inline h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#071a2b]/65">
                {snippet.body}
              </p>
              {snippet.tags.length ? (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                  {snippet.tags.join(" · ")}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
