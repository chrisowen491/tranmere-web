import { LinkButton } from "../forms/LinkButton";
import Image from "next/image";
import { MatchPageData } from "@tranmere-web/lib/src/tranmere-web-types";

export function MatchMessageBubble(props: { message: any }) {
  console.log(props.message);
  const match = JSON.parse(props.message as string) as MatchPageData;
  return (
    <ul
      role="list"
      className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-center mb-4"
    >
        <li
          className="text-sm leading-6 text-gray-50 dark:text-gray-50"
        >
          {match.programme ? (
            <Image
              alt="Match Programme"
              width={150}
              height={400}
              src={`https://images.tranmere-web.com/${match.programme}`}
              className="h-32 w-32 mx-auto"
            />
          ) : (
            ""
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
    </ul>
  );
}
