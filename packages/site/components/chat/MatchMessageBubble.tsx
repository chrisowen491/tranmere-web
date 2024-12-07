import { ExtendedMessage } from "@/lib/types";
import { LinkButton } from "../forms/LinkButton";
import Image from "next/image";
import PlayIcon from "@heroicons/react/24/outline/PlayIcon";

export function MatchMessageBubble(props: { message: ExtendedMessage }) {
  return (
    <ul
      role="list"
      className="mx-auto grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
    >
      {props.message.matches!.map((match, idx) => (
        <li
          key={idx}
          className="text-sm leading-6 text-gray-600 dark:text-gray-50"
        >
          {match.programme ? (
            <Image
              alt="Match Programme"
              width={280}
              height={400}
              src={`https://images.tranmere-web.com/${match.programme}`}
              className="h-80 object-cover object-left mx-auto"
            />
          ) : (
            <PlayIcon
              aria-hidden="true"
              className="h-80 w-80 mx-auto text-indigo-600 dark:text-indigo-50"
            />
          )}
          <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight">
            {match.homeTeam} {match.score} {match.awayTeam}
          </h3>
          <p>{match.date}</p>
          <LinkButton
            text="Match Report"
            href={`/match/${match?.season}/${match?.date}`}
          ></LinkButton>
        </li>
      ))}
    </ul>
  );
}
