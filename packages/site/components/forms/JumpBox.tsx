"use client";

export function JumpBox(props: { season: string; seasons: number[] }) {
  return (
    <div className="w-1/2 pt-8">
      <select
        id="switch"
        name="switch"
        defaultValue={props.season}
        onChange={(e) => {
          location.href = "/season/" + parseInt(e.target.value);
        }}
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6"
      >
        {props.seasons.map((season) => (
          <option key={season}>{season}</option>
        ))}
      </select>
    </div>
  );
}
