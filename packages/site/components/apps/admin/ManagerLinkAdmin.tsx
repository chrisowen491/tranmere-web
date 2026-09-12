"use client";

import type { ManagerLink, ManagerRecord } from "@/lib/managers";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";

export function ManagerLinkAdmin({
  managers,
  initialLinks,
}: {
  managers: ManagerRecord[];
  initialLinks: ManagerLink[];
}) {
  const [links, setLinks] = useState(initialLinks);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="mt-12 border-t border-[#071a2b]/15 pt-10">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
        Manager profiles
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold">
        External links
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
        Add interviews, profiles and archive sources to an individual manager
        page. Blog stories are included by giving the Contentful post a tag
        matching the manager&apos;s name without annotations such as “(Joint)”
        or “(2nd)”.
      </p>
      {message && (
        <p role="status" className="mt-4 text-sm font-semibold text-blue-700">
          {message}
        </p>
      )}

      <form
        className="mt-6 grid gap-4 border border-[#071a2b]/15 bg-[#fffdf8] p-6 md:grid-cols-2 lg:grid-cols-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          const form = event.currentTarget;
          const response = await fetch("/api/admin/manager-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
          });
          const result = (await response.json()) as {
            message?: string;
            link?: ManagerLink;
          };
          if (response.ok && result.link) {
            setLinks((current) => [...current, result.link!]);
            form.reset();
            setMessage("Manager link published.");
          } else setMessage(result.message || "The link could not be saved.");
          setSaving(false);
        }}
      >
        <label className={`${labelClass} lg:col-span-2`}>
          Manager
          <select required name="managerId" className={inputClass}>
            <option value="">Choose manager</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} · {manager.dateJoined}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Short label
          <input required name="label" maxLength={200} className={inputClass} />
        </label>
        <label className={`${labelClass} lg:col-span-2`}>
          URL
          <input required name="url" type="url" className={inputClass} />
        </label>
        <label className={labelClass}>
          Publisher
          <input name="publisher" maxLength={100} className={inputClass} />
        </label>
        <label className={`${labelClass} md:col-span-2 lg:col-span-6`}>
          Description shown as link text
          <textarea
            name="description"
            maxLength={500}
            rows={2}
            className={inputClass}
            placeholder="Describe what readers will find at this link"
          />
        </label>
        <label className={labelClass}>
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue="0"
            className={inputClass}
          />
        </label>
        <button
          disabled={saving}
          className="bg-blue-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50 md:col-span-2 lg:col-span-5"
        >
          {saving ? "Publishing…" : "Publish manager link"}
        </button>
      </form>

      {links.length > 0 && (
        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#071a2b] text-xs uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Manager</th>
                <th className="px-5 py-4">Link</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {links.map((link) => (
                <tr key={link.id}>
                  <td className="px-5 py-4 font-semibold">
                    {managers.find((manager) => manager.id === link.managerId)
                      ?.name ?? "Unknown manager"}
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-700 hover:underline"
                    >
                      {link.description || link.label} ↗
                    </a>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      aria-label={`Remove ${link.label}`}
                      onClick={async () => {
                        const response = await fetch(
                          `/api/admin/manager-links?id=${encodeURIComponent(link.id)}`,
                          { method: "DELETE" },
                        );
                        if (response.ok) {
                          setLinks((current) =>
                            current.filter((item) => item.id !== link.id),
                          );
                          setMessage("Manager link removed.");
                        } else setMessage("The link could not be removed.");
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
