import Image from "next/image";

export function Kit(props: { season: string; image: string }) {
  return (
    <>
      <Image
        alt={props.season}
        width={100}
        height={100}
        unoptimized={true}
        src={props.image}
        className="mx-auto h-24 w-24 rounded-full"
      />
      <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">
        {props.season}
      </h3>
    </>
  );
}
