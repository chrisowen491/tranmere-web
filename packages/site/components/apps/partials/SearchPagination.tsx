"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export interface SearchPaginationState {
  cursor: number;
  limit: number;
  nextCursor: number | null;
}

export function SearchPagination(props: {
  pagination: SearchPaginationState;
  count: number;
  loading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { cursor, nextCursor } = props.pagination;
  if (!cursor && nextCursor === null) return null;

  return (
    <nav
      aria-label="Search result pages"
      className="mt-5 flex items-center justify-between gap-4 border border-[#071a2b]/15 bg-[#fffdf8] px-4 py-3"
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
        Showing {cursor + 1}–{cursor + props.count}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={props.onPrevious}
          disabled={!cursor || props.loading}
          className="inline-flex items-center gap-2 border border-[#071a2b]/20 px-3 py-2 text-xs font-bold transition hover:border-blue-700 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Previous
        </button>
        <button
          type="button"
          onClick={props.onNext}
          disabled={nextCursor === null || props.loading}
          className="inline-flex items-center gap-2 bg-[#071a2b] px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </nav>
  );
}
