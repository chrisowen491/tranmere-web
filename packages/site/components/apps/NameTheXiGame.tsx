"use client";

import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Puzzle = {
  season: number;
  date: string;
  competition: string;
  opposition: string;
  score: string;
  starters: { name: string; shirtNumber: number | null }[];
};

type SavedGame = { guesses: string[] };
const EMPTY_STARTERS: Puzzle["starters"] = [];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function NameTheXiGame(props: {
  date: string;
  gameNumber: number;
  candidates: string[];
  puzzle: Puzzle | null;
}) {
  const storageKey = `tranmere-name-the-xi-${props.date}`;
  const [guesses, setGuesses] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const starters = props.puzzle?.starters ?? EMPTY_STARTERS;
  const candidates = useMemo(
    () => [
      ...new Set([...props.candidates, ...starters.map(({ name }) => name)]),
    ],
    [props.candidates, starters],
  );
  const found = starters.filter((starter) =>
    guesses.some((guess) => guess.toLowerCase() === starter.name.toLowerCase()),
  );
  const complete = starters.length > 0 && found.length === starters.length;
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return candidates
      .filter(
        (candidate) =>
          candidate.toLowerCase().includes(normalized) &&
          !guesses.some(
            (guess) => guess.toLowerCase() === candidate.toLowerCase(),
          ),
      )
      .slice(0, 8);
  }, [candidates, guesses, query]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const game = JSON.parse(saved) as SavedGame;
        setGuesses(game.guesses ?? []);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ guesses }));
  }, [guesses, loaded, storageKey]);

  function submitGuess(event: FormEvent) {
    event.preventDefault();
    if (complete) return;
    const selected = candidates.find(
      (candidate) => candidate.toLowerCase() === query.trim().toLowerCase(),
    );
    if (!selected) {
      setMessage("Choose a player from the suggestions.");
      return;
    }
    const correct = starters.some(
      (starter) => starter.name.toLowerCase() === selected.toLowerCase(),
    );
    setGuesses((current) => [...current, selected]);
    setQuery("");
    setMessage(
      correct
        ? `${selected} is in the starting eleven.`
        : `${selected} did not start this match.`,
    );
  }

  function addGuess(name: string) {
    if (complete) return;
    const correct = starters.some(
      (starter) => starter.name.toLowerCase() === name.toLowerCase(),
    );
    setGuesses((current) => [...current, name]);
    setQuery("");
    setMessage(
      correct
        ? `${name} is in the starting eleven.`
        : `${name} did not start this match.`,
    );
  }

  async function shareResult() {
    const marks = guesses
      .map((guess) =>
        starters.some(
          (starter) => starter.name.toLowerCase() === guess.toLowerCase(),
        )
          ? "🟩"
          : "⬜",
      )
      .join("");
    const result = `Tranmere Name the XI #${props.gameNumber}\n${marks || "⬛"} ${found.length}/11\n${window.location.origin}/name-the-xi`;
    try {
      await navigator.clipboard.writeText(result);
      setShareStatus("Result copied");
    } catch {
      setShareStatus("Could not copy result");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-20">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                Daily archive game · #{props.gameNumber}
              </p>
              <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Name the XI
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-white/65">
                A match from the archive. Eleven starters to find. Name every
                player you can remember.
              </p>
            </div>
            {props.puzzle && (
              <div className="mt-10 border-t border-white/15 pt-6">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/45">
                  {props.puzzle.competition} · {formatDate(props.puzzle.date)}
                </p>
                <p className="mt-3 font-display text-3xl font-semibold">
                  Tranmere {props.puzzle.score} {props.puzzle.opposition}
                </p>
                <p className="mt-2 text-sm text-white/45">
                  {found.length} of 11 starters found
                </p>
              </div>
            )}
          </div>

          <section
            aria-labelledby="starting-xi-heading"
            className="border border-white/15 bg-white/[0.04] p-5 sm:p-8"
          >
            <div className="flex items-end justify-between border-b border-white/15 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                  {complete ? "Lineup complete" : "Starting lineup"}
                </p>
                <h2
                  id="starting-xi-heading"
                  className="mt-2 font-display text-3xl font-semibold"
                >
                  {complete ? "You named the XI" : "Who started?"}
                </h2>
              </div>
              <span className="font-mono text-2xl font-bold">
                {found.length.toString().padStart(2, "0")}/11
              </span>
            </div>

            {props.puzzle ? (
              <>
                <ol className="mt-5 grid gap-px bg-white/15 sm:grid-cols-2">
                  {starters.map((starter, index) => {
                    const revealed =
                      complete ||
                      guesses.some(
                        (guess) =>
                          guess.toLowerCase() === starter.name.toLowerCase(),
                      );
                    return (
                      <li
                        key={`${starter.name}-${index}`}
                        className={`flex min-h-12 items-center gap-3 px-3 py-2 text-sm ${
                          revealed ? "bg-emerald-950/70" : "bg-[#071a2b]"
                        }`}
                      >
                        <span className="w-7 font-mono text-xs text-white/35">
                          {starter.shirtNumber ??
                            String(index + 1).padStart(2, "0")}
                        </span>
                        {revealed ? (
                          <Link
                            href={`/page/player/${encodeURIComponent(starter.name)}`}
                            className="font-semibold text-white hover:text-blue-200"
                          >
                            {starter.name}
                          </Link>
                        ) : (
                          <span className="text-white/35">Name the player</span>
                        )}
                        {revealed && (
                          <CheckCircleIcon
                            aria-hidden="true"
                            className="ml-auto h-4 w-4 text-emerald-300"
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>

                {!complete && (
                  <form onSubmit={submitGuess} className="mt-6">
                    <label
                      htmlFor="xi-player-guess"
                      className="block text-xs font-bold uppercase tracking-[0.14em] text-white/55"
                    >
                      Enter a player name
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id="xi-player-guess"
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          setMessage("");
                        }}
                        autoComplete="off"
                        aria-describedby="xi-guess-message"
                        className="min-w-0 flex-1 border border-white/20 bg-[#071a2b] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-blue-300 focus:outline-none"
                        placeholder="Start typing a Rovers player"
                        disabled={complete}
                      />
                      <button
                        type="submit"
                        className="bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={complete}
                      >
                        Guess
                      </button>
                    </div>
                    {suggestions.length > 0 && (
                      <ul
                        aria-label="Player suggestions"
                        className="mt-1 divide-y divide-[#071a2b]/10 border border-[#071a2b]/15 bg-[#fffdf8] text-[#071a2b]"
                      >
                        {suggestions.map((name) => (
                          <li key={name}>
                            <button
                              type="button"
                              onClick={() => addGuess(name)}
                              className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-blue-50"
                            >
                              {name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p
                      id="xi-guess-message"
                      role="status"
                      className="mt-3 min-h-5 text-sm text-white/65"
                    >
                      {message || "Guesses can be made in any order."}
                    </p>
                  </form>
                )}

                {(complete || guesses.length > 0) && (
                  <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/15 pt-5">
                    {complete && (
                      <Link
                        href={`/match/${props.puzzle.season}/${props.puzzle.date}`}
                        className="text-sm font-bold text-blue-300 hover:text-white"
                      >
                        View the match →
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={shareResult}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"
                    >
                      <ClipboardDocumentIcon
                        aria-hidden="true"
                        className="h-4 w-4"
                      />
                      Share result
                    </button>
                    <span role="status" className="text-xs text-white/50">
                      {shareStatus}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-6 text-sm leading-6 text-white/65">
                There isn’t a complete recorded starting eleven available for
                today’s quiz. Please check back tomorrow.
              </p>
            )}
          </section>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <Link
          href="/who-am-i"
          className="text-sm font-bold text-blue-700 hover:underline"
        >
          Play Who am I? →
        </Link>
      </div>
    </main>
  );
}
