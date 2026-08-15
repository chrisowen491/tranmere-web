"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import * as React from "react";

type SearchResult = {
  objectId: string;
  type: "player" | "club" | "season";
  title: string;
  description: string;
  href: string;
};

type SearchResponse = { results?: SearchResult[]; error?: string };

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const searchId = React.useId();

  React.useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}&limit=8`,
          { signal: controller.signal },
        );
        const body = (await response.json()) as SearchResponse;
        if (!response.ok) throw new Error(body.error || "Search failed");
        setResults(body.results ?? []);
        setOpen(true);
        setActiveIndex(-1);
      } catch (cause) {
        if ((cause as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  React.useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function choose(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1,
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      choose(results[activeIndex]);
    }
  }

  const showPanel = open && query.trim().length >= 2;

  return (
    <div
      ref={containerRef}
      className={`navsearch relative w-full ${className}`}
    >
      <div className="relative">
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65"
        />
        <input
          type="search"
          role="combobox"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search archive"
          aria-label="Search players, clubs and seasons"
          aria-autocomplete="list"
          aria-controls={`${searchId}-results`}
          aria-expanded={showPanel}
          aria-activedescendant={
            activeIndex >= 0 ? `${searchId}-result-${activeIndex}` : undefined
          }
          className="h-10 w-full rounded-none border border-white/20 bg-white/[0.04] py-0 pl-10 pr-9 text-sm text-white placeholder:text-white/50 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear archive search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/65 hover:text-white"
          >
            <XMarkIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          id={`${searchId}-results`}
          role="listbox"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-[100] w-full border border-[#071a2b]/15 bg-[#fffdf8] text-[#071a2b] shadow-[5px_5px_0_rgba(7,26,43,0.12)]"
        >
          {loading ? (
            <p className="px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-[#071a2b]/55">
              Searching the archive…
            </p>
          ) : results.length ? (
            <ul className="divide-y divide-[#071a2b]/10">
              {results.map((result, index) => (
                <li
                  key={result.objectId}
                  id={`${searchId}-result-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(result)}
                    className={`block w-full px-4 py-3 text-left transition ${
                      activeIndex === index
                        ? "bg-blue-700 text-white"
                        : "hover:bg-blue-50/70"
                    }`}
                  >
                    <span className="block text-sm font-bold">
                      {result.title}
                    </span>
                    <span
                      className={`mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] ${
                        activeIndex === index
                          ? "text-blue-100"
                          : "text-blue-700"
                      }`}
                    >
                      {result.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-4">
              <p className="font-display text-base font-semibold">
                No archive entries found
              </p>
              <p className="mt-1 text-xs text-[#071a2b]/60">
                Try another player, club or season.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
