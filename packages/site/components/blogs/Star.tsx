export function Star(props: {
  name: string;
  notes: string;
  match: string;
  season: string;
  date: string;
  programme: string;
}) {
  return (
    <>
      <img alt={"Programme"} src={props.programme} className="mx-auto h-24 w-24 rounded-full" />
      <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">{props.name}</h3>
      <p>{props.notes}</p>
      <p>{props.match}</p>
      <p><a href={`/match/${props.season}/${props.date}`} className="">Report</a></p>
    </>
  );
}
