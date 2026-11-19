"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { timelineScore, type ArchiveEvent } from "@/lib/timeMachine";

export function TimeMachineGame({
  cards,
  day,
}: {
  cards: ArchiveEvent[];
  day: string;
}) {
  const [order, setOrder] = useState(cards);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [announcement, announce] = useState("");
  const key = "rovers-time-machine:" + day;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null");
      if (
        Array.isArray(saved?.dates) &&
        saved.dates.length === cards.length &&
        new Set(saved.dates).size === cards.length
      ) {
        const restored = saved.dates.map((date: string) =>
          cards.find((card) => card.date === date),
        );
        if (restored.every(Boolean)) {
          setOrder(restored);
          setDone(saved.done === true);
        }
      }
    } catch {
      /* Storage is optional. */
    }
    setReady(true);
  }, [cards, key]);

  function save(next: ArchiveEvent[], finished: boolean) {
    setOrder(next);
    setDone(finished);
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ dates: next.map((c) => c.date), done: finished }),
      );
    } catch {
      /* Play without storage. */
    }
  }
  function move(index: number, by: number) {
    const next = [...order];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    save(next, false);
    announce(`${order[index].title} moved to position ${index + by + 1}.`);
  }

  const shown = done
    ? [...order].sort((a, b) => a.date.localeCompare(b.date))
    : order;
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-[#071a2b] sm:px-10">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
        Daily archive game · {day}
      </p>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em]">
        Rovers Time Machine
      </h1>
      {!cards.length ? (
        <p className="mt-6">
          There aren’t enough dated archive cards for today’s game.
        </p>
      ) : (
        <>
          <p className="my-5">
            {done
              ? "The archive timeline, earliest first. Your pick shows where you placed each card."
              : "Put the five cards in order, earliest first. Each correctly ordered pair earns one point out of ten."}
          </p>
          {done && (
            <h2
              role="status"
              className="mb-4 font-display text-3xl font-semibold"
            >
              Your score · {timelineScore(order)}/10
            </h2>
          )}
          <ol className="divide-y divide-[#071a2b]/15 border border-[#071a2b]/15 bg-[#fffdf8]">
            {shown.map((card, index) => (
              <li
                key={card.date}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                <span className="font-mono text-lg font-bold">{index + 1}</span>
                {card.image && (
                  <Image
                    unoptimized
                    src={card.image}
                    alt={card.kind}
                    width={56}
                    height={72}
                    className="h-16 w-12 object-contain"
                  />
                )}
                <div className="min-w-40 flex-1">
                  <p className="font-mono text-xs uppercase text-blue-700">
                    {card.kind}
                  </p>
                  <p className="font-display text-lg font-semibold">
                    {card.title}
                  </p>
                  {done && (
                    <p className="text-sm">
                      <time dateTime={card.date}>{card.date}</time> · Your pick
                      #{order.indexOf(card) + 1} ·{" "}
                      <Link
                        className="font-bold text-blue-700 underline"
                        href={card.base + encodeURIComponent(card.target)}
                      >
                        View record
                      </Link>
                    </p>
                  )}
                </div>
                {!done && (
                  <div className="flex gap-1">
                    {[-1, 1].map((by) => (
                      <button
                        key={by}
                        type="button"
                        disabled={!ready || !order[index + by]}
                        onClick={() => move(index, by)}
                        aria-label={`Move ${card.title} ${by < 0 ? "earlier" : "later"}`}
                        className="border border-[#071a2b]/20 px-3 py-2 font-bold text-blue-700 disabled:opacity-30"
                      >
                        {by < 0 ? "↑" : "↓"}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
          <p className="sr-only" role="status">
            {announcement}
          </p>
          {!done && (
            <button
              disabled={!ready}
              onClick={() => save(order, true)}
              className="mt-5 bg-blue-700 px-5 py-3 font-bold text-white"
            >
              Score my timeline
            </button>
          )}
        </>
      )}
    </main>
  );
}
