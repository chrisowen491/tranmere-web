import Link from "next/link";
import Image from "next/image";

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
      <Image
        alt={"Programme"}
        height={200}
        width={100}
        src={props.programme}
        className="mx-auto h-24 w-24 rounded-full"
      />
      <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">
        {props.name}
      </h3>
      <p>{props.notes}</p>
      <p>{props.match}</p>
      <p>
        <Link href={`/match/${props.season}/${props.date}`} className="">
          Report
        </Link>
      </p>
    </>
  );
}
