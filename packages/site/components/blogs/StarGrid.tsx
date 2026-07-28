import type { Block } from "@/lib/types";
import { Star } from "./Star";

export function StarGrid({ stars }: { stars: Block[] }) {
  return (
    <section className="not-prose mt-12 border-t border-[#071a2b]/15 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            Famous visitors
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
            Opposition Hall of Fame
          </h2>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#071a2b]/45">
          {stars.length} Prenton Park appearances
        </p>
      </div>

      <ul role="list" className="mt-7 grid gap-5 md:grid-cols-2">
        {stars.map((star, index) => (
          <li
            key={`${star.name}-${star.date}-${index}`}
            className="list-none p-0"
          >
            <Star
              name={star.name!}
              notes={star.notes!}
              match={star.match!}
              season={star.season!}
              date={star.date!}
              programme={star.programme!}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
