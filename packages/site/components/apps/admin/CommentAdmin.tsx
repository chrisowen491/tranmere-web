"use client";

import type { AdminComment } from "@/lib/comments";
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function CommentAdmin({
  initialComments,
}: {
  initialComments: AdminComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [editing, setEditing] = useState<AdminComment | null>(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const filteredComments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return comments.filter((comment) => {
      const matchesRating =
        ratingFilter === "all" || comment.rating === Number(ratingFilter);
      const matchesSearch =
        !query ||
        [
          comment.text,
          comment.url,
          comment.user.name,
          comment.user.email || "",
        ].some((value) => value.toLowerCase().includes(query));
      return matchesRating && matchesSearch;
    });
  }, [comments, ratingFilter, search]);

  async function saveComment(form: HTMLFormElement) {
    if (!editing) return;
    setSaving(true);
    setMessage("");
    setIsError(false);
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          rating: Number(data.get("rating")),
          text: data.get("text"),
        }),
      });
      const result = (await response.json()) as {
        comment?: AdminComment;
        message?: string;
      };
      if (!response.ok || !result.comment) {
        throw new Error(result.message || "The comment could not be saved.");
      }
      setComments((records) =>
        records.map((record) =>
          record.id === result.comment!.id ? result.comment! : record,
        ),
      );
      setEditing(result.comment);
      setMessage("Comment and rating updated.");
    } catch (reason) {
      setIsError(true);
      setMessage(
        reason instanceof Error
          ? reason.message
          : "The comment could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeComment(comment: AdminComment) {
    if (
      !window.confirm(
        `Permanently delete ${comment.user.name}'s comment and rating?`,
      )
    ) {
      return;
    }
    setSaving(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await fetch("/api/admin/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comment.id }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "The comment could not be deleted.");
      }
      setComments((records) =>
        records.filter((record) => record.id !== comment.id),
      );
      if (editing?.id === comment.id) setEditing(null);
      setMessage("Comment and rating deleted.");
    } catch (reason) {
      setIsError(true);
      setMessage(
        reason instanceof Error
          ? reason.message
          : "The comment could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          {editing ? "Edit contribution" : "Select a contribution"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          {editing ? editing.user.name : "Comment moderation"}
        </h2>

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
            key={editing.id}
            className="mt-6 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void saveComment(event.currentTarget);
            }}
          >
            <div className="border-y border-[#071a2b]/10 py-4 text-xs text-[#071a2b]/55">
              <p>{editing.user.email || editing.user.name}</p>
              <Link
                href={editing.url}
                className="mt-1 block break-all font-bold text-blue-700"
              >
                {editing.url}
              </Link>
              <p className="mt-1">{formatDate(editing.created_at)}</p>
            </div>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
                Rating
              </span>
              <select
                name="rating"
                defaultValue={editing.rating}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} star{rating === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
                Comment
              </span>
              <textarea
                name="text"
                rows={8}
                maxLength={5000}
                defaultValue={editing.text}
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
            >
              <PencilSquareIcon className="h-4 w-4" />
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void removeComment(editing)}
              className="inline-flex w-full items-center justify-center gap-2 border border-red-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-red-700 hover:bg-red-700 hover:text-white disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              Delete permanently
            </button>
          </form>
        ) : (
          <div className="mt-8 text-sm leading-6 text-[#071a2b]/55">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-700" />
            <p className="mt-4">
              Choose a contribution from the list to correct its rating or text,
              or permanently remove it.
            </p>
          </div>
        )}
      </aside>

      <section className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
          <label>
            <span className="sr-only">Search comments</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search comment, user, email or page"
              className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none"
            />
          </label>
          <label>
            <span className="sr-only">Filter by rating</span>
            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none"
            >
              <option value="all">All ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Published contributions
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {filteredComments.length.toLocaleString()} results
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filteredComments.map((comment) => (
            <article
              key={comment.id}
              className={`border bg-[#fffdf8] p-5 transition ${
                editing?.id === comment.id
                  ? "border-blue-700 shadow-[5px_5px_0_#132c82]"
                  : "border-[#071a2b]/15 hover:border-blue-700"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{comment.user.name}</h3>
                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-amber-600">
                      <StarIcon className="h-4 w-4 fill-current" />
                      {comment.rating}/5
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#071a2b]/45">
                    {formatDate(comment.created_at)} · {comment.user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(comment);
                    setMessage("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-blue-700 underline underline-offset-4"
                >
                  Edit
                </button>
              </div>
              <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-[#071a2b]/70">
                {comment.text || <em>No written comment</em>}
              </p>
              <Link
                href={comment.url}
                className="mt-4 block truncate border-t border-[#071a2b]/10 pt-3 font-mono text-[10px] text-blue-700"
              >
                {comment.url}
              </Link>
            </article>
          ))}
          {filteredComments.length === 0 && (
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-14 text-center">
              <p className="font-display text-2xl font-semibold">
                No comments match those filters
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
