"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export interface PlayerProfileSearchOption {
  name: string;
  picLink: string | null;
  position: string | null;
}

export function PlayerProfileSearch({
  players,
}: {
  players: PlayerProfileSearchOption[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return [];

    return players
      .filter((player) => player.name.toLowerCase().includes(search))
      .sort((a, b) => {
        const startsWithDifference =
          Number(b.name.toLowerCase().startsWith(search)) -
          Number(a.name.toLowerCase().startsWith(search));
        return startsWithDifference || a.name.localeCompare(b.name);
      })
      .slice(0, 6);
  }, [players, query]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const player = suggestions[0];
    if (player) {
      router.push(`/page/player/${encodeURIComponent(player.name)}`);
    }
  }

  return (
    <section className="border-b border-[#071a2b]/10 bg-[#e8e2d6]">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.45fr)_minmax(0,0.55fr)] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Find a player
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em]">
              Search the profile archive
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#071a2b]/60">
              Start typing a name and open their complete Tranmere profile.
            </p>
          </div>

          <form
            role="search"
            onSubmit={submit}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setOpen(false);
              }
            }}
          >
            <label htmlFor="player-profile-search" className="sr-only">
              Search for a player by name
            </label>
            <div className="relative">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-[#071a2b]/35"
              />
              <input
                id="player-profile-search"
                role="combobox"
                aria-autocomplete="list"
                aria-controls="player-profile-suggestions"
                aria-expanded={open && suggestions.length > 0}
                autoComplete="off"
                value={query}
                placeholder="Search by player name…"
                onFocus={() => setOpen(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpen(false);
                }}
                className="w-full border border-[#071a2b]/20 bg-[#fffdf8] py-4 pl-12 pr-28 text-base font-semibold shadow-[6px_6px_0_rgba(7,26,43,0.06)] outline-none transition placeholder:font-normal placeholder:text-[#071a2b]/35 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
              />
              <button
                type="submit"
                disabled={suggestions.length === 0}
                className="absolute bottom-2 right-2 top-2 bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-[#071a2b] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Open profile
              </button>

              {open && query.trim() && (
                <div
                  id="player-profile-suggestions"
                  role="listbox"
                  className="absolute z-30 mt-2 w-full border border-[#071a2b]/20 bg-[#fffdf8] shadow-xl"
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((player) => (
                      <Link
                        role="option"
                        aria-selected="false"
                        key={player.name}
                        href={`/page/player/${encodeURIComponent(player.name)}`}
                        className="group flex items-center gap-4 border-b border-[#071a2b]/10 px-4 py-3 last:border-b-0 hover:bg-blue-50"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#071a2b] text-xs font-bold text-white">
                          {player.picLink ? (
                            <Image
                              src={player.picLink}
                              alt=""
                              width={88}
                              height={88}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            player.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold group-hover:text-blue-700">
                            {player.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-[#071a2b]/50">
                            {player.position ?? "Player profile"}
                          </span>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-5 text-sm text-[#071a2b]/55">
                      No matching player profile found.
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
