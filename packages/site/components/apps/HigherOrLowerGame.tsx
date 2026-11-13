"use client";

import {
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  answerForRound,
  scoreAnswers,
  type ComparisonPlayer,
  type ComparisonRound,
  type Direction,
} from "@/lib/higherOrLower";

type SavedGame = {
  answers: Direction[];
  currentRound: number;
  puzzleKey: string;
};

function playerHref(name: string) {
  return `/page/player/${encodeURIComponent(name)}`;
}

function PlayerCard({
  player,
  metric,
  value,
  label,
}: {
  player: ComparisonPlayer;
  metric: ComparisonRound["metric"];
  value: number | null;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col border border-white/20 bg-white/[0.04]">
      <div className="relative flex h-56 items-end justify-center overflow-hidden bg-[#132c82] sm:h-72">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <Image
          src={player.image}
          alt=""
          width={320}
          height={320}
          unoptimized
          className="relative h-full w-full object-contain object-bottom"
        />
      </div>
      <div className="flex flex-1 flex-col border-t border-white/20 p-5 sm:p-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
          {label}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
          {player.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-white/50">
            {metric === "appearances" ? "Appearances" : "Goals"}
          </span>
          <strong className="font-mono text-5xl font-bold leading-none text-white">
            {value === null ? "?" : value.toLocaleString("en-GB")}
          </strong>
        </div>
      </div>
    </div>
  );
}

export function HigherOrLowerGame({
  date,
  gameNumber,
  rounds,
}: {
  date: string;
  gameNumber: number;
  rounds: ComparisonRound[];
}) {
  const storageKey = `tranmere-higher-or-lower-${date}`;
  const puzzleKey = rounds
    .map(
      (round) =>
        `${round.metric}:${round.baseline.name}:${round.baseline[round.metric]}:${round.challenger.name}:${round.challenger[round.metric]}`,
    )
    .join("|");
  const [answers, setAnswers] = useState<Direction[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(storageKey) ?? "null",
      ) as SavedGame | null;
      if (saved?.puzzleKey === puzzleKey && Array.isArray(saved.answers)) {
        const validAnswers = saved.answers
          .filter((answer) => answer === "higher" || answer === "lower")
          .slice(0, rounds.length);
        setAnswers(validAnswers);
        setCurrentRound(
          Number.isInteger(saved.currentRound)
            ? Math.min(Math.max(0, saved.currentRound), validAnswers.length)
            : validAnswers.length,
        );
      } else {
        setAnswers([]);
        setCurrentRound(0);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    setLoaded(true);
  }, [puzzleKey, rounds.length, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ answers, currentRound, puzzleKey }),
    );
  }, [answers, currentRound, loaded, puzzleKey, storageKey]);

  const { score, streak, bestStreak } = scoreAnswers(rounds, answers);
  const round = rounds[currentRound];
  const selected = answers[currentRound];
  const correct = round && selected === answerForRound(round);
  const complete = rounds.length > 0 && currentRound === rounds.length;

  function choose(direction: Direction) {
    if (!loaded || !round || selected) return;
    setAnswers((previous) => [...previous, direction]);
  }

  async function shareResult() {
    const marks = answers
      .map((answer, index) =>
        answer === answerForRound(rounds[index]) ? "🟩" : "⬜",
      )
      .join("");
    const result = `Tranmere Higher or Lower #${gameNumber}\n${marks} ${score}/${rounds.length}\n🔥 ${bestStreak} best streak\n${window.location.origin}/higher-or-lower`;
    try {
      await navigator.clipboard.writeText(result);
      setShareStatus("Result copied");
    } catch {
      setShareStatus("Could not copy result");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-14 sm:px-10 lg:px-12 lg:pt-20">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Daily archive game · #{gameNumber}
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
          Higher or Lower
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#071a2b]/65">
          Which Rovers player has more recorded appearances or goals? Make ten
          calls, build a streak and see how well you know the archive.
        </p>
        <div className="mt-8 grid max-w-2xl grid-cols-3 border border-[#071a2b]/15 bg-[#fffdf8]">
          {[
            { value: `${score}/${rounds.length}`, label: "Correct" },
            { value: streak, label: "Current streak" },
            { value: bestStreak, label: "Best streak" },
          ].map((item) => (
            <div
              key={item.label}
              className="border-r border-[#071a2b]/15 px-4 py-4 last:border-r-0 sm:px-6"
            >
              <strong className="block font-mono text-2xl font-bold sm:text-3xl">
                {item.value}
              </strong>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/50">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          {rounds.length === 0 ? (
            <div className="border border-white/20 bg-white/[0.04] p-8">
              <h2 className="font-display text-3xl font-semibold">
                No comparison available today
              </h2>
              <p className="mt-3 text-white/60">
                The player archive does not have enough comparable records yet.
              </p>
              <Link
                href="/players"
                className="mt-6 inline-flex text-sm font-bold text-blue-300 hover:text-white"
              >
                Explore the player archive →
              </Link>
            </div>
          ) : complete ? (
            <div className="max-w-3xl border border-white/20 bg-white/[0.04] p-7 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-blue-300">
                Full time · {rounds.length} rounds
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
                You scored {score} out of {rounds.length}
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/65">
                Best run: {bestStreak} correct in a row. There’ll be a new set
                of players tomorrow.
              </p>
              <button
                type="button"
                onClick={shareResult}
                className="mt-7 inline-flex items-center gap-2 bg-blue-300 px-5 py-3 text-sm font-bold text-[#071a2b] hover:bg-blue-200"
              >
                <ClipboardDocumentIcon aria-hidden="true" className="h-5 w-5" />
                Share result
              </button>
              <p aria-live="polite" className="mt-3 text-sm text-blue-300">
                {shareStatus}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-blue-300">
                    Round {String(currentRound + 1).padStart(2, "0")} /{" "}
                    {rounds.length}
                  </p>
                  <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
                    Does {round.challenger.name} have more or fewer recorded{" "}
                    {round.metric}?
                  </h2>
                </div>
                <span className="border border-white/25 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-white/70">
                  {round.metric === "appearances" ? "Appearances" : "Goals"}
                </span>
              </div>

              <div
                className="mt-7 grid grid-cols-10 gap-1"
                aria-label="Round progress"
              >
                {rounds.map((item, index) => (
                  <span
                    key={`${item.baseline.name}-${index}`}
                    aria-label={`Round ${index + 1}: ${
                      answers[index]
                        ? answers[index] === answerForRound(item)
                          ? "correct"
                          : "incorrect"
                        : index === currentRound
                          ? "current"
                          : "not played"
                    }`}
                    className={`h-1.5 ${
                      answers[index]
                        ? answers[index] === answerForRound(item)
                          ? "bg-emerald-400"
                          : "bg-rose-400"
                        : index === currentRound
                          ? "bg-blue-300"
                          : "bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <PlayerCard
                  player={round.baseline}
                  metric={round.metric}
                  value={round.baseline[round.metric]}
                  label="The benchmark"
                />
                <PlayerCard
                  player={round.challenger}
                  metric={round.metric}
                  value={selected ? round.challenger[round.metric] : null}
                  label="Higher or lower?"
                />
              </div>

              {selected ? (
                <div
                  aria-live="polite"
                  className={`mt-6 border-l-4 p-5 sm:p-6 ${
                    correct
                      ? "border-emerald-400 bg-emerald-400/10"
                      : "border-rose-400 bg-rose-400/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {correct ? (
                      <CheckCircleIcon
                        aria-hidden="true"
                        className="mt-0.5 h-6 w-6 flex-none text-emerald-400"
                      />
                    ) : (
                      <XCircleIcon
                        aria-hidden="true"
                        className="mt-0.5 h-6 w-6 flex-none text-rose-400"
                      />
                    )}
                    <div>
                      <p className="font-bold">
                        {correct ? "Correct call." : "Not this time."}{" "}
                        {round.challenger.name} has{" "}
                        {round.challenger[round.metric].toLocaleString("en-GB")}{" "}
                        recorded {round.metric} — {answerForRound(round)} than{" "}
                        {round.baseline.name}.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                        {[round.baseline, round.challenger].map((player) => (
                          <Link
                            key={player.name}
                            href={playerHref(player.name)}
                            className="font-semibold text-blue-300 hover:text-white"
                          >
                            {player.name}’s profile →
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentRound((index) => index + 1)}
                    className="mt-5 inline-flex items-center gap-2 bg-blue-300 px-5 py-3 text-sm font-bold text-[#071a2b] hover:bg-blue-200"
                  >
                    {currentRound + 1 === rounds.length
                      ? "See your result"
                      : "Next comparison"}
                    <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => choose("higher")}
                    disabled={!loaded}
                    className="inline-flex items-center justify-center gap-3 border border-blue-300 bg-blue-300 px-5 py-4 text-sm font-bold text-[#071a2b] transition hover:bg-blue-200 disabled:opacity-50"
                  >
                    <ArrowTrendingUpIcon
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                    Higher
                  </button>
                  <button
                    type="button"
                    onClick={() => choose("lower")}
                    disabled={!loaded}
                    className="inline-flex items-center justify-center gap-3 border border-white/35 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <ArrowTrendingDownIcon
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                    Lower
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {answers.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Your scorecard
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
            Every call counts
          </h2>
          <ol className="mt-6 divide-y divide-[#071a2b]/10 border-y border-[#071a2b]/15">
            {answers.map((answer, index) => {
              const item = rounds[index];
              const wasCorrect = answer === answerForRound(item);
              return (
                <li
                  key={`${item.baseline.name}-${index}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4 text-sm"
                >
                  <span className="w-8 font-mono text-xs text-[#071a2b]/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold">
                    <Link
                      href={playerHref(item.baseline.name)}
                      className="hover:text-blue-700 hover:underline"
                    >
                      {item.baseline.name}
                    </Link>{" "}
                    ({item.baseline[item.metric].toLocaleString("en-GB")}) →{" "}
                    <Link
                      href={playerHref(item.challenger.name)}
                      className="hover:text-blue-700 hover:underline"
                    >
                      {item.challenger.name}
                    </Link>{" "}
                    ({item.challenger[item.metric].toLocaleString("en-GB")})
                  </span>
                  <span className="font-mono text-xs uppercase text-[#071a2b]/50">
                    {item.metric}
                  </span>
                  <span
                    className={`ml-auto font-mono text-xs font-bold uppercase ${
                      wasCorrect ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {wasCorrect ? "Correct" : "Incorrect"}
                  </span>
                </li>
              );
            })}
          </ol>
          {complete && (
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold text-blue-700">
              <Link href="/who-am-i" className="hover:underline">
                Play Who am I? →
              </Link>
              <Link href="/name-the-xi" className="hover:underline">
                Play Name the XI →
              </Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
