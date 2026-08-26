"use client";

import type { GalleryImage, Shirt } from "@/lib/types";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";
const usages = [
  "Home",
  "Away",
  "Third",
  "Goalkeeper",
  "Goalkeeper Away",
  "Training",
  "Other",
];
const colors = [
  "White",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Black",
  "Purple",
  "Claret",
  "Other",
];

function sortShirts(shirts: Shirt[]) {
  return [...shirts].sort((a, b) => a.name.localeCompare(b.name));
}

function emptyImage(): GalleryImage {
  return { url: "", title: "", description: "" };
}

function lines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ShirtAdmin({ initialShirts }: { initialShirts: Shirt[] }) {
  const [shirts, setShirts] = useState(sortShirts(initialShirts));
  const [editing, setEditing] = useState<Shirt | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([emptyImage()]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const filteredShirts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return shirts;
    return shirts.filter((shirt) =>
      [shirt.name, shirt.slug, shirt.manufacturer, ...shirt.seasons].some(
        (value) => value.toLowerCase().includes(query),
      ),
    );
  }, [search, shirts]);

  function selectShirt(shirt: Shirt) {
    setEditing(shirt);
    setImages(
      shirt.imagesCollection.items.length
        ? shirt.imagesCollection.items
        : [emptyImage()],
    );
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(null);
    setImages([emptyImage()]);
  }

  function updateImage(
    index: number,
    field: keyof GalleryImage,
    value: string,
  ) {
    setImages((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index ? { ...image, [field]: value } : image,
      ),
    );
  }

  async function saveShirt(form: HTMLFormElement) {
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/shirts", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          slug: data.get("slug"),
          name: data.get("name"),
          price: data.get("price"),
          manufacturer: data.get("manufacturer"),
          descriptionJson: data.get("descriptionJson"),
          use: data.get("use"),
          color: data.get("color"),
          decade: data.get("decade"),
          avatarImageUrl: data.get("avatarImageUrl"),
          images,
          seasons: lines(data.get("seasons")),
          variants: lines(data.get("variants")),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        shirt?: Shirt;
      };
      if (!response.ok || !result.shirt) {
        throw new Error(result.message || "The shirt could not be saved.");
      }
      setShirts((current) =>
        sortShirts(
          editing
            ? current.map((item) =>
                item.id === result.shirt!.id ? result.shirt! : item,
              )
            : [...current, result.shirt!],
        ),
      );
      setMessage(editing ? "Shirt updated." : "Shirt added.");
      resetForm();
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The shirt could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeShirt(shirt: Shirt) {
    if (!window.confirm(`Delete ${shirt.name}? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/shirts?id=${encodeURIComponent(shirt.id)}`,
        {
          method: "DELETE",
        },
      );
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "The shirt could not be deleted.");
      setShirts((current) => current.filter((item) => item.id !== shirt.id));
      if (editing?.id === shirt.id) resetForm();
      setMessage("Shirt deleted.");
      setIsError(false);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The shirt could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[460px_minmax(0,1fr)] lg:items-start">
      <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {editing ? "Edit record" : "New record"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {editing?.name || "Add a shirt"}
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
            className={`mt-5 text-sm font-semibold ${isError ? "text-red-700" : "text-emerald-700"}`}
          >
            {message}
          </p>
        )}

        <form
          key={editing?.id || "new"}
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void saveShirt(event.currentTarget);
          }}
        >
          <div>
            <label className={labelClass} htmlFor="shirt-name">
              Name
            </label>
            <input
              id="shirt-name"
              name="name"
              required
              defaultValue={editing?.name}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="shirt-slug">
              Slug
            </label>
            <input
              id="shirt-slug"
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={editing?.slug}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="shirt-use">
                Usage
              </label>
              <select
                id="shirt-use"
                name="use"
                defaultValue={editing?.use || "Home"}
                className={inputClass}
              >
                {usages.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="shirt-color">
                Colour
              </label>
              <select
                id="shirt-color"
                name="color"
                defaultValue={editing?.color || "White"}
                className={inputClass}
              >
                {colors.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="shirt-decade">
                Decade
              </label>
              <input
                id="shirt-decade"
                name="decade"
                required
                pattern="\d{4}s"
                placeholder="1980s"
                defaultValue={editing?.decade}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="shirt-manufacturer">
                Manufacturer
              </label>
              <input
                id="shirt-manufacturer"
                name="manufacturer"
                defaultValue={editing?.manufacturer}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="shirt-price">
              Price
            </label>
            <input
              id="shirt-price"
              name="price"
              defaultValue={editing?.price}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="shirt-seasons">
              Seasons <span className="font-normal">(one per line)</span>
            </label>
            <textarea
              id="shirt-seasons"
              name="seasons"
              rows={3}
              defaultValue={editing?.seasons.join("\n")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="shirt-variants">
              Variants <span className="font-normal">(one per line)</span>
            </label>
            <textarea
              id="shirt-variants"
              name="variants"
              rows={3}
              defaultValue={editing?.variants.join("\n")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="shirt-avatar">
              Avatar image URL
            </label>
            <input
              id="shirt-avatar"
              name="avatarImageUrl"
              defaultValue={editing?.avatarImageUrl}
              placeholder="/builder/... or https://..."
              className={inputClass}
            />
          </div>

          <fieldset className="border-t border-[#071a2b]/15 pt-5">
            <legend className={labelClass}>Archive images</legend>
            <div className="mt-3 space-y-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="border border-[#071a2b]/15 bg-[#f4f0e8] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold">
                      Image {index + 1}
                    </span>
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setImages((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        className="text-xs font-bold text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    aria-label={`Image ${index + 1} URL`}
                    required
                    type="url"
                    value={image.url}
                    onChange={(event) =>
                      updateImage(index, "url", event.target.value)
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                  <input
                    aria-label={`Image ${index + 1} title`}
                    value={image.title}
                    onChange={(event) =>
                      updateImage(index, "title", event.target.value)
                    }
                    placeholder="Title (optional)"
                    className={inputClass}
                  />
                  <input
                    aria-label={`Image ${index + 1} description`}
                    value={image.description}
                    onChange={(event) =>
                      updateImage(index, "description", event.target.value)
                    }
                    placeholder="Alt text / description"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setImages((current) => [...current, emptyImage()])}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-700"
            >
              <PlusIcon className="h-4 w-4" /> Add image
            </button>
          </fieldset>

          <div>
            <label className={labelClass} htmlFor="shirt-description">
              Contentful rich-text JSON
            </label>
            <textarea
              id="shirt-description"
              name="descriptionJson"
              rows={7}
              defaultValue={
                editing?.description?.json
                  ? JSON.stringify(editing.description.json, null, 2)
                  : ""
              }
              className={`${inputClass} font-mono text-xs`}
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
            {saving ? "Saving…" : editing ? "Save shirt" : "Add shirt"}
          </button>
        </form>
      </section>

      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Shirt archive
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {filteredShirts.length} records
            </h2>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search shirts, seasons or makers"
            aria-label="Search shirts"
            className="block w-full border border-[#071a2b]/20 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none sm:w-80"
          />
        </div>
        <div className="mt-6 overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#071a2b] text-xs font-bold uppercase tracking-[0.1em] text-white/65">
              <tr>
                <th className="px-5 py-4">Shirt</th>
                <th className="px-4 py-4">Seasons</th>
                <th className="px-4 py-4">Images</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a2b]/10">
              {filteredShirts.map((shirt) => (
                <tr key={shirt.id} className="hover:bg-blue-50/60">
                  <td className="px-5 py-4">
                    <Link
                      href={`/shirts/${shirt.slug}`}
                      className="font-bold text-blue-700 hover:underline"
                    >
                      {shirt.name}
                    </Link>
                    <span className="mt-1 block text-xs text-[#071a2b]/45">
                      {shirt.use} · {shirt.manufacturer || "Unknown maker"}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs">
                    {shirt.seasons.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs">
                    {shirt.imagesCollection.items.length}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-4">
                      <button
                        type="button"
                        onClick={() => selectShirt(shirt)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700"
                      >
                        <PencilSquareIcon className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeShirt(shirt)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" /> Delete
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
