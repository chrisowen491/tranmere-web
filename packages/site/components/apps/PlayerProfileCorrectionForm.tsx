"use client";

import { type EditablePlayerProfile } from "@/lib/playerProfileCorrections";
import { useUser } from "@auth0/nextjs-auth0";
import { PLAYER_POSITIONS } from "@tranmere-web/lib/src/player-constants";
import { useState } from "react";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/20 bg-white px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55";

export function PlayerProfileCorrectionForm({
  playerName,
  current,
}: {
  playerName: string;
  current: EditablePlayerProfile;
}) {
  const { user, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function submitCorrection(form: HTMLFormElement) {
    setIsSubmitting(true);
    setMessage(null);
    setIsError(false);

    try {
      const formData = new FormData(form);
      const fields: (keyof EditablePlayerProfile)[] = [
        "dateOfBirth",
        "biography",
        "picLink",
        "foot",
        "height",
        "placeOfBirth",
        "position",
        "secondaryPosition",
      ];
      const changes = Object.fromEntries(
        fields
          .map((field) => [field, String(formData.get(field) || "").trim()])
          .filter(
            ([field, value]) =>
              !(
                (field === "position" || field === "secondaryPosition") &&
                value === ""
              ) &&
              value !==
                String(current[field as keyof EditablePlayerProfile] || ""),
          ),
      );
      if (changes.secondaryPosition === "__remove__") {
        changes.secondaryPosition = "";
      }

      const response = await fetch("/api/player-profile-corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName,
          changes,
          source: formData.get("source"),
          explanation: formData.get("explanation"),
        }),
      });
      const responseBody = await response.text();
      let result: { message?: string } = {};
      if (responseBody) {
        try {
          result = JSON.parse(responseBody) as { message?: string };
        } catch {
          result = {};
        }
      }
      if (!response.ok) {
        throw new Error(result.message || "The correction could not be sent.");
      }

      setMessage("Thanks — your profile correction is awaiting review.");
      setIsOpen(false);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The correction could not be sent.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return null;

  return (
    <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
        Community archive
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold">
        Spot something wrong?
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#071a2b]/60">
        Suggest a change to this profile. The player&apos;s name is fixed and
        every correction is checked before publication.
      </p>

      {message && (
        <p
          role="status"
          className={`mt-4 text-sm font-semibold ${
            isError ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      )}

      {!user ? (
        <a
          href="/auth/login"
          className="mt-4 inline-block text-sm font-bold text-blue-700 underline underline-offset-4"
        >
          Log in to suggest a correction
        </a>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="mt-4 text-sm font-bold text-blue-700 underline underline-offset-4"
          >
            {isOpen ? "Cancel correction" : "Suggest profile changes"}
          </button>

          {isOpen && (
            <form
              className="mt-5 space-y-5 border-t border-[#071a2b]/15 pt-5"
              onSubmit={(event) => {
                event.preventDefault();
                void submitCorrection(event.currentTarget);
              }}
            >
              <div>
                <span className={labelClass}>Player name</span>
                <p className="mt-2 border border-[#071a2b]/10 bg-[#f4f0e8] px-3 py-2.5 text-sm font-semibold">
                  {playerName}{" "}
                  <span className="text-[#071a2b]/40">· fixed</span>
                </p>
              </div>
              <div>
                <label htmlFor="dateOfBirth" className={labelClass}>
                  Date of birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={current.dateOfBirth}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="placeOfBirth" className={labelClass}>
                  Place of birth
                </label>
                <input
                  id="placeOfBirth"
                  name="placeOfBirth"
                  defaultValue={current.placeOfBirth}
                  maxLength={200}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="foot" className={labelClass}>
                    Preferred foot
                  </label>
                  <input
                    id="foot"
                    name="foot"
                    defaultValue={current.foot || ""}
                    list="preferred-foot-options"
                    className={inputClass}
                  />
                  <datalist id="preferred-foot-options">
                    <option value="Left" />
                    <option value="Right" />
                    <option value="Both" />
                  </datalist>
                </div>
                <div>
                  <label htmlFor="height" className={labelClass}>
                    Height
                  </label>
                  <input
                    id="height"
                    name="height"
                    defaultValue={current.height}
                    maxLength={50}
                    placeholder="For example: 183 cm"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="position" className={labelClass}>
                  Primary position
                </label>
                <select
                  id="position"
                  name="position"
                  defaultValue={
                    PLAYER_POSITIONS.includes(
                      current.position as (typeof PLAYER_POSITIONS)[number],
                    )
                      ? current.position
                      : ""
                  }
                  className={inputClass}
                >
                  <option value="">Leave unchanged</option>
                  {PLAYER_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="secondaryPosition" className={labelClass}>
                  Secondary position
                </label>
                <select
                  id="secondaryPosition"
                  name="secondaryPosition"
                  defaultValue={
                    PLAYER_POSITIONS.includes(
                      current.secondaryPosition as (typeof PLAYER_POSITIONS)[number],
                    )
                      ? current.secondaryPosition
                      : ""
                  }
                  className={inputClass}
                >
                  <option value="">Leave unchanged</option>
                  {current.secondaryPosition && (
                    <option value="__remove__">
                      Remove secondary position
                    </option>
                  )}
                  {PLAYER_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="picLink" className={labelClass}>
                  Picture link
                </label>
                <input
                  id="picLink"
                  name="picLink"
                  type="url"
                  defaultValue={current.picLink}
                  maxLength={1000}
                  placeholder="https://…"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="biography" className={labelClass}>
                  Biography
                </label>
                <textarea
                  id="biography"
                  name="biography"
                  defaultValue={current.biography}
                  rows={8}
                  maxLength={10000}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <div>
                <label htmlFor="profileSource" className={labelClass}>
                  Source <span className="font-normal">(optional)</span>
                </label>
                <textarea
                  id="profileSource"
                  name="source"
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe where this information came from, if available"
                  className={`${inputClass} resize-y`}
                />
              </div>
              <div>
                <label htmlFor="profileExplanation" className={labelClass}>
                  Additional notes{" "}
                  <span className="font-normal">(optional)</span>
                </label>
                <textarea
                  id="profileExplanation"
                  name="explanation"
                  rows={3}
                  maxLength={1000}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {isSubmitting ? "Sending…" : "Submit changes for review"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
