"use client";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  EyeSlashIcon,
  LightBulbIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type DailyPlayer = {
  name: string;
  position: string;
  image: string;
  firstSeason?: string;
  lastSeason?: string;
  appearances: number;
  goals: number;
  debutDate?: string;
  debutOpposition?: string;
};

type SavedGame = {
  guesses: string[];
  gaveUp: boolean;
};

const maxAttempts = 5;

function careerLabel(player: DailyPlayer) {
  if (!player.firstSeason) return "Career dates are not recorded";
  if (!player.lastSeason || player.firstSeason === player.lastSeason) {
    return `Appeared during the ${player.firstSeason}–${String(Number(player.firstSeason) + 1).slice(-2)} season`;
  }
  return `Rovers career spans ${player.firstSeason}–${String(Number(player.lastSeason) + 1).slice(-2)}`;
}

function namePattern(name: string) {
  const words = name.split(/\s+/);
  return `${words.length} word${words.length === 1 ? "" : "s"}, ${name.replace(/\s/g, "").length} letters · initials ${words.map((word) => word[0]).join("")}`;
}

function formatDebutDate(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function calculateStreak(date: string, history: Record<string, string>) {
  let streak = 0;
  const cursor = new Date(`${date}T00:00:00Z`);
  while (history[cursor.toISOString().slice(0, 10)] === "won") {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function WhoAmIGame(props: {
  date: string;
  gameNumber: number;
  candidates: string[];
  player: DailyPlayer;
}) {
  const storageKey = `tranmere-who-am-i-${props.date}`;
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gaveUp, setGaveUp] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [streak, setStreak] = useState(0);

  const solved = guesses.some(
    (guess) => guess.toLowerCase() === props.player.name.toLowerCase(),
  );
  const finished = solved || gaveUp || guesses.length >= maxAttempts;
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return props.candidates
      .filter(
        (candidate) =>
          candidate.toLowerCase().includes(normalized) &&
          !guesses.includes(candidate),
      )
      .slice(0, 8);
  }, [guesses, props.candidates, query]);

  const clues = [
    `Primary position: ${props.player.position}`,
    careerLabel(props.player),
    props.player.appearances > 0
      ? `${props.player.appearances} recorded appearances and ${props.player.goals} goals`
      : `This player is represented in the avatar archive`,
    props.player.debutOpposition
      ? `Debut: ${formatDebutDate(props.player.debutDate)} against ${props.player.debutOpposition}`
      : `The name begins with “${props.player.name.charAt(0)}”`,
    namePattern(props.player.name),
  ];
  const visibleClueCount = finished
    ? clues.length
    : Math.min(guesses.length + 1, clues.length);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const game = JSON.parse(saved) as SavedGame;
        setGuesses(game.guesses ?? []);
        setGaveUp(game.gaveUp ?? false);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    const history = JSON.parse(
      window.localStorage.getItem("tranmere-who-am-i-history") ?? "{}",
    ) as Record<string, string>;
    setStreak(calculateStreak(props.date, history));
    setLoaded(true);
  }, [props.date, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ guesses, gaveUp }),
    );
    if (solved || gaveUp || guesses.length >= maxAttempts) {
      const history = JSON.parse(
        window.localStorage.getItem("tranmere-who-am-i-history") ?? "{}",
      ) as Record<string, string>;
      history[props.date] = solved ? "won" : "lost";
      window.localStorage.setItem(
        "tranmere-who-am-i-history",
        JSON.stringify(history),
      );
      setStreak(calculateStreak(props.date, history));
    }
  }, [gaveUp, guesses, loaded, props.date, solved, storageKey]);

  function submitGuess(event: FormEvent) {
    event.preventDefault();
    if (finished) return;
    const exactPlayer = props.candidates.find(
      (candidate) => candidate.toLowerCase() === query.trim().toLowerCase(),
    );
    if (!exactPlayer) {
      setMessage("Choose a player from the suggestions.");
      return;
    }
    setGuesses((current) => [...current, exactPlayer]);
    setQuery("");
    setMessage(
      exactPlayer.toLowerCase() === props.player.name.toLowerCase()
        ? "Correct — you found today’s player."
        : "Not today’s player. Another clue has been unlocked.",
    );
  }

  async function shareResult() {
    const marks = guesses
      .map((guess) =>
        guess.toLowerCase() === props.player.name.toLowerCase() ? "🟩" : "⬜",
      )
      .join("");
    const result = `Tranmere Who Am I? #${props.gameNumber}\n${marks || "⬛"} ${solved ? `${guesses.length}/${maxAttempts}` : "X/5"}\n🔥 ${streak}\n${window.location.origin}/who-am-i`;
    try {
      await navigator.clipboard.writeText(result);
      setShareStatus("Result copied");
    } catch {
      setShareStatus("Could not copy result");
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-20">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Daily archive game · #{props.gameNumber}
              </p>
              <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Who am I?
              </h1>
              <p className="mt-5 max-w-md text-lg leading-8 text-white/60">
                Identify today’s Tranmere player. Every wrong answer reveals
                another clue.
              </p>
            </div>
            <div className="mt-10 flex gap-8 border-t border-white/15 pt-6">
              <div>
                <strong className="block font-display text-2xl">
                  {Math.max(0, maxAttempts - guesses.length)}
                </strong>
                <span className="text-xs uppercase tracking-wider text-white/45">
                  Attempts left
                </span>
              </div>
              <div>
                <strong className="block font-display text-2xl">
                  {streak}
                </strong>
                <span className="text-xs uppercase tracking-wider text-white/45">
                  Day streak
                </span>
              </div>
            </div>
          </div>

          <div className="border border-white/15 bg-white/[0.04] p-5 sm:p-8">
            <div className="grid gap-8 sm:grid-cols-[170px_1fr]">
              <div className="relative mx-auto h-48 w-40 overflow-hidden bg-[#e8e2d6] sm:mx-0">
                <Image
                  src={props.player.image}
                  alt={finished ? props.player.name : "Mystery player"}
                  fill
                  unoptimized
                  className={`object-contain transition duration-500 ${
                    finished ? "" : "scale-110 blur-xl grayscale brightness-0"
                  }`}
                />
                {!finished && (
                  <span className="absolute inset-0 grid place-items-center font-display text-7xl font-semibold text-white">
                    ?
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                  Clues revealed · {visibleClueCount}/{clues.length}
                </p>
                <ol className="mt-4 space-y-3">
                  {clues.slice(0, visibleClueCount).map((clue, index) => (
                    <li
                      key={clue}
                      className="flex gap-3 border-b border-white/10 pb-3 text-sm leading-6 text-white/75"
                    >
                      <LightBulbIcon
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 flex-none text-emerald-400"
                      />
                      <span>
                        <span className="mr-2 font-mono text-white/35">
                          0{index + 1}
                        </span>
                        {clue}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {!finished ? (
              <form className="relative mt-8" onSubmit={submitGuess}>
                <label
                  htmlFor="player-guess"
                  className="text-xs font-bold uppercase tracking-[0.14em] text-white/55"
                >
                  Your guess
                </label>
                <div className="mt-2 flex">
                  <input
                    id="player-guess"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setMessage("");
                    }}
                    autoComplete="off"
                    className="min-w-0 flex-1 border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-emerald-400"
                    placeholder="Start typing a player name"
                  />
                  <button
                    className="bg-emerald-400 px-5 py-3 text-sm font-bold text-[#071a2b] transition hover:bg-emerald-300"
                    type="submit"
                  >
                    Guess
                  </button>
                </div>
                {suggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto border border-[#071a2b]/15 bg-[#fffdf8] text-[#071a2b] shadow-xl">
                    {suggestions.map((candidate) => (
                      <li key={candidate}>
                        <button
                          type="button"
                          onClick={() => setQuery(candidate)}
                          className="w-full border-b border-[#071a2b]/10 px-4 py-3 text-left text-sm font-semibold hover:bg-[#e8e2d6]"
                        >
                          {candidate}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p aria-live="polite" className="text-sm text-white/55">
                    {message}
                  </p>
                  <button
                    type="button"
                    onClick={() => setGaveUp(true)}
                    className="inline-flex flex-none items-center gap-2 text-xs font-bold text-white/45 hover:text-white"
                  >
                    <EyeSlashIcon className="h-4 w-4" />
                    Reveal player
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 border-t border-white/15 pt-7">
                <div className="flex items-start gap-3">
                  {solved ? (
                    <CheckCircleIcon className="h-7 w-7 flex-none text-emerald-400" />
                  ) : (
                    <XCircleIcon className="h-7 w-7 flex-none text-red-400" />
                  )}
                  <div>
                    <p className="text-sm text-white/55">
                      {solved
                        ? "Correct. Today’s player is"
                        : "Today’s player was"}
                    </p>
                    <h2 className="font-display text-3xl font-semibold">
                      {props.player.name}
                    </h2>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={shareResult}
                    className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-bold text-[#071a2b] hover:bg-emerald-300"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    Share result
                  </button>
                  <Link
                    href={`/page/player/${encodeURIComponent(props.player.name)}`}
                    className="inline-flex items-center gap-2 border border-white/25 px-5 py-3 text-sm font-bold hover:border-white"
                  >
                    View player profile
                  </Link>
                </div>
                <p aria-live="polite" className="mt-3 text-sm text-emerald-300">
                  {shareStatus}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {guesses.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-kicker">Your guesses</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">
                Today’s attempt
              </h2>
            </div>
            {finished && (
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#071a2b]/50">
                <ArrowPathIcon className="h-4 w-4" />
                New player tomorrow
              </span>
            )}
          </div>
          <ol className="mt-7 divide-y divide-[#071a2b]/15 border-y border-[#071a2b]/15">
            {guesses.map((guess, index) => {
              const correct =
                guess.toLowerCase() === props.player.name.toLowerCase();
              return (
                <li
                  key={`${guess}-${index}`}
                  className="flex items-center gap-4 py-4"
                >
                  <span className="font-mono text-xs text-[#071a2b]/35">
                    0{index + 1}
                  </span>
                  <span className="font-semibold">{guess}</span>
                  {correct ? (
                    <CheckCircleIcon className="ml-auto h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircleIcon className="ml-auto h-5 w-5 text-red-600" />
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </>
  );
}
