export interface SelectBoxOption {
  value: string;
  label: string;
}

export function FilterBox(props: {
  title: string;
  default?: string;
  identifier: string;
  options: SelectBoxOption[];
  includeAll: boolean;
}) {
  return (
    <div>
      <label htmlFor="season" className="block text-sm font-medium leading-6">
        {props.title}
      </label>
      <div>
        <select
          id={props.identifier}
          defaultValue={props.default}
          name={props.identifier}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
        >
          {props.includeAll ? <option value="">All</option> : ""}
          {props.options.map((s, idx) => (
            <option key={idx} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
