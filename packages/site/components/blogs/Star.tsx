import { ArrowRightIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export function Star(props: {
  name: string;
  notes: string;
  match: string;
  season: string;
  date: string;
  programme: string;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8] transition hover:-translate-y-1 hover:border-blue-700 hover:shadow-[7px_7px_0_#132c82]">
      <div className="grid flex-1 grid-cols-[104px_minmax(0,1fr)] gap-5 p-5">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#e8e2d6]">
          <Image
            alt={`Programme from ${props.match}`}
            fill
            sizes="104px"
            src={props.programme}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
            Opposition star
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.025em]">
            {props.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#071a2b]/65">
            {props.notes}
          </p>
        </div>
      </div>
      <div className="border-t border-[#071a2b]/15 bg-[#f4f0e8] px-5 py-4">
        <p className="text-sm font-semibold leading-6">{props.match}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/50">
            <CalendarDaysIcon className="h-4 w-4" />
            {props.season} · {props.date}
          </span>
          <Link
            href={`/match/${props.season}/${props.date}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700"
          >
            View match report
            <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
