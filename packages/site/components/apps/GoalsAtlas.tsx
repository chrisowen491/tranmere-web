"use client";

import {
  ASSIST_TYPES,
  CROSS_SIDES,
  GOAL_DISTANCES,
  GOAL_FEET,
  GOAL_TYPES,
} from "@tranmere-web/lib/src/goal-constants";
import type { GoalAtlasFilterOptions } from "@tranmere-web/lib/src/d1-queries";
import type { GoalAtlasSummaryRow } from "@tranmere-web/lib/src/d1-types";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import Link from "next/link";
import { useRef, useState } from "react";
import type { GoalAtlasData } from "@/lib/goalAtlas";
import { SearchPagination } from "@/components/apps/partials/SearchPagination";

type Filters = {
  season: string;
  competition: string;
  scorer: string;
  opposition: string;
  period: string;
  minuteFrom: string;
  minuteTo: string;
  goalType: string;
  foot: string;
  assistType: string;
  crossSide: string;
  distance: string;
};

const emptyFilters: Filters = {
  season: "",
  competition: "",
  scorer: "",
  opposition: "",
  period: "",
  minuteFrom: "",
  minuteTo: "",
  goalType: "",
  foot: "",
  assistType: "",
  crossSide: "",
  distance: "",
};

const inputClass =
  "block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-3 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15";
const labelClass =
  "mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/55";

const atlasDistanceLabels = {
  "6YardBox": "Inside six-yard box",
  "18YardBox": "Inside 18, outside six-yard box",
  LongRange: "Outside 18-yard box",
} as const;

function completeness(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function CompletionGrid({ summary }: { summary: GoalAtlasSummaryRow }) {
  const fields = [
    ["Minute", summary.minute_complete],
    ["Goal type", summary.goal_type_complete],
    ["Foot", summary.foot_complete],
    ["Assist type", summary.assist_type_complete],
    ["Distance", summary.distance_complete],
    ["Cross side", summary.cross_side_complete],
  ] as const;
  return (
    <dl className="grid grid-cols-2 gap-px bg-[#071a2b]/15 sm:grid-cols-3 lg:grid-cols-6">
      {fields.map(([label, value]) => (
        <div key={label} className="bg-[#fffdf8] p-4">
          <dd className="font-mono text-xl font-bold">
            {completeness(value, summary.total)}%
          </dd>
          <dt className="mt-1 text-xs text-[#071a2b]/55">{label} recorded</dt>
        </div>
      ))}
    </dl>
  );
}

function Bars({
  title,
  rows,
}: {
  title: string;
  rows: GoalAtlasData["periods"];
}) {
  const maximum = Math.max(1, ...rows.map(({ total }) => total));
  return (
    <section className="bg-[#fffdf8] p-5 sm:p-6">
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <ul className="mt-5 space-y-3">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex justify-between gap-4 text-xs">
              <span className="font-semibold">{row.label}</span>
              <span className="font-mono font-bold">{row.total}</span>
            </div>
            <div className="mt-1.5 h-2 bg-[#e8e2d6]" aria-hidden="true">
              <div
                className="h-full bg-blue-700"
                style={{
                  width: `${Math.max(2, (row.total / maximum) * 100)}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GoalsAtlas({
  initialData,
  options,
}: {
  initialData: GoalAtlasData;
  options: GoalAtlasFilterOptions;
}) {
  const [filters, setFilters] = useState(emptyFilters);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  function changeFilter(name: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function search(nextFilters: Filters, cursor = 0) {
    const request = ++requestId.current;
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/goal-atlas?${new URLSearchParams({
          ...nextFilters,
          cursor: String(cursor),
          limit: "50",
        })}`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error("Goal atlas search failed");
      const nextData = (await response.json()) as GoalAtlasData;
      if (request === requestId.current) setData(nextData);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        throw error;
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }

  function reset() {
    setFilters(emptyFilters);
    void search(emptyFilters);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void search(filters);
        }}
        className="border border-[#071a2b]/15 bg-[#fffdf8]"
      >
        <div className="border-b border-[#071a2b]/15 bg-[#e8e2d6] px-5 py-5 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Build a view
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Filter the goals
          </h2>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          <label>
            <span className={labelClass}>Season</span>
            <select
              className={inputClass}
              value={filters.season}
              onChange={(e) => changeFilter("season", e.target.value)}
            >
              <option value="">All seasons</option>
              {GetSeasons().map((season) => (
                <option key={season} value={season}>
                  {season}/{String(season + 1).slice(-2)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Scorer</span>
            <select
              className={inputClass}
              value={filters.scorer}
              onChange={(e) => changeFilter("scorer", e.target.value)}
            >
              <option value="">All scorers</option>
              {options.scorers.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Opposition</span>
            <select
              className={inputClass}
              value={filters.opposition}
              onChange={(e) => changeFilter("opposition", e.target.value)}
            >
              <option value="">All opposition</option>
              {options.oppositions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Competition</span>
            <select
              className={inputClass}
              value={filters.competition}
              onChange={(e) => changeFilter("competition", e.target.value)}
            >
              <option value="">All competitions</option>
              {options.competitions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Match period</span>
            <select
              className={inputClass}
              value={filters.period}
              onChange={(e) => changeFilter("period", e.target.value)}
            >
              <option value="">Any period</option>
              <option value="first-half">First half</option>
              <option value="second-half">Second half</option>
              <option value="extra-time">Extra time</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={labelClass}>Minute from</span>
              <input
                className={inputClass}
                type="number"
                min="1"
                max="130"
                value={filters.minuteFrom}
                onChange={(e) => changeFilter("minuteFrom", e.target.value)}
              />
            </label>
            <label>
              <span className={labelClass}>Minute to</span>
              <input
                className={inputClass}
                type="number"
                min="1"
                max="130"
                value={filters.minuteTo}
                onChange={(e) => changeFilter("minuteTo", e.target.value)}
              />
            </label>
          </div>
          {[
            ["goalType", "Goal type", GOAL_TYPES],
            ["foot", "Foot / contact", GOAL_FEET],
            ["assistType", "Assist type", ASSIST_TYPES],
            ["crossSide", "Cross side", CROSS_SIDES],
          ].map(([name, label, values]) => (
            <label key={name as string}>
              <span className={labelClass}>{label as string}</span>
              <select
                className={inputClass}
                value={filters[name as keyof Filters]}
                onChange={(e) =>
                  changeFilter(name as keyof Filters, e.target.value)
                }
              >
                <option value="">Any</option>
                {(values as readonly string[]).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          ))}
          <label>
            <span className={labelClass}>Goal distance</span>
            <select
              className={inputClass}
              value={filters.distance}
              onChange={(e) => changeFilter("distance", e.target.value)}
            >
              <option value="">Any distance</option>
              {GOAL_DISTANCES.map((value) => (
                <option key={value} value={value}>
                  {atlasDistanceLabels[value]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-[#071a2b]/15 px-5 py-4 sm:px-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Exploring…" : "Explore goals"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={loading}
            className="border border-[#071a2b]/20 px-5 py-3 text-sm font-bold transition hover:bg-[#e8e2d6] disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>

      <section className="mt-10" aria-labelledby="atlas-summary">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Selection summary
            </p>
            <h2
              id="atlas-summary"
              className="mt-2 font-display text-3xl font-semibold"
            >
              {data.summary.total.toLocaleString()} goals
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#071a2b]/55">
            Completeness is shown for the current selection so sparse historical
            metadata is visible rather than mistaken for zero.
          </p>
        </div>
        <div className="mt-5">
          <CompletionGrid summary={data.summary} />
        </div>
        <div className="mt-px grid gap-px bg-[#071a2b]/15 lg:grid-cols-2">
          <Bars title="When goals were scored" rows={data.periods} />
          <Bars title="How goals were scored" rows={data.goalTypes} />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Goal records
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Every matching goal
            </h2>
          </div>
          <p className="font-mono text-xs text-[#071a2b]/50">
            {data.results.length} on this page
          </p>
        </div>
        {data.results.length ? (
          <div className="overflow-x-auto border border-[#071a2b]/15 bg-[#fffdf8] shadow-[5px_5px_0_rgba(7,26,43,0.08)]">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-[#071a2b] font-mono text-[10px] uppercase tracking-[0.1em] text-white/55">
                <tr>
                  <th className="px-3 py-3.5">Minute</th>
                  <th className="px-3 py-3.5">Scorer</th>
                  <th className="px-3 py-3.5">Match</th>
                  <th className="px-3 py-3.5">Score</th>
                  <th className="px-3 py-3.5">Goal</th>
                  <th className="px-3 py-3.5">Assist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071a2b]/10">
                {data.results.map((goal) => (
                  <tr key={goal.id} className="hover:bg-blue-50/60">
                    <td className="px-3 py-4 font-mono font-bold text-blue-700">
                      {goal.minute ? `${goal.minute.replace(/'$/, "")}'` : "—"}
                    </td>
                    <td className="px-3 py-4">
                      <Link
                        className="font-bold text-blue-700 hover:underline"
                        href={`/page/player/${encodeURIComponent(goal.scorer)}`}
                      >
                        {goal.scorer}
                      </Link>
                    </td>
                    <td className="px-3 py-4">
                      <Link
                        className="font-semibold hover:text-blue-700"
                        href={`/games/${encodeURIComponent(goal.opposition)}`}
                      >
                        {goal.opposition}
                      </Link>
                      <span className="mt-1 block font-mono text-[10px] text-[#071a2b]/45">
                        {goal.match_date} ·{" "}
                        {goal.competition || "Competition unknown"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <Link
                        className="inline-flex bg-blue-700 px-2 py-1.5 font-mono text-xs font-bold text-white hover:bg-blue-800"
                        href={`/match/${goal.season}/${goal.match_date}`}
                      >
                        {goal.full_time_score || "Report"}
                      </Link>
                    </td>
                    <td className="px-3 py-4">
                      <span className="font-semibold">
                        {goal.goal_type || "Unknown"}
                      </span>
                      <span className="mt-1 block text-xs text-[#071a2b]/50">
                        {goal.foot || "Contact unknown"} ·{" "}
                        {goal.distance
                          ? atlasDistanceLabels[goal.distance]
                          : "Distance unknown"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      {goal.assist || "—"}
                      <span className="mt-1 block text-xs text-[#071a2b]/50">
                        {goal.assist_type || "Type unknown"}
                        {goal.cross_side ? ` · ${goal.cross_side}` : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-14 text-center">
            <p className="font-display text-2xl font-semibold">
              No goals match these filters
            </p>
            <p className="mt-3 text-sm text-[#071a2b]/55">
              Broaden the minute range or remove a detail filter and try again.
            </p>
          </div>
        )}
        <SearchPagination
          pagination={data.pagination}
          count={data.results.length}
          loading={loading}
          onPrevious={() =>
            void search(
              filters,
              Math.max(0, data.pagination.cursor - data.pagination.limit),
            )
          }
          onNext={() =>
            data.pagination.nextCursor !== null &&
            void search(filters, data.pagination.nextCursor)
          }
        />
      </section>
    </div>
  );
}
