"use client";

export function JumpBox(props: {
  season: string;
  seasons: number[];
  compact?: boolean;
}) {
  return (
    <div className={props.compact ? "ml-auto w-32" : "w-1/2 pt-8"}>
      <label htmlFor="switch" className="sr-only">
        Choose season
      </label>
      <select
        id="switch"
        name="switch"
        defaultValue={props.season}
        onChange={(e) => {
          location.href = "/season/" + parseInt(e.target.value);
        }}
        className={
          props.compact
            ? "block w-full border border-white/25 bg-white/5 py-2 pl-3 pr-8 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none"
            : "mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6"
        }
      >
        {props.seasons.map((season) => (
          <option className="text-gray-900" key={season}>
            {season}
          </option>
        ))}
      </select>
    </div>
  );
}
