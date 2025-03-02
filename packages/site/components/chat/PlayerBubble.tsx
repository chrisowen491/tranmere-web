import Image from "next/image";
import { LinkButton } from "../forms/LinkButton";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";

export function PlayerBubble(props: { message: any}) {
  
  const seasons = JSON.parse(props.message as string) as PlayerSeasonSummary[];
  return (
    <ul
      role="list"
      className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-center lg:max-w-none"
    >
      {seasons.map((player, idx) => (
        <li
          key={idx}
          className="text-sm leading-6 text-gray-50 dark:text-gray-50"
        >
          {player.picLink ? (
            <Image
              alt={player.Player}
              width={200}
              height={200}
              unoptimized={true}
              src={player.picLink.fields.file.url}
              className="mx-auto h-48 w-48 rounded-full"
            />
          ) : (
            ""
          )}
          <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight">
            {player?.Player}
          </h3>
          <p>{player?.Apps} apps</p>
          <p>{player?.goals} goals</p>
          <p>
            <LinkButton
              text="View Profile"
              href={`/page/player/${player?.Player}`}
            ></LinkButton>
          </p>
        </li>
      ))}
    </ul>
  );
}
