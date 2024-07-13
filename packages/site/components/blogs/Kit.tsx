export function Kit(props: { season: string; image: string }) {
  return (
    <>
      <img
        alt={props.season}
        src={props.image}
        className="mx-auto h-24 w-24 rounded-full"
      />
      <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">
        {props.season}
      </h3>
    </>
  );
}
